"use client";
import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Link2 } from "lucide-react";
import type { TableSchema } from "@/types/schema";
import { formatIdentifier } from "@/lib/reporting";
import { ColumnsCard } from "./columns-card";

interface DataSourceCardProps {
  loading: boolean;
  schema: TableSchema[];
  selectedTable: string;
  setSelectedTable: (v: string) => void;
  selectedColumns: string[];
  setSelectedColumns: (cols: string[] | ((prev: string[]) => string[])) => void;
  includeRelations: boolean;
  setIncludeRelations: (v: boolean) => void;
  relatedSelections: Record<string, string[]>;
  setRelatedSelections: (
    fn:
      | Record<string, string[]>
      | ((prev: Record<string, string[]>) => Record<string, string[]>)
  ) => void;
}

export function DataSourceCard({
  loading,
  schema,
  selectedTable,
  setSelectedTable,
  selectedColumns,
  setSelectedColumns,
  includeRelations,
  setIncludeRelations,
  relatedSelections,
  setRelatedSelections,
}: DataSourceCardProps) {
  const currentTable = schema.find((t) => t.name === selectedTable);
  const relationTableNames: string[] =
    includeRelations && currentTable
      ? Array.from(
          new Set(
            (currentTable.foreignKeys || [])
              .filter(
                (fk) =>
                  fk.referencedTable && fk.referencedTable !== selectedTable
              )
              .map((fk) => fk.referencedTable)
          )
        )
      : [];

  useEffect(() => {
    if (!includeRelations) {
      setRelatedSelections(() => ({}));
      return;
    }
    setRelatedSelections((prev) => {
      const next = { ...prev };
      for (const rt of relationTableNames) {
        if (!next[rt]) next[rt] = [];
      }
      Object.keys(next).forEach((k) => {
        if (!relationTableNames.includes(k)) delete next[k];
      });
      return next;
    });
  }, [includeRelations, relationTableNames.join("|"), setRelatedSelections]);

  return (
    <>
      <Card className="col-span-1 border-border/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="border-b border-border/50 ">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-4.5 w-4.5 text-primary" />
            </div>
            Data Source
          </CardTitle>
          <CardDescription className="mt-2">
            Select your primary table and configure relationships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="table-select" className="text-sm font-semibold">
                  Primary Table
                </Label>
                <Select
                  value={selectedTable}
                  onValueChange={setSelectedTable}
                  disabled={loading}
                >
                  <SelectTrigger
                    id="table-select"
                    className="h-11 bg-background border-border/50"
                  >
                    <SelectValue
                      placeholder={
                        loading ? "Loading tables..." : "Select a table"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : schema.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No tables found
                      </SelectItem>
                    ) : (
                      schema.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {formatIdentifier(table.name)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedTable &&
              currentTable &&
              currentTable.foreignKeys?.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      Related Tables
                    </Label>
                    {currentTable.foreignKeys.map((fk, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`include-relation-${idx}`}
                          checked={includeRelations}
                          onCheckedChange={(checked) =>
                            setIncludeRelations(!!checked)
                          }
                          className="border-border/50 text-white"
                        />
                        <Label
                          htmlFor={`include-relation-${idx}`}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          <span className="font-medium text-foreground">
                            {formatIdentifier(fk.columnName)}
                          </span>
                          <span className="text-muted-foreground mx-1.5">
                            →
                          </span>
                          <span className="text-primary font-medium">
                            {formatIdentifier(fk.referencedTable)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      <ColumnsCard
        schema={schema}
        currentTable={currentTable}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
        includeRelations={includeRelations}
        relationTableNames={relationTableNames}
        relatedSelections={relatedSelections}
        setRelatedSelections={setRelatedSelections}
      />
    </>
  );
}
