"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Crown,
  Hammer,
  Pencil,
  HandHeart,
  School,
  MessageSquareText,
  Filter,
} from "lucide-react";

const PERMISSION_LABELS = {
  administrator: "Global Administrator",
  texting: "Texting",
  dos_admin: "Days of Service Admin",
  content_development: "Content Development",
  missionary_volunteer_management: "Missionary Volunteer Management",
  classes_admin: "Classes Admin",
} as const;

const PERMISSION_ICONS = {
  administrator: Crown,
  texting: MessageSquareText,
  dos_admin: Hammer,
  content_development: Pencil,
  missionary_volunteer_management: HandHeart,
  classes_admin: School,
} as const;

const PERMISSION_OPTIONS = [
  { value: "administrator", label: "Global Admin", icon: Crown },
  { value: "texting", label: "Texting", icon: MessageSquareText },
  { value: "dos_admin", label: "DOS Admin", icon: Hammer },
  { value: "content_development", label: "Content Dev", icon: Pencil },
  {
    value: "missionary_volunteer_management",
    label: "Volunteer Mgmt",
    icon: HandHeart,
  },
  { value: "classes_admin", label: "Classes Admin", icon: School },
];

export const columns: ColumnDef<User>[] = [
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
      const firstName = row.original.first_name || "";
      const lastName = row.original.last_name || "";
      return (
        <div className="font-medium">
          {`${firstName} ${lastName}`.trim() || "—"}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aLast = (rowA.original.last_name || "").toLowerCase();
      const bLast = (rowB.original.last_name || "").toLowerCase();
      if (aLast < bLast) return -1;
      if (aLast > bLast) return 1;
      const aFirst = (rowA.original.first_name || "").toLowerCase();
      const bFirst = (rowB.original.first_name || "").toLowerCase();
      if (aFirst < bFirst) return -1;
      if (aFirst > bFirst) return 1;
      return 0;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("email") || "—"}</div>
    ),
  },
  {
    accessorKey: "contact_number",
    header: "Phone",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("contact_number") || "—"}</div>
    ),
  },
  {
    accessorKey: "permissions",
    header: ({ column }) => {
      const filterValue = (column.getFilterValue() as string[]) || [];

      return (
        <div className="flex items-center gap-2">
          <span>Permissions</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
              >
                <Filter
                  className={`h-4 w-4 ${
                    filterValue.length > 0 ? "text-primary" : ""
                  }`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white w-64">
              <div className="p-2 space-y-1">
                {PERMISSION_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = filterValue.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => {
                        const newValue = isSelected
                          ? filterValue.filter((v) => v !== option.value)
                          : [...filterValue, option.value];
                        column.setFilterValue(
                          newValue.length > 0 ? newValue : undefined
                        );
                      }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm flex-1">{option.label}</span>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </div>
                  );
                })}
              </div>
              {filterValue.length > 0 && (
                <>
                  <div className="border-t my-1" />
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        column.setFilterValue(undefined);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => {
      const permissions = row.original.permissions;
      if (!permissions) return null;

      // If user is administrator, just show the crown
      if (permissions.administrator) {
        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Crown className="h-5 w-5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{PERMISSION_LABELS.administrator}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      }

      const activePermissions = Object.entries(permissions)
        .filter(([key, value]) => value && key !== "administrator")
        .map(([key]) => key);

      return (
        <TooltipProvider>
          <div className="flex flex-wrap gap-4">
            {activePermissions.map((permission) => {
              const Icon =
                PERMISSION_ICONS[permission as keyof typeof PERMISSION_ICONS];
              if (!Icon) return null;
              return (
                <Tooltip key={permission}>
                  <TooltipTrigger asChild>
                    <Icon className="h-5 w-5 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {
                        PERMISSION_LABELS[
                          permission as keyof typeof PERMISSION_LABELS
                        ]
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      );
    },
    filterFn: (row, id, value) => {
      const permissions = row.original.permissions;
      if (!permissions) return false;
      // value is an array of permission keys to filter by
      if (!value || value.length === 0) return true;
      return value.some(
        (v: string) => permissions[v as keyof typeof permissions]
      );
    },
  },
  {
    accessorKey: "cities",
    header: ({ column, table }) => {
      const filterValue = (column.getFilterValue() as string[]) || [];

      // Get all unique cities from ALL data (not just filtered/visible rows)
      const allCities = Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.flatMap((row) =>
              (row.original.cities_details || []).map(
                (city) => `${city.name}, ${city.state}`
              )
            )
        )
      ).sort();

      return (
        <div className="flex items-center gap-2">
          <span>Cities</span>
          {allCities.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <Filter
                    className={`h-4 w-4 ${
                      filterValue.length > 0 ? "text-primary" : ""
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-white w-64 max-h-80 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {allCities.map((city) => {
                    const isSelected = filterValue.includes(city);
                    return (
                      <div
                        key={city}
                        onClick={() => {
                          const newValue = isSelected
                            ? filterValue.filter((v) => v !== city)
                            : [...filterValue, city];
                          column.setFilterValue(
                            newValue.length > 0 ? newValue : undefined
                          );
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <span className="text-sm flex-1">{city}</span>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {filterValue.length > 0 && (
                  <>
                    <div className="border-t my-1" />
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.setFilterValue(undefined);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const cities = row.original.cities_details || [];
      return (
        <div className="flex flex-wrap gap-1">
          {cities.map((city) => (
            <Badge key={city.id} variant="outline" className="text-xs">
              {city.name}, {city.state}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const cities = row.original.cities_details || [];
      if (!value || value.length === 0) return true;
      return cities.some((city) =>
        value.includes(`${city.name}, ${city.state}`)
      );
    },
  },
  {
    accessorKey: "communities",
    header: ({ column, table }) => {
      const filterValue = (column.getFilterValue() as string[]) || [];

      // Get all unique communities from ALL data (not just filtered/visible rows)
      const allCommunities = Array.from(
        new Set(
          table
            .getCoreRowModel()
            .rows.flatMap((row) =>
              (row.original.communities_details || []).map(
                (community) => community.name
              )
            )
        )
      ).sort();

      return (
        <div className="flex items-center gap-2">
          <span>Communities</span>
          {allCommunities.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <Filter
                    className={`h-4 w-4 ${
                      filterValue.length > 0 ? "text-primary" : ""
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-white w-64 max-h-80 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {allCommunities.map((community) => {
                    const isSelected = filterValue.includes(community);
                    return (
                      <div
                        key={community}
                        onClick={() => {
                          const newValue = isSelected
                            ? filterValue.filter((v) => v !== community)
                            : [...filterValue, community];
                          column.setFilterValue(
                            newValue.length > 0 ? newValue : undefined
                          );
                        }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <span className="text-sm flex-1">{community}</span>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {filterValue.length > 0 && (
                  <>
                    <div className="border-t my-1" />
                    <div className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          column.setFilterValue(undefined);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
    cell: ({ row }) => {
      const communities = row.original.communities_details || [];
      return (
        <div className="flex flex-wrap gap-1">
          {communities.map((community) => (
            <Badge key={community.id} variant="outline" className="text-xs">
              {community.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const communities = row.original.communities_details || [];
      if (!value || value.length === 0) return true;
      return communities.some((community) => value.includes(community.name));
    },
  },
  {
    accessorKey: "last_active_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastActive = row.original.last_active_at;
      if (!lastActive) {
        return <span className="text-muted-foreground text-sm">Never</span>;
      }

      const date = new Date(lastActive);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      let displayText;
      if (diffInDays === 0) {
        displayText = "Today";
      } else if (diffInDays === 1) {
        displayText = "Yesterday";
      } else if (diffInDays < 7) {
        displayText = `${diffInDays} days ago`;
      } else {
        displayText = date.toLocaleDateString();
      }

      return (
        <span className="text-sm" title={date.toLocaleString()}>
          {displayText}
        </span>
      );
    },
  },
];
