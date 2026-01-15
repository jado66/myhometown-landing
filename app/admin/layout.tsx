"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminFooter } from "@/components/admin/admin-footer";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUser } from "@/contexts/user-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authUser, isLoading } = useUser();
  const { isImpersonating } = useCurrentUser();

  useEffect(() => {
    // Wait for auth state to load
    if (isLoading) return;

    // If no authenticated user and not impersonating, redirect to login
    if (!authUser && !isImpersonating) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authUser, isImpersonating, isLoading, router, pathname]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render admin layout if not authenticated
  if (!authUser && !isImpersonating) {
    return null;
  }

  // Adjust height when impersonation banner is showing (banner is 40px)
  const height = isImpersonating
    ? "h-[calc(100vh-4rem-40px)]"
    : "h-[calc(100vh-4rem)]";

  return (
    <div className={`flex ${height}`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
