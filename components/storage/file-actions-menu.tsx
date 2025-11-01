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
} from "lucide-react";

interface FileActionsMenuProps {
  file: FileItem;
  onDelete: (id: string) => void;
  onRename: (item: FileItem) => void;
  onMove: (itemId: string, targetFolderId: string | null) => void;
  allFolders: FileItem[];
  className?: string;
}

export function FileActionsMenu({
  file,
  onDelete,
  onRename,
  onMove,
  allFolders,
  className,
}: FileActionsMenuProps) {
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
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onRename(file);
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Move className="mr-2 h-4 w-4" />
            Move to
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-white dark:bg-gray-900">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMove(file.id, null);
              }}
            >
              Root Folder
            </DropdownMenuItem>
            {allFolders
              .filter((f) => f.id !== file.id)
              .map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(file.id, folder.id);
                  }}
                >
                  {folder.name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
