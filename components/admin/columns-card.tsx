"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { TableSchema } from "@/types/schema";
import { formatIdentifier } from "@/lib/reporting";

interface ColumnsCardProps {
  schema: TableSchema[];
  currentTable: TableSchema | undefined;
  selectedColumns: string[];
  setSelectedColumns: (cols: string[] | ((prev: string[]) => string[])) => void;
  includeRelations: boolean;
  relationTableNames: string[];
  relatedSelections: Record<string, string[]>;
  setRelatedSelections: (
    fn:
      | Record<string, string[]>
      | ((prev: Record<string, string[]>) => Record<string, string[]>)
  ) => void;
}

export function ColumnsCard({
  schema,
  currentTable,
  selectedColumns,
  setSelectedColumns,
  includeRelations,
  relationTableNames,
  relatedSelections,
  setRelatedSelections,
}: ColumnsCardProps) {
  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev: string[]) =>
      prev.includes(columnName)
        ? prev.filter((c: string) => c !== columnName)
        : [...prev, columnName]
    );
  };

  const toggleRelatedColumn = (table: string, col: string) => {
    setRelatedSelections((prev) => {
      const existing = prev[table] || [];
      const updated = existing.includes(col)
        ? existing.filter((c) => c !== col)
        : [...existing, col];
      return { ...prev, [table]: updated };
    });
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          Columns
        </CardTitle>
        <CardDescription>Select columns to include in report</CardDescription>
      </CardHeader>
      <CardContent>
        {!currentTable ? (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>Select a table to view available columns</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Available Columns (
                {currentTable.columns.length +
                  (includeRelations
                    ? relationTableNames.reduce((acc, rt) => {
                        const relMeta = schema.find((t) => t.name === rt);
                        return acc + (relMeta?.columns.length || 0);
                      }, 0)
                    : 0)}
                )
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedColumns(currentTable.columns.map((c) => c.name));
                    if (includeRelations) {
                      const allRelated: Record<string, string[]> = {};
                      relationTableNames.forEach((rt) => {
                        const relMeta = schema.find((t) => t.name === rt);
                        if (relMeta) {
                          allRelated[rt] = relMeta.columns.map((c) => c.name);
                        }
                      });
                      setRelatedSelections(allRelated);
                    }
                  }}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedColumns([]);
                    setRelatedSelections({});
                  }}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[400px] rounded-md border border-border p-3">
              <div className="space-y-2">
                {/* Main table columns */}
                {currentTable.columns.map((column) => (
                  <div key={column.name} className="flex items-start space-x-2">
                    <Checkbox
                      id={`col-${column.name}`}
                      checked={selectedColumns.includes(column.name)}
                      onCheckedChange={() => toggleColumn(column.name)}
                    />
                    <Label
                      htmlFor={`col-${column.name}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {formatIdentifier(column.name)}
                    </Label>
                  </div>
                ))}

                {/* Related table columns */}
                {includeRelations && relationTableNames.length > 0 && (
                  <>
                    {relationTableNames.map((rt) => {
                      const relMeta = schema.find((t) => t.name === rt);
                      if (!relMeta) return null;
                      const selectedForTable = relatedSelections[rt] || [];
                      return (
                        <div key={rt}>
                          <Separator className="my-3" />
                          <div className="mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              {formatIdentifier(rt)}
                            </span>
                          </div>
                          {relMeta.columns.map((c) => (
                            <div
                              key={c.name}
                              className="flex items-start space-x-2"
                            >
                              <Checkbox
                                id={`rel-${rt}-${c.name}`}
                                checked={selectedForTable.includes(c.name)}
                                onCheckedChange={() =>
                                  toggleRelatedColumn(rt, c.name)
                                }
                              />
                              <Label
                                htmlFor={`rel-${rt}-${c.name}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {formatIdentifier(c.name)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
