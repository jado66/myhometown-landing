"use client";

import { useUser, hasPermission, hasAnyPermission } from "@/contexts/user-context";

// Re-export for backward compatibility
export const useCurrentUser = useUser;
export { hasPermission, hasAnyPermission };
