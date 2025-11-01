import { NextRequest, NextResponse } from "next/server";
import { createS3Folder } from "@/lib/s3-operations";

export async function POST(request: NextRequest) {
  try {
    const { folderPath } = await request.json();

    if (!folderPath) {
      return NextResponse.json(
        { error: "Folder path is required" },
        { status: 400 }
      );
    }

    const result = await createS3Folder(folderPath);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}
