"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Paperclip, X, Image as ImageIcon, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MediaFile {
  file: File;
  preview: string;
}

interface MessageComposerProps {
  message: string;
  onMessageChange: (message: string) => void;
  media: MediaFile[];
  onMediaAdd: (files: MediaFile[]) => void;
  onMediaRemove: (index: number) => void;
  disabled?: boolean;
  maxLength?: number;
  maxMedia?: number;
  maxMediaSize?: number; // in MB
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};

export function MessageComposer({
  message,
  onMessageChange,
  media,
  onMediaAdd,
  onMediaRemove,
  disabled = false,
  maxLength = 1600,
  maxMedia = 10,
  maxMediaSize = 5,
}: MessageComposerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const characterCount = message.length;
  const segmentCount = Math.ceil(characterCount / 160);
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const newFiles: MediaFile[] = [];
    const maxSizeBytes = maxMediaSize * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxSizeBytes) {
        setUploadError(`File "${file.name}" exceeds ${maxMediaSize}MB limit`);
        continue;
      }

      // Check total media count
      if (media.length + newFiles.length >= maxMedia) {
        setUploadError(`Maximum ${maxMedia} media files allowed`);
        break;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newFiles.push({ file, preview });
    }

    if (newFiles.length > 0) {
      onMediaAdd(newFiles);
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveMedia = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(media[index].preview);
    onMediaRemove(index);
    setUploadError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose Message</CardTitle>
        <CardDescription>
          Write your message and attach media files (optional)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <div className="text-xs text-muted-foreground">
              <span className={cn(isNearLimit && "text-warning", isOverLimit && "text-destructive font-semibold")}>
                {characterCount}
              </span>
              /{maxLength} characters
              {segmentCount > 1 && (
                <span className="ml-2">
                  ({segmentCount} segment{segmentCount !== 1 ? "s" : ""})
                </span>
              )}
            </div>
          </div>
          <Textarea
            id="message"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            disabled={disabled}
            className="min-h-[150px] resize-none"
            maxLength={maxLength}
          />
          {segmentCount > 1 && (
            <p className="text-xs text-muted-foreground">
              Messages over 160 characters are sent as multiple segments
            </p>
          )}
        </div>

        <Separator />

        {/* Media Upload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Media Attachments</label>
            <Badge variant="secondary">
              {media.length}/{maxMedia}
            </Badge>
          </div>

          {/* Upload Button and Drag-Drop Zone */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-muted">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Images, videos, PDFs up to {maxMediaSize}MB each
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || media.length >= maxMedia}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Upload Error */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Media Preview Grid */}
          {media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg border bg-card overflow-hidden"
                >
                  {/* Preview */}
                  <div className="aspect-square flex items-center justify-center bg-muted p-2">
                    {isImageFile(item.file) ? (
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-center text-muted-foreground truncate max-w-full px-2">
                          {item.file.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-2 border-t bg-card">
                    <p className="text-xs truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveMedia(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Info Alert */}
          {media.length > 0 && (
            <Alert>
              <AlertDescription className="text-sm">
                Adding media converts your message to MMS. MMS rates apply (~$0.02 per
                message vs ~$0.0079 for SMS).
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
