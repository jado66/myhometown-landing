"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Link2, CheckCircle2, AlertCircle } from "lucide-react";
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

interface ShortcutGenerationResult {
  success: boolean;
  shortcutsCreated: number;
  cities: number;
  communities: number;
}

export function GenerateShortcutsButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ShortcutGenerationResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/s3/generate-shortcuts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate shortcuts");
      }

      setResult(data);

      toast.success(`Successfully created ${data.shortcutsCreated} shortcuts`);
    } catch (error) {
      console.error("Error generating shortcuts:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate shortcuts"
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
            <Link2 className="h-4 w-4" />
            Generate Shortcuts
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Utah Shortcuts</DialogTitle>
            <DialogDescription>
              This will create organized shortcuts to all Utah cities and
              communities in S3:
              <br />
              <br />
              <code className="text-xs bg-muted p-2 rounded block">
                Cities/
                <br />
                ├── Salt Lake City.shortcut → Utah/Salt Lake City/
                <br />
                ├── Provo.shortcut → Utah/Provo/
                <br />
                └── ...
                <br />
                <br />
                Communities/
                <br />
                ├── Salt Lake City - Westside.shortcut
                <br />
                ├── Salt Lake City - Central.shortcut
                <br />
                └── ...
              </code>
              <br />
              Shortcuts will display the size and modification date of their
              target folders. Clicking a shortcut will navigate to the target
              location.
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium">
                    {result.shortcutsCreated} shortcuts created successfully
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.cities} cities · {result.communities} communities
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Shortcut folders created:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Cities/ ({result.cities} shortcuts)</li>
                  <li>
                    • Communities/ ({result.communities} shortcuts)
                  </li>
                </ul>
              </div>
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
                  {isGenerating ? "Generating..." : "Generate Shortcuts"}
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
