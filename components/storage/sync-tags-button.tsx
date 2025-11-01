"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";

export function SyncTagsButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      toast.info("Syncing tags from S3 to database...");

      const response = await fetch("/api/s3/sync-tags", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to sync tags");

      const data = await response.json();
      toast.success(
        `Synced ${data.tagssynced} tags from ${data.filesProcessed} files!`
      );
    } catch (error) {
      console.error("Error syncing tags:", error);
      toast.error("Failed to sync tags");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      title="Sync S3 tags to database for faster searching"
    >
      {syncing ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {syncing ? "Syncing..." : "Sync Tags"}
    </Button>
  );
}
