"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "./file-upload";
import { FileGrid } from "./file-grid";
import { FileList } from "./file-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Grid3x3,
  List,
  FolderPlus,
  Upload,
  RefreshCw,
  Settings,
  HardDrive,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GenerateFolderStructureButton } from "./generate-folder-structure-button";
import { GenerateShortcutsButton } from "./generate-shortcuts-button";

export type FileItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  lastModified: Date;
  url?: string;
  mimeType?: string;
  path: string;
  children?: FileItem[];
  isShortcut?: boolean;
  shortcutTarget?: string;
};

export function S3FileManager() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [renameName, setRenameName] = useState("");
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load files from S3 on mount and when path changes
  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const prefix =
        currentPath.length === 0 ? "" : currentPath.join("/") + "/";

      const response = await fetch(
        `/api/s3/list?prefix=${encodeURIComponent(prefix)}`
      );
      if (!response.ok) throw new Error("Failed to load files");

      const data = await response.json();
      setAllFiles(data.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
      toast.error("Failed to load files from S3");
      setAllFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentFiles = (): FileItem[] => {
    // Files are already filtered by the API based on the current path
    return allFiles;
  };

  const calculateFolderSize = async (folderKey: string): Promise<number> => {
    try {
      // For folders, we need to calculate size by listing all contents
      const response = await fetch(
        `/api/s3/folder-size?key=${encodeURIComponent(folderKey)}`
      );
      if (!response.ok) return 0;
      const data = await response.json();
      return data.size || 0;
    } catch (error) {
      console.error("Error calculating folder size:", error);
      return 0;
    }
  };

  const calculateTotalSize = (): number => {
    return allFiles.reduce((total, item) => total + (item.size || 0), 0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const files = getCurrentFiles();
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For folders, we'll show a loading state for size initially
  // and it will be calculated on the server when listing
  const filesWithSizes = filteredFiles;

  const handleUpload = async (uploadedFiles: File[]) => {
    try {
      const prefix =
        currentPath.length === 0 ? "" : currentPath.join("/") + "/";

      // Upload files to S3
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("prefix", prefix);

        const response = await fetch("/api/s3/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        return response.json();
      });

      await Promise.all(uploadPromises);

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);

      // Reload files
      await loadFiles();
      setShowUpload(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    }
  };

  const handleFolderClick = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  const handleShortcutClick = (targetPath: string) => {
    console.log("[SHORTCUT CLICK] Target path:", targetPath);
    // Parse the full target path and set the current path accordingly
    // Remove trailing slash and split by /
    const pathParts = targetPath.replace(/\/$/, "").split("/").filter(Boolean);
    console.log("[SHORTCUT CLICK] Path parts:", pathParts);
    setCurrentPath(pathParts);
  };

  const navigateToPath = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const prefix =
        currentPath.length === 0 ? "" : currentPath.join("/") + "/";
      const folderPath = prefix + newFolderName;

      const response = await fetch("/api/s3/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderPath }),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      toast.success("Folder created successfully");

      await loadFiles();
      setNewFolderName("");
      setShowNewFolder(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleRename = async () => {
    if (!renameName.trim() || !renameItem) return;

    try {
      const response = await fetch("/api/s3/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldKey: renameItem.id,
          newName: renameName,
        }),
      });

      if (!response.ok) throw new Error("Failed to rename");

      toast.success("Item renamed successfully");

      await loadFiles();
      setRenameItem(null);
      setRenameName("");
    } catch (error) {
      console.error("Error renaming:", error);
      toast.error("Failed to rename item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: id }),
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Item deleted successfully");

      await loadFiles();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleMove = async (itemId: string, targetFolderId: string | null) => {
    try {
      const item = allFiles.find((f) => f.id === itemId);
      if (!item) return;

      const targetFolder = targetFolderId
        ? allFiles.find((f) => f.id === targetFolderId)
        : null;

      const targetPath = targetFolder
        ? targetFolder.id.endsWith("/")
          ? targetFolder.id
          : targetFolder.id + "/"
        : "";

      const response = await fetch("/api/s3/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceKey: itemId,
          destinationPath: targetPath,
        }),
      });

      if (!response.ok) throw new Error("Failed to move item");

      toast.success("Item moved successfully");

      await loadFiles();
    } catch (error) {
      console.error("Error moving item:", error);
      toast.error("Failed to move item");
    }
  };

  const handleRefresh = () => {
    loadFiles();
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <HardDrive className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                S3 Storage Manager
              </h1>
              <p className="text-sm text-muted-foreground">my-bucket-name</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {formatBytes(calculateTotalSize())}
              </span>{" "}
              used
            </div>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {currentPath.length > 0 && (
        <div className="border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2"
              onClick={() => navigateToPath(-1)}
            >
              <Home className="h-4 w-4" />
              Root
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
        </div>
      )}

      {/* Toolbar */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolder(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
            <GenerateFolderStructureButton />
            <GenerateShortcutsButton />
            <div className="ml-2 flex items-center gap-1 rounded-md border border-border p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-6">
        {showUpload ? (
          <FileUpload
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
          />
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading files...</p>
            </div>
          </div>
        ) : filesWithSizes.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                No files found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload files to get started
              </p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <FileGrid
                files={filesWithSizes}
                onDelete={handleDelete}
                onFolderClick={handleFolderClick}
                onShortcutClick={handleShortcutClick}
                onRename={(item) => {
                  setRenameItem(item);
                  setRenameName(item.name);
                }}
                onMove={handleMove}
                allFolders={allFiles.filter((f) => f.type === "folder")}
              />
            ) : (
              <FileList
                files={filesWithSizes}
                onDelete={handleDelete}
                onFolderClick={handleFolderClick}
                onShortcutClick={handleShortcutClick}
                onRename={(item) => {
                  setRenameItem(item);
                  setRenameName(item.name);
                }}
                onMove={handleMove}
                allFolders={allFiles.filter((f) => f.type === "folder")}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredFiles.length} items (
            {filteredFiles.filter((f) => f.type === "folder").length} folders,{" "}
            {filteredFiles.filter((f) => f.type === "file").length} files)
          </span>
          <span>
            Selected:{" "}
            {formatBytes(
              filesWithSizes.reduce((acc, f) => acc + (f.size || 0), 0)
            )}
          </span>
        </div>
      </footer>

      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={renameItem !== null}
        onOpenChange={(open) => !open && setRenameItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {renameItem?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>Enter a new name</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename">Name</Label>
              <Input
                id="rename"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
