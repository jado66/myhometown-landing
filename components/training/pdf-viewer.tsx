"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface PDFViewerProps {
  url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Use the PDF controls below to navigate, zoom, and download
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      {/* PDF Display */}
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <iframe
          src={url}
          className="w-full h-[800px] border-0"
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
