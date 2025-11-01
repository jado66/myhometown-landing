"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";
import type { FileItem } from "./s3-file-manager";

interface FileViewerProps {
  file: FileItem | null;
  onClose: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null;

  const isImage = file.mimeType?.startsWith("image/");
  const isVideo = file.mimeType?.startsWith("video/");
  const isPDF = file.mimeType?.includes("pdf");

  console.log("[FILE VIEWER]", {
    name: file.name,
    mimeType: file.mimeType,
    url: file.url,
    isImage,
    isVideo,
    isPDF,
  });

  const handleDownload = () => {
    if (file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (file.url) {
      window.open(file.url, "_blank");
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogTitle className="sr-only">
          {file.name}
        </DialogTitle>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold truncate flex-1">
              {file.name}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 bg-muted/20">
            {!file.url && (isImage || isVideo || isPDF) && (
              <div className="flex flex-col items-center justify-center min-h-full text-center p-8">
                <p className="text-red-500 mb-4">
                  File URL not available. Please refresh the page.
                </p>
                <Button onClick={onClose}>Close</Button>
              </div>
            )}

            {isImage && file.url && (
              <div className="flex items-center justify-center min-h-full">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Image failed to load:", file.url);
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.insertAdjacentHTML(
                      "beforeend",
                      '<p class="text-red-500">Failed to load image</p>'
                    );
                  }}
                />
              </div>
            )}

            {isVideo && file.url && (
              <div className="flex items-center justify-center min-h-full">
                <video
                  src={file.url}
                  controls
                  className="max-w-full max-h-full rounded-lg"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error("Video failed to load:", file.url);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {isPDF && file.url && (
              <iframe
                src={file.url}
                className="w-full h-full min-h-[600px] rounded-lg"
                title={file.name}
              />
            )}

            {!isImage && !isVideo && !isPDF && (
              <div className="flex flex-col items-center justify-center min-h-full text-center p-8">
                <p className="text-muted-foreground mb-4">
                  Preview not available for this file type
                </p>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-card">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Type: {file.mimeType || "Unknown"}</span>
              <span>
                Size:{" "}
                {file.size
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "Unknown"}
              </span>
              <span>
                Modified: {new Date(file.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
