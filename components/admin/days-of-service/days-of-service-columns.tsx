"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArrowUpDown,
  Lock,
  LockOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DayOfService } from "@/types/days-of-service";

interface ColumnsConfig {
  onEdit: (day: DayOfService) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string, currentState: boolean) => void;
  canManage: boolean;
}

export function createColumns(
  config: ColumnsConfig
): ColumnDef<DayOfService>[] {
  const { onEdit, onDelete, onToggleLock, canManage } = config;

  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return <div className="font-medium">{name || "Day of Service"}</div>;
      },
    },
    {
      accessorKey: "community_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Community
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{row.getValue("community_name") || "—"}</div>;
      },
    },
    {
      accessorKey: "city_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            City
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{row.getValue("city_name") || "—"}</div>;
      },
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("end_date") as string;
        return <div>{format(new Date(date), "MMM dd, yyyy")}</div>;
      },
    },
    {
      accessorKey: "check_in_location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("check_in_location") as string;
        return <div className="max-w-xs truncate">{location || "—"}</div>;
      },
    },
    {
      accessorKey: "is_locked",
      header: "Status",
      cell: ({ row }) => {
        const isLocked = row.getValue("is_locked") as boolean;
        return (
          <Badge variant={isLocked ? "secondary" : "default"} className="gap-1">
            {isLocked ? (
              <>
                <Lock className="h-3 w-3" />
                Locked
              </>
            ) : (
              <>
                <LockOpen className="h-3 w-3" />
                Active
              </>
            )}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        const isLocked = row.getValue(id) as boolean;
        return value === "locked" ? isLocked : !isLocked;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const day = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(day)}
                disabled={day.is_locked}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {canManage && (
                <DropdownMenuItem
                  onClick={() => onToggleLock(day.id, day.is_locked)}
                >
                  {day.is_locked ? (
                    <>
                      <LockOpen className="mr-2 h-4 w-4" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(day.id)}
                disabled={day.is_locked}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
