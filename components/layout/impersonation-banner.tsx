"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { UserCog, X } from "lucide-react";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { user, isImpersonating, stopImpersonation } = useCurrentUser();

  const handleStopImpersonation = async () => {
    await stopImpersonation();
    toast.success("Returned to your account");
  };

  if (!isImpersonating || !user) {
    return null;
  }

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user.email;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
      <UserCog className="h-4 w-4 flex-shrink-0" />
      <span>
        Viewing as <strong>{displayName}</strong>
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStopImpersonation}
        className="h-6 px-2 text-white hover:bg-amber-600 hover:text-white"
      >
        <X className="h-3 w-3 mr-1" />
        Stop
      </Button>
    </div>
  );
}
