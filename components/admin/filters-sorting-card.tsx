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
import { Filter, ArrowUpDown, X, Plus, Sliders } from "lucide-react";
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
    <Card className="col-span-1 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="border-b border-border/50 ">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Sliders className="h-4.5 w-4.5 text-primary" />
              </div>
              Filters & Sorting
            </CardTitle>
            <CardDescription className="mt-2">
              Filter and sort your data
            </CardDescription>
          </div>
          <ButtonGroup>
            <Button
              variant={mode === "filter" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "filter" ? null : "filter")}
              disabled={!selectedTable}
              className="h-9 px-3 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Filter
            </Button>
            <Button
              variant={mode === "sort" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "sort" ? null : "sort")}
              disabled={!selectedTable || selectableColumns.length === 0}
              className="h-9 px-3 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Sort
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Filter Form */}
        {mode === "filter" && (
          <div className="space-y-4 p-5 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Add Filter Rule</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="filter-column"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Column
                </Label>
                <Select
                  value={filterColumn}
                  onValueChange={(v) => setFilterColumn(v)}
                >
                  <SelectTrigger
                    id="filter-column"
                    className="h-10 bg-background border-border/50"
                  >
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
                <Label
                  htmlFor="filter-operator"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Operator
                </Label>
                <Select
                  disabled={!filterColumn}
                  value={filterOperator}
                  onValueChange={(v) => setFilterOperator(v)}
                >
                  <SelectTrigger
                    id="filter-operator"
                    className="h-10 bg-background border-border/50"
                  >
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
                <Label
                  htmlFor="filter-value"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Value{filterOperator === "between" ? " From" : ""}
                </Label>
                <Input
                  id="filter-value"
                  placeholder="Enter value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  disabled={!filterColumn}
                  className="h-10 bg-background border-border/50"
                />
                {filterOperator === "between" && (
                  <Input
                    id="filter-value-to"
                    className="h-10 bg-background border-border/50"
                    placeholder="Value To"
                    value={filterValueTo}
                    onChange={(e) => setFilterValueTo(e.target.value)}
                    disabled={!filterColumn}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(null)}
                className="h-9 hover:text-white"
              >
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
                className="h-9 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:text-white"
              >
                Add Filter
              </Button>
            </div>
          </div>
        )}

        {/* Sort Form */}
        {mode === "sort" && (
          <div className="space-y-4 p-5 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">Add Sort Rule</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="sort-column"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Column
                </Label>
                <Select
                  value={sortColumn}
                  onValueChange={(v) => setSortColumn(v)}
                >
                  <SelectTrigger
                    id="sort-column"
                    className="h-10 bg-background border-border/50"
                  >
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
                <Label
                  htmlFor="sort-direction"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Direction
                </Label>
                <Select
                  value={sortDirection}
                  onValueChange={(v) => setSortDirection(v as "asc" | "desc")}
                  disabled={!sortColumn}
                >
                  <SelectTrigger
                    id="sort-direction"
                    className="h-10 bg-background border-border/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending ↑</SelectItem>
                    <SelectItem value="desc">Descending ↓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(null)}
                className="h-9 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddSort}
                disabled={!sortColumn}
                className="h-9 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 hover:text-white"
              >
                Add Sort
              </Button>
            </div>
          </div>
        )}

        {/* Combined Active Filters and Sorts */}
        {(filters.length > 0 || sorts.length > 0) && (
          <div className="space-y-4">
            {filters.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    Active Filters ({filters.length})
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters([])}
                    className="h-8 px-3 text-xs hover:text-white"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.map((f) => (
                    <Badge
                      key={f.column}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20"
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
                        className="ml-1 hover:text-destructive transition-colors"
                        onClick={() => removeFilter(f.column)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {sorts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-accent" />
                    Active Sorts ({sorts.length})
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSorts([])}
                    className="h-8 px-3 text-xs hover:text-white"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sorts.map((s) => (
                    <Badge
                      key={s.column}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent-foreground border-accent/20"
                    >
                      <ArrowUpDown className="h-3 w-3" />
                      <span>
                        {formatIdentifier(s.column)}{" "}
                        {s.direction === "asc" ? "↑" : "↓"}
                      </span>
                      <button
                        type="button"
                        className="ml-1 hover:text-destructive transition-colors"
                        onClick={() => removeSort(s.column)}
                      >
                        <X className="h-3 w-3" />
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
          <div className="flex items-center justify-center h-[400px] text-center">
            <div className="space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted mx-auto">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                No filters or sorts applied
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
