"use client";
import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Table2, X } from "lucide-react";
import { formatIdentifier } from "@/lib/reporting";
import type { AdvancedFilter, SortSpec } from "@/app/actions/schema";

interface FiltersSortingCardProps {
  selectedTable: string;
  selectableColumns: string[];
  filters: AdvancedFilter[];
  setFilters: (
    f: AdvancedFilter[] | ((prev: AdvancedFilter[]) => AdvancedFilter[])
  ) => void;
  sorts: SortSpec[];
  setSorts: (s: SortSpec[] | ((prev: SortSpec[]) => SortSpec[])) => void;
}

type Mode = "filter" | "sort" | null;

export function FiltersSortingCard({
  selectedTable,
  selectableColumns,
  filters,
  setFilters,
  sorts,
  setSorts,
}: FiltersSortingCardProps) {
  const [mode, setMode] = React.useState<Mode>(null);

  // Filter state
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterOperator, setFilterOperator] = React.useState<string>("eq");
  const [filterValue, setFilterValue] = React.useState("");
  const [filterValueTo, setFilterValueTo] = React.useState("");

  // Sort state
  const [sortColumn, setSortColumn] = React.useState<string>("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );

  const handleAddFilter = () => {
    if (!filterColumn || !filterValue) return;
    setFilters((prev: AdvancedFilter[]) => {
      const without = prev.filter((f) => f.column !== filterColumn);
      return [
        ...without,
        {
          column: filterColumn,
          value: filterValue,
          operator: filterOperator as AdvancedFilter["operator"],
          valueTo: filterOperator === "between" ? filterValueTo : undefined,
        },
      ];
    });
    setFilterValue("");
    setFilterValueTo("");
    setFilterOperator("eq");
    setMode(null);
  };

  const removeFilter = (column: string) => {
    setFilters((prev: AdvancedFilter[]) =>
      prev.filter((f) => f.column !== column)
    );
  };

  const handleAddSort = () => {
    if (!sortColumn) return;
    setSorts((prev: SortSpec[]) => {
      const without = prev.filter((s) => s.column !== sortColumn);
      return [...without, { column: sortColumn, direction: sortDirection }];
    });
    setSortColumn("");
    setSortDirection("asc");
    setMode(null);
  };

  const removeSort = (column: string) => {
    setSorts((prev: SortSpec[]) => prev.filter((s) => s.column !== column));
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters & Sorting
            </CardTitle>
            <CardDescription>Optional filtering and ordering</CardDescription>
          </div>
          <ButtonGroup>
            <Button
              variant={mode === "filter" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "filter" ? null : "filter")}
              disabled={!selectedTable}
            >
              <Filter className="h-3 w-3 mr-1" />
              Add Filter
            </Button>
            <Button
              variant={mode === "sort" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "sort" ? null : "sort")}
              disabled={!selectedTable || selectableColumns.length === 0}
            >
              <Table2 className="h-3 w-3 mr-1" />
              Add Sort
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Form */}
        {mode === "filter" && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter-column">Column</Label>
                <Select
                  value={filterColumn}
                  onValueChange={(v) => setFilterColumn(v)}
                >
                  <SelectTrigger id="filter-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {formatIdentifier(col)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-operator">Operator</Label>
                <Select
                  disabled={!filterColumn}
                  value={filterOperator}
                  onValueChange={(v) => setFilterOperator(v)}
                >
                  <SelectTrigger id="filter-operator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { v: "eq", l: "Equals" },
                      { v: "contains", l: "Contains" },
                      { v: "startsWith", l: "Starts With" },
                      { v: "endsWith", l: "Ends With" },
                      { v: "gt", l: ">" },
                      { v: "gte", l: ">=" },
                      { v: "lt", l: "<" },
                      { v: "lte", l: "<=" },
                      { v: "between", l: "Between" },
                      { v: "in", l: "In List" },
                    ].map((o) => (
                      <SelectItem key={o.v} value={o.v}>
                        {o.l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-value">
                  Value{filterOperator === "between" ? " From" : ""}
                </Label>
                <Input
                  id="filter-value"
                  placeholder="Value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  disabled={!filterColumn}
                />
                {filterOperator === "between" && (
                  <Input
                    id="filter-value-to"
                    className="mt-2"
                    placeholder="Value To"
                    value={filterValueTo}
                    onChange={(e) => setFilterValueTo(e.target.value)}
                    disabled={!filterColumn}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setMode(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddFilter}
                disabled={
                  !filterColumn ||
                  !filterValue ||
                  (filterOperator === "between" && !filterValueTo)
                }
              >
                Add Filter
              </Button>
            </div>
          </div>
        )}

        {/* Sort Form */}
        {mode === "sort" && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort-column">Column</Label>
                <Select
                  value={sortColumn}
                  onValueChange={(v) => setSortColumn(v)}
                >
                  <SelectTrigger id="sort-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableColumns.map((c) => (
                      <SelectItem key={c} value={c}>
                        {formatIdentifier(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort-direction">Direction</Label>
                <Select
                  value={sortDirection}
                  onValueChange={(v) => setSortDirection(v as "asc" | "desc")}
                  disabled={!sortColumn}
                >
                  <SelectTrigger id="sort-direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setMode(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddSort} disabled={!sortColumn}>
                Add Sort
              </Button>
            </div>
          </div>
        )}

        {/* Combined Active Filters and Sorts */}
        {(filters.length > 0 || sorts.length > 0) && (
          <div className="space-y-3">
            {filters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Active Filters</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters([])}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <Badge
                      key={f.column}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Filter className="h-3 w-3" />
                      <span>
                        {formatIdentifier(f.column)} {f.operator || "eq"}{" "}
                        {f.operator === "between" && f.valueTo
                          ? `${f.value} – ${f.valueTo}`
                          : f.value}
                      </span>
                      <button
                        type="button"
                        className="ml-1 text-xs hover:text-destructive"
                        onClick={() => removeFilter(f.column)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {sorts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Active Sorts</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSorts([])}
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sorts.map((s) => (
                    <Badge
                      key={s.column}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Table2 className="h-3 w-3" />
                      <span>
                        {formatIdentifier(s.column)}{" "}
                        {s.direction === "asc" ? "↑" : "↓"}
                      </span>
                      <button
                        type="button"
                        className="ml-1 text-xs hover:text-destructive"
                        onClick={() => removeSort(s.column)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!mode && filters.length === 0 && sorts.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            <p>No filters or sorts applied</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
