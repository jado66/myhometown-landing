"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "./file-upload";
import { FileGrid } from "./file-grid";
import { FileList } from "./file-list";
import { FileViewer } from "./file-viewer";
import { TagManager } from "./tag-manager";
import { TagFilter } from "./tag-filter";
import { TaggedImagesSelect } from "./tagged-images-select";
import { CommunityImagesSelect } from "./community-images-select";
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
  Lock,
  Unlock,
  Image as ImageIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { GenerateFolderStructureButton } from "./generate-folder-structure-button";
import { GenerateShortcutsButton } from "./generate-shortcuts-button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
  status?: "locked" | "hidden";
  tags?: string[];
};

export function S3FileManager() {
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "shared-storage-view-mode",
    "grid"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [renameName, setRenameName] = useState("");
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingFile, setViewingFile] = useState<FileItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);
  const [fileStatuses, setFileStatuses] = useState<
    Map<string, "locked" | "hidden">
  >(new Map());
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagManagerFile, setTagManagerFile] = useState<FileItem | null>(null);
  const [showImageSelect, setShowImageSelect] = useState(false);
  const [showCommunityImageSelect, setShowCommunityImageSelect] =
    useState(false);

  // Load files from S3 on mount and when path changes
  useEffect(() => {
    loadFiles();
    loadFileStatuses();
  }, [currentPath, selectedTags]);

  // Reset to page 1 when search query or path changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, currentPath, selectedTags]);

  const loadFileStatuses = async () => {
    try {
      const response = await fetch("/api/s3/file-lock");
      if (!response.ok) throw new Error("Failed to load file statuses");

      const data = await response.json();
      const statusMap = new Map<string, "locked" | "hidden">();
      data.files.forEach((f: any) => {
        statusMap.set(f.file_key, f.status);
      });
      setFileStatuses(statusMap);
    } catch (error) {
      console.error("Error loading file statuses:", error);
      // Don't show error toast for this, as it's a background operation
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);

      // If tags are selected, use tag search instead
      if (selectedTags.length > 0) {
        const prefix =
          currentPath.length === 0 ? "" : currentPath.join("/") + "/";
        const response = await fetch(
          `/api/s3/search-by-tags?tags=${encodeURIComponent(
            selectedTags.join(",")
          )}&prefix=${encodeURIComponent(prefix)}`
        );
        if (!response.ok) throw new Error("Failed to search by tags");

        const data = await response.json();
        const files = data.files || [];

        // Mark files with their status from fileStatuses map
        const filesWithStatus = files.map((file: FileItem) => ({
          ...file,
          status: fileStatuses.get(file.id),
        }));

        setAllFiles(filesWithStatus);
      } else {
        // Normal file listing
        const prefix =
          currentPath.length === 0 ? "" : currentPath.join("/") + "/";

        const response = await fetch(
          `/api/s3/list?prefix=${encodeURIComponent(prefix)}`
        );
        if (!response.ok) throw new Error("Failed to load files");

        const data = await response.json();
        const files = data.files || [];

        // Mark files with their status from fileStatuses map
        const filesWithStatus = files.map((file: FileItem) => ({
          ...file,
          status: fileStatuses.get(file.id),
        }));

        setAllFiles(filesWithStatus);
      }
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
    // Filter out unwanted file types
    let filtered = allFiles.filter((file) => {
      // Always show shortcuts
      if (file.isShortcut) return true;

      // Filter out files with unwanted MIME types (but not folders)
      if (file.type === "file") {
        const mimeType = file.mimeType || "";
        const unwantedTypes = [
          "application/octet-stream",
          "application/x-msdownload",
          "application/x-executable",
          "application/x-binary",
        ];

        // Allow files without a MIME type (legacy files)
        if (!mimeType) return true;

        // Filter out unwanted types
        return !unwantedTypes.includes(mimeType);
      }

      return true;
    });

    // Filter out hidden files and folders if showHiddenFiles is false
    if (!showHiddenFiles) {
      filtered = filtered.filter((file) => file.status !== "hidden");
    }

    return filtered;
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  // For folders, we'll show a loading state for size initially
  // and it will be calculated on the server when listing
  const filesWithSizes = paginatedFiles;

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
    const item = allFiles.find((f) => f.id === id);
    if (item) {
      setDeleteItem(item);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    try {
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: deleteItem.id }),
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Item deleted successfully");

      await loadFiles();
      setDeleteItem(null);
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

  const handleLockFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch("/api/s3/file-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: fileId }),
      });

      if (!response.ok) throw new Error("Failed to lock file");

      toast.success(`${fileName} has been locked`);

      // Reload file statuses and refresh the file list
      await loadFileStatuses();
      await loadFiles();
    } catch (error) {
      console.error("Error locking file:", error);
      toast.error("Failed to lock file");
    }
  };

  const handleUnlockFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/s3/file-lock?fileKey=${encodeURIComponent(fileId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to unlock file");

      toast.success(`${fileName} has been unlocked`);

      // Reload file statuses and refresh the file list
      await loadFileStatuses();
      await loadFiles();
    } catch (error) {
      console.error("Error unlocking file:", error);
      toast.error("Failed to unlock file");
    }
  };

  const handleHideFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch("/api/s3/file-lock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: fileId, status: "hidden" }),
      });

      if (!response.ok) throw new Error("Failed to hide file");

      toast.success(`${fileName} has been hidden`);

      // Reload file statuses and refresh the file list
      await loadFileStatuses();
      await loadFiles();
    } catch (error) {
      console.error("Error hiding file:", error);
      toast.error("Failed to hide file");
    }
  };

  const handleUnhideFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch("/api/s3/file-lock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: fileId, status: "locked" }),
      });

      if (!response.ok) throw new Error("Failed to unhide file");

      toast.success(`${fileName} is now locked (no longer hidden)`);

      // Reload file statuses and refresh the file list
      await loadFileStatuses();
      await loadFiles();
    } catch (error) {
      console.error("Error unhiding file:", error);
      toast.error("Failed to unhide file");
    }
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
                myHometown Shared Storage
              </h1>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-gray-900"
              >
                <DropdownMenuLabel>Settings & Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowHiddenFiles(!showHiddenFiles)}
                  className="cursor-pointer"
                >
                  {showHiddenFiles ? (
                    <Unlock className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {showHiddenFiles ? "Hide Hidden Files" : "Show Hidden Files"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowImageSelect(true)}
                  className="cursor-pointer"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Test Image Select (Tag)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowCommunityImageSelect(true)}
                  className="cursor-pointer"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Test Community Images
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                  <GenerateFolderStructureButton />
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                  <GenerateShortcutsButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <TagFilter
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
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
                onFileClick={setViewingFile}
                onRename={(item) => {
                  setRenameItem(item);
                  setRenameName(item.name);
                }}
                onMove={handleMove}
                onLock={handleLockFile}
                onUnlock={handleUnlockFile}
                onHide={handleHideFile}
                onUnhide={handleUnhideFile}
                onManageTags={setTagManagerFile}
                allFolders={allFiles.filter((f) => f.type === "folder")}
              />
            ) : (
              <FileList
                files={filesWithSizes}
                onDelete={handleDelete}
                onFolderClick={handleFolderClick}
                onShortcutClick={handleShortcutClick}
                onFileClick={setViewingFile}
                onRename={(item) => {
                  setRenameItem(item);
                  setRenameName(item.name);
                }}
                onMove={handleMove}
                onLock={handleLockFile}
                onUnlock={handleUnlockFile}
                onHide={handleHideFile}
                onUnhide={handleUnhideFile}
                onManageTags={setTagManagerFile}
                allFolders={allFiles.filter((f) => f.type === "folder")}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(1);
                            }}
                            className="cursor-pointer"
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {currentPage > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {/* Page numbers around current page */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === currentPage ||
                          page === currentPage - 1 ||
                          page === currentPage + 1 ||
                          page === currentPage - 2 ||
                          page === currentPage + 2
                      )
                      .filter((page) => page > 0 && page <= totalPages)
                      .map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages);
                            }}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
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
            {totalPages > 1 && (
              <span className="ml-2">
                • Page {currentPage} of {totalPages}
              </span>
            )}
          </span>
          <span>
            Total size:{" "}
            {formatBytes(
              filteredFiles.reduce((acc, f) => acc + (f.size || 0), 0)
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

      <Dialog
        open={deleteItem !== null}
        onOpenChange={(open) => !open && setDeleteItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteItem?.name}</span>?
              {deleteItem?.type === "folder" &&
                " This will delete the folder and all of its contents."}{" "}
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FileViewer file={viewingFile} onClose={() => setViewingFile(null)} />

      <TagManager
        file={tagManagerFile}
        onClose={() => setTagManagerFile(null)}
        onTagsUpdated={loadFiles}
      />

      <TaggedImagesSelect
        tag="Event Photo"
        open={showImageSelect}
        onClose={() => setShowImageSelect(false)}
        onSelect={(url) => {
          toast.success(`Selected image: ${url}`);
        }}
      />

      <CommunityImagesSelect
        city="Ogden"
        community="South"
        open={showCommunityImageSelect}
        onClose={() => setShowCommunityImageSelect(false)}
        onSelect={(url) => {
          toast.success(`Selected community image: ${url}`);
        }}
      />
    </div>
  );
}
