import { NextRequest, NextResponse } from "next/server";
import { moveS3Object } from "@/lib/s3-operations";

export async function POST(request: NextRequest) {
  try {
    const { oldKey, newName } = await request.json();

    if (!oldKey || !newName) {
      return NextResponse.json(
        { error: "Old key and new name are required" },
        { status: 400 }
      );
    }

    // Extract the path and construct new key
    const pathParts = oldKey.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newKey = pathParts.join("/");

    const result = await moveS3Object(oldKey, newKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 }
    );
  }
}
