import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/lib/s3-operations";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const prefix = (formData.get("prefix") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const key = prefix ? `${prefix}${file.name}` : file.name;
    const result = await uploadToS3(file, key);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
