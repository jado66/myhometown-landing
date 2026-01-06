"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDataTable } from "@/components/admin/users/user-data-table";
import { UserFormDialog } from "@/components/admin/users/user-form-dialog";
import { createColumns } from "@/components/admin/users/user-table-columns";
import type { User, UserFormData } from "@/types/user";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AlertCircle, AlertTriangle, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ManagementPage() {
  const {
    users,
    hasLoaded,
    loading,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handlePasswordReset,
    handleResendInvitation,
  } = useAdminUsers();

  const { impersonateUser } = useCurrentUser();

  const [showUserForm, setShowUserForm] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [showImpersonateConfirm, setShowImpersonateConfirm] =
    React.useState(false);
  const [userToImpersonate, setUserToImpersonate] = React.useState<User | null>(
    null
  );
  const [isImpersonatingLoading, setIsImpersonatingLoading] =
    React.useState(false);

  const handleCloseUserForm = () => {
    setShowUserForm(false);
    setUserToEdit(null);
  };

  const handleSubmitUser = async (userData: UserFormData) => {
    const result = await (userToEdit
      ? handleEditUser(userData)
      : handleAddUser(userData));

    if (result.success) {
      handleCloseUserForm();
    }

    return result;
  };

  const handleAskDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const result = await handleDeleteUser(userToDelete.id);
    if (result.success) {
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      handleCloseUserForm();
    }
  };

  const handleImpersonate = (user: User) => {
    setUserToImpersonate(user);
    setShowImpersonateConfirm(true);
  };

  const handleConfirmImpersonate = async () => {
    if (!userToImpersonate) return;

    setIsImpersonatingLoading(true);
    try {
      await impersonateUser(userToImpersonate.id, userToImpersonate.email);
      toast.success(
        `Now viewing as ${
          userToImpersonate.first_name || userToImpersonate.email
        }`
      );
      setShowImpersonateConfirm(false);
      setUserToImpersonate(null);
    } catch (error) {
      console.error("Impersonation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to impersonate user"
      );
    } finally {
      setIsImpersonatingLoading(false);
    }
  };

  // Create columns with impersonate handler
  const columns = React.useMemo(
    () => createColumns({ onImpersonate: handleImpersonate }),
    []
  );

  return (
    <div className="px-4 mx-auto py-10">
      <div className="text-center mb-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Admin User Management
          </p>
          <h1 className="text-3xl font-bold">Manage users and their roles</h1>
          <p className="text-base text-muted-foreground">
            Here you can add, remove, or edit users and their roles.
          </p>
        </div>
      </div>
      <div>
        <UserDataTable
          columns={columns}
          data={users}
          loading={!hasLoaded || loading}
          onRowClick={(user) => {
            if (loading) return;
            setUserToEdit(user);
            setShowUserForm(true);
          }}
          onAddClick={() => {
            if (loading) return;
            setUserToEdit(null);
            setShowUserForm(true);
          }}
        />
        {!loading && hasLoaded && users.length === 0 && (
          <div className="mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No users found. Click &quot;Add User&quot; to create your first
                user.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <UserFormDialog
        open={showUserForm}
        onClose={handleCloseUserForm}
        onSubmit={handleSubmitUser}
        initialData={userToEdit}
        onDelete={handleAskDeleteUser}
        onPasswordReset={handlePasswordReset}
        onResendInvitation={handleResendInvitation}
        loading={loading}
        allUsers={users}
      />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {userToDelete?.first_name} {userToDelete?.last_name}
              </strong>{" "}
              ({userToDelete?.email})?
              <br />
              <br />
              This action cannot be undone. The user will be permanently removed
              from the system and will lose access to the admin portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Confirmation Dialog */}
      <Dialog
        open={showImpersonateConfirm}
        onOpenChange={setShowImpersonateConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Impersonate User
            </DialogTitle>
            <DialogDescription>
              You are about to view the app as{" "}
              <strong>
                {userToImpersonate?.first_name} {userToImpersonate?.last_name}
              </strong>{" "}
              ({userToImpersonate?.email}).
              <br />
              <br />
              Your session will remain active. You can return to your account at
              any time by clicking the &quot;Stop&quot; button in the banner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowImpersonateConfirm(false);
                setUserToImpersonate(null);
              }}
              disabled={isImpersonatingLoading}
              className="hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmImpersonate}
              disabled={isImpersonatingLoading}
              className="text-white"
            >
              {isImpersonatingLoading ? "Loading..." : "View as User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
