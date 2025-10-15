"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { UserDataTable } from "@/components/admin/users/user-data-table";
import { UserFormDialog } from "@/components/admin/users/user-form-dialog";
import { columns } from "@/components/admin/users/user-table-columns";
import type { User, UserFormData } from "@/types/user";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";
import { AlertCircle } from "lucide-react";

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

  const [showUserForm, setShowUserForm] = React.useState(false);
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);

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

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="text-center">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary uppercase tracking-wide">
              Admin User Management
            </p>
            <CardTitle className="text-3xl font-bold">
              Manage users and their roles
            </CardTitle>
            <CardDescription className="text-base">
              Here you can add, remove, or edit users and their roles.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
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
                  No users found. Click "Add User" to create your first user.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        open={showUserForm}
        onClose={handleCloseUserForm}
        onSubmit={handleSubmitUser}
        initialData={userToEdit}
        onDelete={handleAskDeleteUser}
        onPasswordReset={handlePasswordReset}
        onResendInvitation={handleResendInvitation}
        loading={loading}
      />
    </div>
  );
}
