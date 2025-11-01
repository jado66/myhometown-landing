import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import {
  ListObjectsV2Command,
  GetObjectTaggingCommand,
} from "@aws-sdk/client-s3";
import { supabaseServer } from "@/util/supabase-server";

// POST: Sync all S3 tags to database (one-time migration)
export async function POST(request: NextRequest) {
  try {
    console.log("Starting tag sync from S3 to database...");

    // List all objects in S3
    let continuationToken: string | undefined;
    let totalFiles = 0;
    let totalTags = 0;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      const objects = response.Contents || [];

      console.log(`Processing batch of ${objects.length} objects...`);

      for (const obj of objects) {
        // Skip folders
        if (obj.Key?.endsWith("/")) continue;

        try {
          // Get tags for this object
          const tagCommand = new GetObjectTaggingCommand({
            Bucket: BUCKET_NAME,
            Key: obj.Key!,
          });

          const tagResponse = await s3Client.send(tagCommand);
          const tags = tagResponse.TagSet?.map((tag) => tag.Value || "") || [];

          if (tags.length > 0) {
            // Delete existing tags for this file
            await supabaseServer
              .from("file_tags")
              .delete()
              .eq("file_key", obj.Key!);

            // Insert new tags
            const tagRecords = tags.map((tag: string) => ({
              file_key: obj.Key!,
              tag: tag,
            }));

            const { error: insertError } = await supabaseServer
              .from("file_tags")
              .insert(tagRecords);

            if (insertError) {
              console.error(
                `Error inserting tags for ${obj.Key}:`,
                insertError
              );
            } else {
              totalTags += tags.length;
            }
          }

          totalFiles++;
        } catch (error) {
          // No tags for this object, skip
          console.log(`No tags for ${obj.Key}`);
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(
      `Sync complete! Processed ${totalFiles} files, ${totalTags} tags`
    );

    return NextResponse.json({
      success: true,
      filesProcessed: totalFiles,
      tagssynced: totalTags,
    });
  } catch (error) {
    console.error("Error syncing tags:", error);
    return NextResponse.json({ error: "Failed to sync tags" }, { status: 500 });
  }
}
