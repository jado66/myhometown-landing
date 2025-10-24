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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, Settings2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  onAddClick?: () => void;
  loading?: boolean;
  skeletonRowCount?: number;
}

export function UserDataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onAddClick,
  loading = false,
  skeletonRowCount = 8,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();

      // Search in name (first_name + last_name)
      const firstName = (row.original as any).first_name?.toLowerCase() || "";
      const lastName = (row.original as any).last_name?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName.includes(searchValue)) return true;

      // Search in email
      const email = (row.original as any).email?.toLowerCase() || "";
      if (email.includes(searchValue)) return true;

      // Search in phone
      const phone = (row.original as any).contact_number?.toLowerCase() || "";
      if (phone.includes(searchValue)) return true;

      // Search in cities
      const cities = (row.original as any).cities_details || [];
      if (
        cities.some((city: any) =>
          `${city.name}, ${city.state}`.toLowerCase().includes(searchValue)
        )
      )
        return true;

      // Search in communities
      const communities = (row.original as any).communities_details || [];
      if (
        communities.some((community: any) =>
          community.name?.toLowerCase().includes(searchValue)
        )
      )
        return true;

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const exportToCSV = () => {
    if (loading) return; // prevent export while loading
    const headers = columns
      .filter((col: any) => col.accessorKey)
      .map((col: any) => col.header)
      .join(",");

    const rows = data
      .map((row: any) => {
        return columns
          .filter((col: any) => col.accessorKey)
          .map((col: any) => {
            const value = row[col.accessorKey];
            if (typeof value === "object" && value !== null) {
              return `"${JSON.stringify(value)}"`;
            }
            return `"${value || ""}"`;
          })
          .join(",");
      })
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
            disabled={loading}
          />
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading users..." : `Total Users: ${data.length}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddClick}
            size="sm"
            className="text-white"
            disabled={loading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="hover:text-white"
            disabled={loading || data.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hover:text-white"
                disabled={loading}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize hover:text-white"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
              [...Array(skeletonRowCount)].map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  {table.getAllLeafColumns().map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 w-full rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => !loading && onRowClick?.(row.original)}
                  className="cursor-pointer hover:bg-muted/50"
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
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${table.getFilteredSelectedRowModel().rows.length} of ${
                  table.getFilteredRowModel().rows.length
                } row(s) selected.`}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top" className="bg-white">
                {[10, 25, 50, 100, 250].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={loading || !table.getCanPreviousPage()}
            className="hover:text-white"
          >
            Previous
          </Button>
          <div className="text-sm">
            {loading
              ? "Page --"
              : `Page ${
                  table.getState().pagination.pageIndex + 1
                } of ${table.getPageCount()}`}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={loading || !table.getCanNextPage()}
            className="hover:text-white"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
