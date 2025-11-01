import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "./s3-client";

export interface S3Object {
  key: string;
  size?: number;
  lastModified?: Date;
  isFolder: boolean;
}

// List objects in a specific prefix (folder)
export async function listS3Objects(prefix: string = ""): Promise<S3Object[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
    });

    const response = await s3Client.send(command);
    const objects: S3Object[] = [];

    // Add folders (CommonPrefixes)
    if (response.CommonPrefixes) {
      for (const prefix of response.CommonPrefixes) {
        if (prefix.Prefix) {
          objects.push({
            key: prefix.Prefix,
            isFolder: true,
          });
        }
      }
    }

    // Add files (Contents)
    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key && obj.Key !== prefix) {
          // Exclude the prefix itself
          objects.push({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
            isFolder: false,
          });
        }
      }
    }

    return objects;
  } catch (error) {
    console.error("Error listing S3 objects:", error);
    throw error;
  }
}

// Upload a file to S3
export async function uploadToS3(
  file: File,
  key: string
): Promise<{ success: boolean; key: string }> {
  try {
    const buffer = await file.arrayBuffer();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    });

    await s3Client.send(command);
    return { success: true, key };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
}

// Delete an object from S3
export async function deleteFromS3(key: string): Promise<{ success: boolean }> {
  try {
    // Check if it's a folder (ends with /)
    if (key.endsWith("/")) {
      return await deleteFolderRecursively(key);
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw error;
  }
}

// Delete a folder and all its contents recursively
async function deleteFolderRecursively(
  folderKey: string
): Promise<{ success: boolean }> {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: folderKey,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return { success: true };
    }

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: listedObjects.Contents.map((item) => ({ Key: item.Key })),
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3Client.send(deleteCommand);

    // If there are more objects to delete (pagination), continue
    if (listedObjects.IsTruncated) {
      await deleteFolderRecursively(folderKey);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting folder recursively:", error);
    throw error;
  }
}

// Create a folder in S3 (by creating an empty object with trailing /)
export async function createS3Folder(
  folderPath: string
): Promise<{ success: boolean }> {
  try {
    const key = folderPath.endsWith("/") ? folderPath : `${folderPath}/`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: "",
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("Error creating S3 folder:", error);
    throw error;
  }
}

// Move/rename an object in S3
export async function moveS3Object(
  sourceKey: string,
  destinationKey: string
): Promise<{ success: boolean }> {
  try {
    // Copy the object
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    });
    await s3Client.send(copyCommand);

    // Delete the original
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: sourceKey,
    });
    await s3Client.send(deleteCommand);

    return { success: true };
  } catch (error) {
    console.error("Error moving S3 object:", error);
    throw error;
  }
}

// Get a presigned URL for downloading
export async function getDownloadUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
}

// Get object metadata
export async function getObjectMetadata(key: string) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    return {
      size: response.ContentLength,
      lastModified: response.LastModified,
      contentType: response.ContentType,
    };
  } catch (error) {
    console.error("Error getting object metadata:", error);
    throw error;
  }
}
