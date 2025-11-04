"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn } from "lucide-react";

interface ImageGalleryProps {
  urls: string[];
}

export function ImageGallery({ urls }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {urls.map((url, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(url)}
            className="relative aspect-square bg-muted rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-card/90 flex items-center justify-center mx-auto mb-2">
                  <ZoomIn className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground px-2">
                  Asset {index + 1}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 text-white hover:bg-white/20"
          >
            <Download className="h-6 w-6" />
          </Button>
          <div className="max-w-5xl w-full bg-card rounded-lg p-8">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center mx-auto">
                  <ZoomIn className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Image from: {selectedImage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
