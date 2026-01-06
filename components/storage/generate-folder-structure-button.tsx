"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FolderTree, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FolderGenerationResult {
  success: boolean;
  foldersCreated: number;
  folders: string[];
  errors?: { folder: string; error: string }[];
}

export function GenerateFolderStructureButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<FolderGenerationResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/s3/generate-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate folder structure");
      }

      setResult(data);

      toast.success(`Successfully created ${data.foldersCreated} folders`);
    } catch (error) {
      console.error("Error generating folder structure:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate folder structure"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    setIsDialogOpen(false);
    handleGenerate();
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FolderTree className="h-4 w-4" />
            Generate Utah Folder Structure
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Utah Folder Structure</DialogTitle>
            <DialogDescription>
              This will create a folder structure in S3 for all Utah cities and
              communities:
              <br />
              <br />
              <code className="text-xs bg-muted p-2 rounded block">
                Utah/
                <br />
                └── [City Name]/
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;└── [Community Name]/
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── Website
                Media/
              </code>
              <br />
              This will create folders for all visible cities in Utah and their
              associated communities.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div
                className={`flex items-center gap-2 p-4 rounded-lg ${
                  result.errors && result.errors.length > 0
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-green-50 dark:bg-green-900/20"
                }`}
              >
                {result.errors && result.errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                <div>
                  <p className="font-medium">
                    {result.foldersCreated} folders created successfully
                  </p>
                  {result.errors && result.errors.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {result.errors.length} errors occurred
                    </p>
                  )}
                </div>
              </div>

              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm mb-2">Created Folders:</h4>
                  {result.folders.map((folder, index) => (
                    <div
                      key={index}
                      className="text-xs font-mono bg-muted p-2 rounded"
                    >
                      {folder}
                    </div>
                  ))}

                  {result.errors && result.errors.length > 0 && (
                    <>
                      <h4 className="font-medium text-sm mb-2 mt-4 text-yellow-600 dark:text-yellow-400">
                        Errors:
                      </h4>
                      {result.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded"
                        >
                          <div>{error.folder}</div>
                          <div className="text-red-600 dark:text-red-400 mt-1">
                            {error.error}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          <DialogFooter>
            {!result && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={isGenerating}>
                  {isGenerating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
