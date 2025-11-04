"use client";

import type React from "react";
import type { FileItem } from "./s3-file-manager";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Copy,
  Edit,
  Move,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

interface FileActionsMenuProps {
  file: FileItem;
  onDelete: (id: string) => void;
  onRename: (item: FileItem) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  onLock?: (fileId: string, fileName: string) => void;
  onUnlock?: (fileId: string, fileName: string) => void;
  onHide?: (fileId: string, fileName: string) => void;
  onUnhide?: (fileId: string, fileName: string) => void;
  onManageTags?: (file: FileItem) => void;
  allFolders: FileItem[];
  className?: string;
}

export function FileActionsMenu({
  file,
  onDelete,
  onRename,
  onMove,
  onLock,
  onUnlock,
  onHide,
  onUnhide,
  onManageTags,
  allFolders,
  className,
}: FileActionsMenuProps) {
  // Check if file is locked or hidden
  const isLocked = file.status === "locked";
  const isHidden = file.status === "hidden";
  const hasStatus = isLocked || isHidden;

  const handleCopyLink = async () => {
    if (file.url) {
      try {
        await navigator.clipboard.writeText(file.url);
        // You can add a toast notification here if you have toast setup
        toast.success("Link copied to clipboard");
        console.log("Link copied to clipboard");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900">
        {/* Manage Tags - available for files only */}
        {file.type === "file" && !file.isShortcut && onManageTags && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onManageTags(file);
              }}
            >
              <Tag className="mr-2 h-4 w-4" />
              Manage Tags
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {/* Only show Rename and Move if not locked or hidden */}
        {!hasStatus && (
          <>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRename(file);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        )}
        {(file.type === "file" || file.type === "folder") &&
          !file.isShortcut && (
            <>
              {!file.status ? (
                // No status - show Lock option
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onLock) onLock(file.id, file.name);
                  }}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Lock {file.type === "folder" ? "Folder" : "File"}
                </DropdownMenuItem>
              ) : file.status === "locked" ? (
                // Locked - show Hide and Unlock options
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onHide) onHide(file.id, file.name);
                    }}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Hide {file.type === "folder" ? "Folder" : "File"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUnlock) onUnlock(file.id, file.name);
                    }}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock {file.type === "folder" ? "Folder" : "File"}
                  </DropdownMenuItem>
                </>
              ) : (
                // Hidden - show Unhide option
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUnhide) onUnhide(file.id, file.name);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Unhide {file.type === "folder" ? "Folder" : "File"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
        {/* Only show Download, Share, Copy Link if not locked or hidden */}
        {!hasStatus && (
          <>
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>

            {file.type === "file" && file.url && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
          </>
        )}
        {/* Only show Delete if not locked or hidden */}
        {!hasStatus && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(file.id);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
