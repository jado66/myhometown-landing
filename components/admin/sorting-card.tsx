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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table2, X } from "lucide-react";
import { formatIdentifier } from "@/lib/reporting";
import type { SortSpec } from "@/app/actions/schema";
import * as React from "react";

interface SortingCardProps {
  selectedTable: string;
  selectedColumns: string[];
  sorts: SortSpec[];
  setSorts: (s: SortSpec[] | ((prev: SortSpec[]) => SortSpec[])) => void;
  selectableColumns: string[];
}

export function SortingCard({
  selectedTable,
  selectedColumns,
  sorts,
  setSorts,
  selectableColumns,
}: SortingCardProps) {
  const [sortColumn, setSortColumn] = React.useState<string>("");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc"
  );

  const handleAddSort = () => {
    if (!sortColumn) return;
    setSorts((prev: SortSpec[]) => {
      const without = prev.filter((s) => s.column !== sortColumn);
      return [...without, { column: sortColumn, direction: sortDirection }];
    });
    setSortColumn("");
    setSortDirection("asc");
  };

  const removeSort = (column: string) => {
    setSorts((prev: SortSpec[]) => prev.filter((s) => s.column !== column));
  };

  return (
    <Card className="lg:flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Table2 className="h-4 w-4" />
          Sorting
        </CardTitle>
        <CardDescription>
          Chain multi-column ordering (primary first)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sort-column">Column</Label>
            <Select
              value={sortColumn}
              onValueChange={(v) => setSortColumn(v)}
              disabled={!selectedTable || selectedColumns.length === 0}
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
        </div>{" "}
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={handleAddSort}
            disabled={!selectedTable || !sortColumn}
          >
            Add Sort
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent"
            onClick={() => setSorts([])}
            disabled={sorts.length === 0}
            title="Clear all sorts"
            aria-label="Clear all sorts"
          >
            <X />
          </Button>
        </ButtonGroup>
        {sorts.length > 0 && (
          <div className="space-y-2 pt-2">
            <Label>Active Sorts</Label>
            <div className="flex flex-wrap gap-2">
              {sorts.map((s) => (
                <Badge
                  key={s.column}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
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
      </CardContent>
    </Card>
  );
}
