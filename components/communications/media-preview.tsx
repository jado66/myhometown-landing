"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  name: string;
  url: string;
  preview: string;
  type: string;
  size: number;
}

interface MediaPreviewProps {
  files: MediaFile[];
  onRemove?: (index: number) => void;
  showRemove?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export function MediaPreview({ files, onRemove, showRemove = false }: MediaPreviewProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {files.map((file, index) => (
        <div key={file.id || index} className="relative inline-block group">
          {file.type.startsWith("image/") ? (
            <img
              src={file.preview}
              alt={file.name || `Media ${index + 1}`}
              className="w-[150px] h-[150px] object-cover rounded-md border border-border"
            />
          ) : (
            <div className="w-[150px] h-[150px] flex items-center justify-center bg-muted rounded-md border border-border">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {file.name}
                </div>
              </div>
            </div>
          )}
          
          {file.size > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-2 text-center rounded-b-md">
              {formatFileSize(file.size)}
            </div>
          )}
          
          {showRemove && onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
