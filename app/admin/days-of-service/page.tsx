"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, hasPermission } from "@/hooks/use-current-user";
import DayOfServiceDialog from "@/components/admin/days-of-service/day-of-service-dialog";
import { DaysOfServiceDataTable } from "@/components/admin/days-of-service/days-of-service-data-table";
import { createColumns } from "@/components/admin/days-of-service/days-of-service-columns";
import type { DayOfService } from "@/types/days-of-service";

export default function DaysOfServicePage() {
  const [daysOfService, setDaysOfService] = useState<DayOfService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<DayOfService | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const canManage = hasPermission(user, "dos_admin");

  useEffect(() => {
    if (user !== null) {
      fetchDaysOfService();
    }
  }, [user]);

  const fetchDaysOfService = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/days-of-service");
      if (!response.ok) throw new Error("Failed to fetch days of service");
      let data = await response.json();

      // Filter data based on user access
      if (user && !user.permissions.administrator) {
        data = data.filter((day: DayOfService) => {
          // If user has specific communities, filter by those
          if (user.communities && user.communities.length > 0) {
            return user.communities.includes(day.community_id);
          }
          // If user has specific cities, filter by those
          if (user.cities && user.cities.length > 0) {
            return user.cities.includes(day.city_id);
          }
          // If user has no cities or communities, show nothing
          return false;
        });
      }

      setDaysOfService(data);
    } catch (error) {
      console.error("Error fetching days of service:", error);
      toast({
        title: "Error",
        description: "Failed to load days of service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLock = async (dayId: string, currentLockState: boolean) => {
    if (!canManage) return;

    try {
      const response = await fetch(`/api/days-of-service/${dayId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_locked: !currentLockState }),
      });

      if (!response.ok) throw new Error("Failed to update lock status");

      toast({
        title: "Success",
        description: `Day of service ${
          !currentLockState ? "locked" : "unlocked"
        } successfully`,
      });

      fetchDaysOfService();
    } catch (error) {
      console.error("Error toggling lock:", error);
      toast({
        title: "Error",
        description: "Failed to update lock status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!dayToDelete) return;

    try {
      const response = await fetch(`/api/days-of-service/${dayToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete day of service");

      toast({
        title: "Success",
        description: "Day of service deleted successfully",
      });

      fetchDaysOfService();
      setDeleteDialogOpen(false);
      setDayToDelete(null);
    } catch (error) {
      console.error("Error deleting day of service:", error);
      toast({
        title: "Error",
        description: "Failed to delete day of service",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (day: DayOfService) => {
    setEditingDay(day);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingDay(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setIsDialogOpen(false);
    setEditingDay(null);
    if (shouldRefresh) {
      fetchDaysOfService();
    }
  };

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: (id) => {
      setDayToDelete(id);
      setDeleteDialogOpen(true);
    },
    onToggleLock: handleToggleLock,
    canManage,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Days of Service
              </CardTitle>
              <CardDescription className="mt-2">
                Manage and organize your community days of service
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New Day of Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DaysOfServiceDataTable
            columns={columns}
            data={daysOfService}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <DayOfServiceDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        initialData={editingDay}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the day
              of service and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDayToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
