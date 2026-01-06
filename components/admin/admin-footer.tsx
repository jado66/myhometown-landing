"use client";

import Link from "next/link";
import { MyHometownLogo } from "@/components/logo/my-hometown";

export function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 py-6 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MyHometownLogo type="dark-full" className="h-6 w-auto" />
          <span>© {currentYear} MyHometown Utah</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            Back to Site
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
