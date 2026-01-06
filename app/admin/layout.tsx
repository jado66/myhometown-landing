"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminFooter } from "@/components/admin/admin-footer";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isImpersonating } = useCurrentUser();

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
