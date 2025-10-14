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
import { Columns3, CheckSquare, Square } from "lucide-react";

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
    <Card className="col-span-1 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="border-b border-border/50 ">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Columns3 className="h-4.5 w-4.5 text-accent" />
          </div>
          Columns
        </CardTitle>
        <CardDescription className="mt-2">
          Choose which columns to include in your report
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!currentTable ? (
          <div className="flex items-center justify-center h-[400px] text-center">
            <div className="space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted mx-auto">
                <Columns3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Select a table see columns
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
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
                  className="h-8 px-3 text-xs font-medium hover:text-primary"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
                  Select all
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedColumns([]);
                    setRelatedSelections({});
                  }}
                  className="h-8 px-3 text-xs font-medium hover:text-destructive"
                >
                  <Square className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[300px] rounded-lg border border-border/50 bg-muted/20 p-4">
              <div className="space-y-2">
                {/* Main table columns */}
                {currentTable.columns.map((column) => (
                  <div
                    key={column.name}
                    className="flex items-start space-x-3 p-2.5 rounded-md hover:bg-background/80 transition-colors"
                  >
                    <Checkbox
                      id={`col-${column.name}`}
                      checked={selectedColumns.includes(column.name)}
                      onCheckedChange={() => toggleColumn(column.name)}
                      className="mt-0.5 border-border/50 text-white"
                    />
                    <Label
                      htmlFor={`col-${column.name}`}
                      className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
                          <Separator className="my-4" />
                          <div className="mb-3 px-2.5">
                            <span className="text-sm font-semibold text-primary">
                              {formatIdentifier(rt)}
                            </span>
                          </div>
                          {relMeta.columns.map((c) => (
                            <div
                              key={c.name}
                              className="flex items-start space-x-3 p-2.5 rounded-md hover:bg-background/80 transition-colors"
                            >
                              <Checkbox
                                id={`rel-${rt}-${c.name}`}
                                checked={selectedForTable.includes(c.name)}
                                onCheckedChange={() =>
                                  toggleRelatedColumn(rt, c.name)
                                }
                                className="mt-0.5 border-border/50 text-white"
                              />
                              <Label
                                htmlFor={`rel-${rt}-${c.name}`}
                                className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
