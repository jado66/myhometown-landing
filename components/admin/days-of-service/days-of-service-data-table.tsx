"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
}

export function DaysOfServiceDataTable<TData, TValue>({
  columns,
  data,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "end_date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [cityFilter, setCityFilter] = React.useState<string>("all");
  const [communityFilter, setCommunityFilter] = React.useState<string>("all");
  const [dateFrom, setDateFrom] = React.useState<string>("");
  const [dateTo, setDateTo] = React.useState<string>("");

  // Extract unique cities and communities from data
  const cities = React.useMemo(() => {
    const uniqueCities = Array.from(
      new Set(data.map((item: any) => item.city_name).filter(Boolean))
    ).sort();
    return uniqueCities;
  }, [data]);

  const communities = React.useMemo(() => {
    if (cityFilter === "all") {
      return Array.from(
        new Set(data.map((item: any) => item.community_name).filter(Boolean))
      ).sort();
    }
    return Array.from(
      new Set(
        data
          .filter((item: any) => item.city_name === cityFilter)
          .map((item: any) => item.community_name)
          .filter(Boolean)
      )
    ).sort();
  }, [data, cityFilter]);

  // Reset community filter when city changes
  React.useEffect(() => {
    if (cityFilter !== "all") {
      const filteredCommunities = data
        .filter((item: any) => item.city_name === cityFilter)
        .map((item: any) => item.community_name);
      if (!filteredCommunities.includes(communityFilter)) {
        setCommunityFilter("all");
      }
    }
  }, [cityFilter, data, communityFilter]);

  // Apply custom filters to data
  const filteredData = React.useMemo(() => {
    return data.filter((item: any) => {
      // City filter
      if (cityFilter !== "all") {
        if (item.city_name !== cityFilter) return false;
      }

      // Community filter
      if (communityFilter !== "all") {
        if (item.community_name !== communityFilter) return false;
      }

      // Date range filter
      if (dateFrom) {
        const endDate = new Date(item.end_date);
        if (endDate < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const endDate = new Date(item.end_date);
        if (endDate > new Date(dateTo)) return false;
      }

      return true;
    });
  }, [data, cityFilter, communityFilter, dateFrom, dateTo]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();

      // Search in name
      const name = (row.original as any).name?.toLowerCase() || "";
      if (name.includes(searchValue)) return true;

      // Search in community
      const communityName =
        (row.original as any).community_name?.toLowerCase() || "";
      if (communityName.includes(searchValue)) return true;

      // Search in city
      const cityName = (row.original as any).city_name?.toLowerCase() || "";
      if (cityName.includes(searchValue)) return true;

      // Search in location
      const location =
        (row.original as any).check_in_location?.toLowerCase() || "";
      if (location.includes(searchValue)) return true;

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const hasActiveFilters =
    cityFilter !== "all" ||
    communityFilter !== "all" ||
    dateFrom ||
    dateTo ||
    globalFilter;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setCityFilter("all");
    setCommunityFilter("all");
    setDateFrom("");
    setDateTo("");
    table.getColumn("is_locked")?.setFilterValue(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Search days of service..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
          <Select
            value={
              (table.getColumn("is_locked")?.getFilterValue() as string) ??
              "all"
            }
            onValueChange={(value) =>
              table
                .getColumn("is_locked")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearAllFilters}
              className="h-8 px-2 lg:px-3"
            >
              Clear filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city-filter" className="text-sm font-medium">
              City
            </Label>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger id="city-filter">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community-filter" className="text-sm font-medium">
              Community
            </Label>
            <Select
              value={communityFilter}
              onValueChange={setCommunityFilter}
              disabled={cityFilter !== "all" && communities.length === 0}
            >
              <SelectTrigger id="community-filter">
                <SelectValue placeholder="All communities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community} value={community}>
                    {community}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-from" className="text-sm font-medium">
              Date From
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to" className="text-sm font-medium">
              Date To
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} total{" "}
          {filteredData.length === 1 ? "result" : "results"}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
