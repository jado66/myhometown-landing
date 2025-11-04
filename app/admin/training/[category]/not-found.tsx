import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
          <FolderX className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Category Not Found
          </h1>
          <p className="text-muted-foreground">
            The training category you're looking for doesn't exist.
          </p>
        </div>
        <Link href="/">
          <Button>Back to Training Materials</Button>
        </Link>
      </div>
    </div>
  );
}
