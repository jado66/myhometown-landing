import { NextRequest, NextResponse } from "next/server";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import {
  GetObjectTaggingCommand,
  PutObjectTaggingCommand,
  DeleteObjectTaggingCommand,
} from "@aws-sdk/client-s3";
import { isValidTag } from "@/lib/file-tags";
import { supabaseServer } from "@/util/supabase-server";

// GET: Get tags for a file
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Get tags from database (much faster than S3)
    const { data, error } = await supabaseServer
      .from("file_tags")
      .select("tag")
      .eq("file_key", key);

    if (error) {
      console.error("Error getting tags from database:", error);
      // Fallback to S3 if database fails
      const command = new GetObjectTaggingCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      const response = await s3Client.send(command);
      const tags = response.TagSet?.map((tag) => tag.Value) || [];
      return NextResponse.json({ tags });
    }

    const tags = data?.map((row) => row.tag) || [];
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error getting tags:", error);
    return NextResponse.json({ error: "Failed to get tags" }, { status: 500 });
  }
}

// POST: Add tags to a file
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, tags } = body;

    if (!key || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Key and tags array are required" },
        { status: 400 }
      );
    }

    // Validate tags
    const invalidTags = tags.filter((tag) => !isValidTag(tag));
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(", ")}` },
        { status: 400 }
      );
    }

    // S3 allows up to 10 tags per object
    if (tags.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 tags allowed per file" },
        { status: 400 }
      );
    }

    // Convert tags to S3 TagSet format
    const tagSet = tags.map((tag: string, index: number) => ({
      Key: `tag${index}`,
      Value: tag,
    }));

    // Update S3 tags
    const command = new PutObjectTaggingCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Tagging: {
        TagSet: tagSet,
      },
    });

    await s3Client.send(command);

    // Update database cache
    // First, delete existing tags for this file
    await supabaseServer.from("file_tags").delete().eq("file_key", key);

    // Then insert new tags
    if (tags.length > 0) {
      const tagRecords = tags.map((tag: string) => ({
        file_key: key,
        tag: tag,
      }));

      const { error: insertError } = await supabaseServer
        .from("file_tags")
        .insert(tagRecords);

      if (insertError) {
        console.error("Error updating tags in database:", insertError);
        // Don't fail the request if database update fails
      }
    }

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error("Error setting tags:", error);
    return NextResponse.json({ error: "Failed to set tags" }, { status: 500 });
  }
}

// DELETE: Remove all tags from a file
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Delete from S3
    const command = new DeleteObjectTaggingCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    // Delete from database cache
    await supabaseServer.from("file_tags").delete().eq("file_key", key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tags:", error);
    return NextResponse.json(
      { error: "Failed to delete tags" },
      { status: 500 }
    );
  }
}
