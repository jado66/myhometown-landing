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
import { Badge } from "@/components/ui/badge";
import { getAllTags } from "@/lib/file-tags";
import { toast } from "sonner";
import { Tag, X, Loader2 } from "lucide-react";
import type { FileItem } from "./s3-file-manager";

interface TagManagerProps {
  file: FileItem | null;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export function TagManager({ file, onClose, onTagsUpdated }: TagManagerProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  const allTags = getAllTags();

  useEffect(() => {
    if (file) {
      loadFileTags();
    } else {
      setSelectedTags([]);
    }
  }, [file]);

  const loadFileTags = async () => {
    if (!file) return;

    try {
      setLoadingTags(true);
      const response = await fetch(
        `/api/s3/tags?key=${encodeURIComponent(file.id)}`
      );
      if (!response.ok) throw new Error("Failed to load tags");

      const data = await response.json();
      setSelectedTags(data.tags || []);
    } catch (error) {
      console.error("Error loading tags:", error);
      // Don't show error if file has no tags
      setSelectedTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 10) {
        toast.error("Maximum 10 tags allowed per file");
        return;
      }
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (!file) return;

    try {
      setLoading(true);

      if (selectedTags.length === 0) {
        // Remove all tags
        const response = await fetch(
          `/api/s3/tags?key=${encodeURIComponent(file.id)}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) throw new Error("Failed to remove tags");
      } else {
        // Set tags
        const response = await fetch("/api/s3/tags", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: file.id,
            tags: selectedTags,
          }),
        });

        if (!response.ok) throw new Error("Failed to save tags");
      }

      toast.success("Tags updated successfully");
      onTagsUpdated();
      onClose();
    } catch (error) {
      console.error("Error saving tags:", error);
      toast.error("Failed to save tags");
    } finally {
      setLoading(false);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Manage Tags - {file.name}
          </DialogTitle>
          <DialogDescription>
            Select up to 10 tags to categorize this file.
          </DialogDescription>
        </DialogHeader>

        {loadingTags ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <h4 className="mb-3 text-sm font-medium">
                Selected Tags ({selectedTags.length}/10)
              </h4>
              <div className="flex min-h-[60px] flex-wrap gap-2 rounded-md border border-border bg-muted/30 p-3">
                {selectedTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tags selected
                  </p>
                ) : (
                  selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer gap-1"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-medium">Available Tags</h4>
              <div className="flex max-h-[300px] flex-wrap gap-2 overflow-y-auto rounded-md border border-border bg-background p-3">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || loadingTags}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Tags
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
