import { NextRequest, NextResponse } from "next/server";
import { moveS3Object } from "@/lib/s3-operations";

export async function POST(request: NextRequest) {
  try {
    const { sourceKey, destinationPath } = await request.json();

    if (!sourceKey) {
      return NextResponse.json(
        { error: "Source key is required" },
        { status: 400 }
      );
    }

    // Extract filename from source key
    const filename = sourceKey.split("/").pop();
    const destinationKey = destinationPath
      ? `${destinationPath}${filename}`
      : filename;

    const result = await moveS3Object(sourceKey, destinationKey);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error moving file:", error);
    return NextResponse.json({ error: "Failed to move file" }, { status: 500 });
  }
}
