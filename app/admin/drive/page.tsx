import { S3FileManager } from "@/components/storage/s3-file-manager";
import { Toaster } from "@/components/ui/toaster";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <S3FileManager />
      <Toaster />
    </div>
  );
}
