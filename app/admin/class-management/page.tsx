import { ClassBuilder } from "@/components/class-builder/class-builder";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <Link href="/signup">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Signup Page
            </Button>
          </Link>
        </div>
      </div>
      <ClassBuilder />
    </main>
  );
}
