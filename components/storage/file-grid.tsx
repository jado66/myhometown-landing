"use client";

import type React from "react";

import type { FileItem } from "./s3-file-manager";
import { Card } from "@/components/ui/card";
import { FileActionsMenu } from "./file-actions-menu";
import {
  File,
  Folder,
  ImageIcon,
  Video,
  Music,
  Archive,
  Link,
} from "lucide-react";

interface FileGridProps {
  files: FileItem[];
  onDelete: (id: string) => void;
  onFolderClick: (folderName: string) => void;
  onShortcutClick?: (targetPath: string) => void;
  onRename: (item: FileItem) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  allFolders: FileItem[];
}

function getFileIcon(file: FileItem) {
  if (file.type === "folder") {
    return <Folder className="h-8 w-8 text-accent" />;
  }

  const mimeType = file.mimeType || "";
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-primary" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-8 w-8 text-destructive" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-8 w-8 text-accent" />;
  }
  if (mimeType.includes("pdf") || mimeType.includes("document")) {
    return <File className="h-8 w-8 text-primary" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return <Archive className="h-8 w-8 text-muted-foreground" />;
  }
  return <File className="h-8 w-8 text-muted-foreground" />;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function FileGrid({
  files,
  onDelete,
  onFolderClick,
  onShortcutClick,
  onRename,
  onMove,
  allFolders,
}: FileGridProps) {
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData("fileId", fileId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    const fileId = e.dataTransfer.getData("fileId");
    if (fileId && fileId !== targetFolderId) {
      onMove(fileId, targetFolderId);
    }
  };

  const handleCardClick = (e: React.MouseEvent, file: FileItem) => {
    // Don't navigate if clicking on the dropdown menu button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    console.log(
      "[GRID CLICK] File:",
      file.name,
      "isShortcut:",
      file.isShortcut,
      "target:",
      file.shortcutTarget
    );

    // Handle shortcuts - navigate to target
    if (file.isShortcut && file.shortcutTarget) {
      console.log(
        "[GRID CLICK] Calling onShortcutClick with:",
        file.shortcutTarget
      );
      if (onShortcutClick) {
        onShortcutClick(file.shortcutTarget);
      }
      return;
    }

    if (file.type === "folder") {
      onFolderClick(file.name);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {files.map((file) => (
        <Card
          key={file.id}
          className={`group relative overflow-hidden transition-all hover:shadow-lg ${
            file.type === "folder" ? "cursor-pointer" : ""
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, file.id)}
          onDragOver={file.type === "folder" ? handleDragOver : undefined}
          onDrop={
            file.type === "folder" ? (e) => handleDrop(e, file.id) : undefined
          }
          onClick={(e) => handleCardClick(e, file)}
        >
          <div className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-muted p-3">{getFileIcon(file)}</div>
              <FileActionsMenu
                file={file}
                onDelete={onDelete}
                onRename={onRename}
                onMove={onMove}
                allFolders={allFolders}
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </div>
            <div className="space-y-1">
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
                {file.isShortcut && (
                  <Link className="ml-1 inline h-3 w-3 text-blue-500" />
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
