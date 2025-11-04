"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Check,
  Folder,
  ChevronRight,
} from "lucide-react";
import type { FileItem } from "./s3-file-manager";

interface CommunityImagesSelectProps {
  city: string;
  community: string;
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function CommunityImagesSelect({
  city,
  community,
  open,
  onClose,
  onSelect,
}: CommunityImagesSelectProps) {
  const [images, setImages] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    if (open && city && community) {
      setCurrentPath([]);
      loadCommunityImages();
    } else {
      setImages([]);
      setSelectedImage(null);
      setSearchQuery("");
      setCurrentPath([]);
    }
  }, [open, city, community]);

  useEffect(() => {
    if (open && city && community) {
      loadCommunityImages();
    }
  }, [currentPath]);

  const loadCommunityImages = async () => {
    try {
      setLoading(true);
      // Construct the path: Utah/City/Community/ + any subpath
      const basePath = `Utah/${city}/${community}/`;
      const fullPath =
        currentPath.length > 0
          ? basePath + currentPath.join("/") + "/"
          : basePath;

      const response = await fetch(
        `/api/s3/list?prefix=${encodeURIComponent(fullPath)}`
      );
      if (!response.ok) throw new Error("Failed to load community images");

      const data = await response.json();
      const files = data.files || [];

      // Show both folders and image files
      const filteredFiles = files.filter((file: FileItem) => {
        // Always show folders
        if (file.type === "folder") return true;

        // Show image files
        if (file.type === "file") {
          const mimeType = file.mimeType || "";
          return mimeType.startsWith("image/");
        }

        return false;
      });

      setImages(filteredFiles);
    } catch (error) {
      console.error("Error loading community images:", error);
      toast.error("Failed to load community images");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (file: FileItem): string => {
    // Use the URL from the file object if available (already includes presigned URL)
    if (file.url) {
      return file.url;
    }
    // Fallback: Construct the S3 URL for the image
    const bucket =
      process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "myhometown-storage";
    const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${file.id}`;
  };

  const handleSelect = () => {
    if (!selectedImage) return;
    if (selectedImage.type === "folder") {
      // Navigate into folder
      setCurrentPath([...currentPath, selectedImage.name]);
      setSelectedImage(null);
      return;
    }
    const url = getImageUrl(selectedImage);
    onSelect(url);
    onClose();
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
    setSelectedImage(null);
  };

  const navigateToPath = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
    setSelectedImage(null);
  };

  const filteredImages = images.filter((image) =>
    image.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Select Community Image - {city}, {community}
          </DialogTitle>
          <DialogDescription>
            Browse and select an image from {city}, {community}
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumb Navigation */}
        {currentPath.length > 0 && (
          <div className="flex items-center gap-2 text-sm border-b pb-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2"
              onClick={() => navigateToPath(-1)}
            >
              {city}, {community}
            </Button>
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => navigateToPath(index)}
                >
                  {path}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">
                No files found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search query"
                  : currentPath.length > 0
                  ? "This folder is empty"
                  : `No files available for ${city}, ${community}`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
              {filteredImages.map((image) => {
                const isSelected = selectedImage?.id === image.id;
                const isFolder = image.type === "folder";

                return (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary shadow-lg scale-105"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                    onClick={() =>
                      isFolder
                        ? handleFolderClick(image.name)
                        : setSelectedImage(image)
                    }
                    onDoubleClick={() => {
                      if (isFolder) {
                        handleFolderClick(image.name);
                      } else if (isSelected) {
                        handleSelect();
                      }
                    }}
                  >
                    <div className="aspect-square bg-muted relative">
                      {isFolder ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Folder className="h-16 w-16 text-primary" />
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(image)}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.error(
                              "Image failed to load:",
                              getImageUrl(image)
                            );
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      {isSelected && !isFolder && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary rounded-full p-2">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-card">
                      <p
                        className="text-xs font-medium truncate"
                        title={image.name}
                      >
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {image.size && image.size > 0
                          ? `${(image.size / 1024).toFixed(1)} KB`
                          : "Unknown size"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Image Info */}
        {selectedImage && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                {selectedImage.type === "folder" ? (
                  <Folder className="h-10 w-10 text-primary" />
                ) : (
                  <img
                    src={getImageUrl(selectedImage)}
                    alt={selectedImage.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{selectedImage.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedImage.type === "folder"
                    ? "Folder"
                    : selectedImage.size
                    ? `${(selectedImage.size / 1024).toFixed(1)} KB`
                    : "Unknown size"}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedImage}>
            {selectedImage?.type === "folder" ? "Open Folder" : "Select Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
