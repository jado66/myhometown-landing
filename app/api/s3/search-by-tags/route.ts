import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { getDownloadUrl } from "@/lib/s3-operations";
import type { FileItem } from "@/components/storage/s3-file-manager";
import { supabaseServer } from "@/util/supabase-server";

// GET: Search files by tags (FAST - using database index)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tagsParam = searchParams.get("tags");
    const prefix = searchParams.get("prefix") || "";

    if (!tagsParam) {
      return NextResponse.json(
        { error: "Tags parameter is required" },
        { status: 400 }
      );
    }

    const searchTags = tagsParam.split(",").map((t) => t.trim());

    // Query database for files with matching tags (super fast!)
    const { data, error } = await supabaseServer
      .from("file_tags")
      .select("file_key, tag")
      .in("tag", searchTags);

    if (error) {
      console.error("Error searching tags in database:", error);
      return NextResponse.json(
        { error: "Failed to search by tags" },
        { status: 500 }
      );
    }

    // Group tags by file_key
    const fileTagsMap = new Map<string, string[]>();
    data?.forEach((row) => {
      if (!fileTagsMap.has(row.file_key)) {
        fileTagsMap.set(row.file_key, []);
      }
      fileTagsMap.get(row.file_key)!.push(row.tag);
    });

    // Filter by prefix if provided
    const matchedFiles: FileItem[] = [];

    for (const [fileKey, fileTags] of fileTagsMap.entries()) {
      // Skip files not in the current prefix
      if (prefix && !fileKey.startsWith(prefix)) continue;

      // Skip folders (keys ending with /)
      if (fileKey.endsWith("/")) continue;

      try {
        // Get file metadata from S3 (only for matched files - much faster!)
        const headCommand = new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey,
        });

        const headResponse = await s3Client.send(headCommand);
        const name = fileKey.split("/").pop() || fileKey;
        const url = await getDownloadUrl(fileKey);

        matchedFiles.push({
          id: fileKey,
          name,
          type: "file",
          size: headResponse.ContentLength || 0,
          lastModified: headResponse.LastModified || new Date(),
          url,
          mimeType: headResponse.ContentType,
          path: fileKey,
          tags: fileTags,
        });
      } catch (error) {
        // File might have been deleted from S3 but still in database
        console.log(`File ${fileKey} not found in S3, skipping`);
      }
    }

    return NextResponse.json({
      files: matchedFiles,
      count: matchedFiles.length,
    });
  } catch (error) {
    console.error("Error searching by tags:", error);
    return NextResponse.json(
      { error: "Failed to search by tags" },
      { status: 500 }
    );
  }
}
