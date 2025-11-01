import { NextRequest, NextResponse } from "next/server";
import { listS3Objects, getDownloadUrl } from "@/lib/s3-operations";
import { getShortcutMetadata } from "@/lib/s3-shortcuts";
import type { FileItem } from "@/components/storage/s3-file-manager";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "";

    const objects = await listS3Objects(prefix);

    // Helper function to calculate folder size
    const calculateFolderSize = async (folderKey: string): Promise<number> => {
      try {
        const command = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: folderKey,
        });
        const response = await s3Client.send(command);

        let totalSize = 0;
        if (response.Contents) {
          for (const obj of response.Contents) {
            totalSize += obj.Size || 0;
          }
        }
        return totalSize;
      } catch (error) {
        console.error("Error calculating folder size:", error);
        return 0;
      }
    };

    // Convert S3 objects to FileItem format with folder sizes
    const filesPromises = objects.map(async (obj) => {
      const isFolder = obj.isFolder;
      const key = obj.key;
      const name = isFolder
        ? key.split("/").filter(Boolean).pop() || key
        : key.split("/").pop() || key;

      let size = obj.size;

      // Calculate folder size if it's a folder
      if (isFolder) {
        size = await calculateFolderSize(key);
      }

      // Check if this is a shortcut
      let shortcutTarget: string | undefined;
      let isShortcut = false;

      if (!isFolder && name.endsWith(".shortcut")) {
        const shortcutMeta = await getShortcutMetadata(key);
        console.log(`[SHORTCUT] ${name}:`, shortcutMeta);
        if (shortcutMeta) {
          isShortcut = true;
          shortcutTarget = shortcutMeta.targetPath;

          // Get size and lastModified from target if it's a folder shortcut
          if (shortcutMeta.type === "folder") {
            console.log(
              `[SHORTCUT] Calculating size for target: ${shortcutMeta.targetPath}`
            );
            const targetSize = await calculateFolderSize(
              shortcutMeta.targetPath
            );
            console.log(
              `[SHORTCUT] Target size: ${targetSize} bytes (${(
                targetSize /
                1024 /
                1024
              ).toFixed(2)} MB)`
            );
            size = targetSize;

            // For folders, get the lastModified from the first object in the folder
            try {
              const listCommand = new ListObjectsV2Command({
                Bucket: BUCKET_NAME,
                Prefix: shortcutMeta.targetPath,
                MaxKeys: 1,
              });
              const listResponse = await s3Client.send(listCommand);
              if (listResponse.Contents && listResponse.Contents.length > 0) {
                const firstObject = listResponse.Contents[0];
                if (firstObject.LastModified) {
                  obj.lastModified = firstObject.LastModified;
                }
              }
            } catch (e) {
              console.error(`[SHORTCUT] Error getting lastModified:`, e);
            }
          }
        }
      }

      // Generate download URL for files (but not for shortcut files)
      let url: string | undefined;
      if (!isFolder && !name.endsWith(".shortcut")) {
        try {
          url = await getDownloadUrl(key);
        } catch (error) {
          console.error(`Error generating URL for ${key}:`, error);
        }
      }

      return {
        id: key,
        name: name.replace(".shortcut", ""), // Remove .shortcut extension from display
        type: isFolder ? "folder" : "file",
        size: size,
        lastModified: obj.lastModified || new Date(),
        path: prefix || "/",
        mimeType: isFolder ? undefined : getMimeType(name),
        url,
        isShortcut,
        shortcutTarget,
      } as FileItem & { isShortcut?: boolean; shortcutTarget?: string };
    });

    const files = await Promise.all(filesPromises);

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    zip: "application/zip",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}
