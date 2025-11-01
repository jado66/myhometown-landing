import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./s3-client";

export interface S3Shortcut {
  shortcutPath: string; // Where the shortcut is stored
  targetPath: string; // Where it points to
  displayName: string;
  type: "file" | "folder";
  description?: string;
}

/**
 * Create a shortcut in S3
 * This creates a zero-byte object with custom metadata pointing to the target
 * Note: S3 metadata keys are automatically lowercased
 */
export async function createS3Shortcut(
  shortcut: S3Shortcut
): Promise<{ success: boolean }> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: shortcut.shortcutPath,
      Body: "",
      ContentType: "application/x-shortcut",
      Metadata: {
        shortcut: "true",
        targetpath: shortcut.targetPath, // Lowercase to match S3's automatic conversion
        displayname: shortcut.displayName,
        type: shortcut.type,
        description: shortcut.description || "",
      },
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error creating S3 shortcut:", error);
    throw error;
  }
}

/**
 * Check if an S3 object is a shortcut and return its metadata
 */
export async function getShortcutMetadata(
  key: string
): Promise<S3Shortcut | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const metadata = response.Metadata;

    console.log(`[GET SHORTCUT METADATA] Key: ${key}`);
    console.log(`[GET SHORTCUT METADATA] All metadata:`, metadata);

    if (metadata?.shortcut === "true") {
      const result = {
        shortcutPath: key,
        targetPath: metadata.targetpath || "", // S3 lowercases metadata keys
        displayName: metadata.displayname || key,
        type: (metadata.type as "file" | "folder") || "folder",
        description: metadata.description,
      };
      console.log(`[GET SHORTCUT METADATA] Parsed result:`, result);
      return result;
    }

    console.log(`[GET SHORTCUT METADATA] Not a shortcut (shortcut !== 'true')`);
    return null;
  } catch (error) {
    console.error("Error getting shortcut metadata:", error);
    return null;
  }
}

/**
 * Create organized shortcut collections for cities and communities
 */
export async function createOrganizedShortcuts(
  cities: Array<{ name: string; path: string }>,
  communities: Array<{ name: string; cityName: string; path: string }>
): Promise<{ success: boolean; created: number }> {
  const shortcuts: S3Shortcut[] = [];

  // Create Cities shortcuts
  for (const city of cities) {
    shortcuts.push({
      shortcutPath: `Shortcuts/Cities/${city.name}.shortcut`,
      targetPath: city.path,
      displayName: city.name,
      type: "folder",
      description: `Shortcut to ${city.name}`,
    });
  }

  // Create Communities shortcuts
  for (const community of communities) {
    shortcuts.push({
      shortcutPath: `Shortcuts/Communities/${community.name} (${community.cityName}).shortcut`,
      targetPath: community.path,
      displayName: `${community.name} (${community.cityName})`,
      type: "folder",
      description: `Shortcut to ${community.name} in ${community.cityName}`,
    });
  }

  let created = 0;
  for (const shortcut of shortcuts) {
    try {
      await createS3Shortcut(shortcut);
      created++;
    } catch (error) {
      console.error(
        `Failed to create shortcut ${shortcut.shortcutPath}:`,
        error
      );
    }
  }

  return { success: true, created };
}
