"use client";

import type React from "react";

import type { FileItem } from "./s3-file-manager";
import { FileActionsMenu } from "./file-actions-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  File,
  Folder,
  ImageIcon,
  Video,
  Music,
  Archive,
  Link,
} from "lucide-react";

interface FileListProps {
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
    return <Folder className="h-5 w-5 text-accent" />;
  }

  const mimeType = file.mimeType || "";
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-primary" />;
  }
  if (mimeType.startsWith("video/")) {
    return <Video className="h-5 w-5 text-destructive" />;
  }
  if (mimeType.startsWith("audio/")) {
    return <Music className="h-5 w-5 text-accent" />;
  }
  if (mimeType.includes("pdf") || mimeType.includes("document")) {
    return <File className="h-5 w-5 text-primary" />;
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed")) {
    return <Archive className="h-5 w-5 text-muted-foreground" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "-";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDate(date: Date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function FileList({
  files,
  onDelete,
  onFolderClick,
  onShortcutClick,
  onRename,
  onMove,
  allFolders,
}: FileListProps) {
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

  const handleRowClick = (e: React.MouseEvent, file: FileItem) => {
    // Don't navigate if clicking on the dropdown menu button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    console.log(
      "[LIST CLICK] File:",
      file.name,
      "isShortcut:",
      file.isShortcut,
      "target:",
      file.shortcutTarget
    );

    // Handle shortcuts - navigate to target
    if (file.isShortcut && file.shortcutTarget && onShortcutClick) {
      console.log(
        "[LIST CLICK] Calling onShortcutClick with:",
        file.shortcutTarget
      );
      onShortcutClick(file.shortcutTarget);
      return;
    }

    if (file.type === "folder") {
      onFolderClick(file.name);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.id}
              className={`group ${
                file.type === "folder" ? "cursor-pointer" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, file.id)}
              onDragOver={file.type === "folder" ? handleDragOver : undefined}
              onDrop={
                file.type === "folder"
                  ? (e) => handleDrop(e, file.id)
                  : undefined
              }
              onClick={(e) => handleRowClick(e, file)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    {getFileIcon(file)}
                  </div>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    {file.name}
                    {file.isShortcut && (
                      <Link className="h-3 w-3 text-blue-500" />
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(file.size)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(file.lastModified)}
              </TableCell>
              <TableCell>
                <FileActionsMenu
                  file={file}
                  onDelete={onDelete}
                  onRename={onRename}
                  onMove={onMove}
                  allFolders={allFolders}
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
