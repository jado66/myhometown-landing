"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Loader2 } from "lucide-react";

interface PPTViewerProps {
  url: string;
}

export function PPTViewer({ url }: PPTViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [viewerType, setViewerType] = useState<"office" | "google">("office");

  // Encode the URL for the viewers
  const encodedUrl = encodeURIComponent(url);

  // Microsoft Office Online viewer
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;

  // Google Docs viewer (fallback option)
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;

  const currentViewerUrl =
    viewerType === "office" ? officeViewerUrl : googleViewerUrl;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-muted p-3 rounded-lg flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            PowerPoint Viewer
          </span>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewerType(viewerType === "office" ? "google" : "office")
            }
          >
            Switch to {viewerType === "office" ? "Google" : "Office"} Viewer
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {/* PowerPoint Viewer */}
      <div
        className="relative bg-muted/30 rounded-lg overflow-hidden"
        style={{ minHeight: "600px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading presentation...
              </p>
            </div>
          </div>
        )}
        <iframe
          src={currentViewerUrl}
          className="w-full h-full border-0 rounded-lg"
          style={{ minHeight: "600px" }}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            console.error("Failed to load PowerPoint viewer");
          }}
          title="PowerPoint Presentation"
          allowFullScreen
        />
      </div>

      <div className="text-xs text-muted-foreground text-center">
        Using{" "}
        {viewerType === "office" ? "Microsoft Office Online" : "Google Docs"}{" "}
        viewer. If the presentation doesn't load, try switching viewers or
        downloading the file.
      </div>
    </div>
  );
}
