import { NextRequest, NextResponse } from "next/server";
import { deleteFromS3 } from "@/lib/s3-operations";

export async function DELETE(request: NextRequest) {
  try {
    const { key } = await request.json();

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const result = await deleteFromS3(key);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
