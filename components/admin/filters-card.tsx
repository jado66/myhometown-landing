"use client";
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
import { Filter, X } from "lucide-react";
import { formatIdentifier } from "@/lib/reporting";
import type { AdvancedFilter } from "@/app/actions/schema";

interface FiltersCardProps {
  selectedTable: string;
  selectableColumns: string[];
  filters: AdvancedFilter[];
  setFilters: (
    f: AdvancedFilter[] | ((prev: AdvancedFilter[]) => AdvancedFilter[])
  ) => void;
}

export function FiltersCard({
  selectedTable,
  selectableColumns,
  filters,
  setFilters,
}: FiltersCardProps) {
  const [filterColumn, setFilterColumn] = React.useState("");
  const [filterOperator, setFilterOperator] = React.useState<string>("eq");
  const [filterValue, setFilterValue] = React.useState("");
  const [filterValueTo, setFilterValueTo] = React.useState("");

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
  };

  const removeFilter = (column: string) => {
    setFilters((prev: AdvancedFilter[]) =>
      prev.filter((f) => f.column !== column)
    );
  };

  return (
    <Card className="lg:flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
        <CardDescription>Optional data filtering</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-column">Column</Label>
            <Select
              disabled={!selectedTable}
              value={filterColumn}
              onValueChange={(v) => setFilterColumn(v)}
            >
              <SelectTrigger id="filter-column">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {selectedTable ? (
                  selectableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {formatIdentifier(col)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none">No columns available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-operator">Operator</Label>
            <Select
              disabled={!selectedTable || !filterColumn}
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
              disabled={!selectedTable || !filterColumn}
            />
            {filterOperator === "between" && (
              <Input
                id="filter-value-to"
                className="mt-2"
                placeholder="Value To"
                value={filterValueTo}
                onChange={(e) => setFilterValueTo(e.target.value)}
                disabled={!selectedTable || !filterColumn}
              />
            )}
          </div>
        </div>
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent hover:text-white"
            onClick={handleAddFilter}
            disabled={
              !selectedTable ||
              !filterColumn ||
              !filterValue ||
              (filterOperator === "between" && !filterValueTo)
            }
          >
            Add Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent hover:text-white"
            onClick={() => setFilters([])}
            disabled={filters.length === 0}
            title="Clear all filters"
            aria-label="Clear all filters"
          >
            <X />
          </Button>
        </ButtonGroup>
        {filters.length > 0 && (
          <div className="space-y-2 pt-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <Badge
                  key={f.column}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
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
      </CardContent>
    </Card>
  );
}

// Local React import fallback to avoid implicit global assumption
import * as React from "react";
