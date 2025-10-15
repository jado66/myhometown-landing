"use client";

import * as React from "react";
import type { User, UserFormData } from "@/types/user";

interface ActionResult {
  success: boolean;
  error?: string;
}

export function useAdminUsers() {
  const SYSTEM_USER_EMAIL = "system@unauthenticated.local";
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load users");
      const data: User[] = await res.json();
      // Filter out the system/unauthenticated placeholder account
      setUsers(data.filter((u) => u.email !== SYSTEM_USER_EMAIL));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (form: UserFormData): Promise<ActionResult> => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const created: User = await res.json();
      if (created.email !== SYSTEM_USER_EMAIL) {
        setUsers((prev) => [
          { ...created, cities_details: form.cities, communities_details: [] },
          ...prev,
        ]);
      }
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (form: UserFormData): Promise<ActionResult> => {
    if (!form.id) return { success: false, error: "Missing user id" };
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updated: User = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === updated.id
            ? {
                ...u,
                ...updated,
                cities_details: form.cities,
              }
            : u
        )
      );
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string): Promise<ActionResult> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (_user: User): Promise<ActionResult> => {
    // Placeholder for integration with auth provider / email service
    return { success: true };
  };

  const handleResendInvitation = async (_user: User): Promise<ActionResult> => {
    // Placeholder for integration with auth provider / invitation service
    return { success: true };
  };

  return {
    users,
    loading,
    hasLoaded,
    error,
    refresh: fetchUsers,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handlePasswordReset,
    handleResendInvitation,
  };
}

export type UseAdminUsersReturn = ReturnType<typeof useAdminUsers>;
