"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { Columns3, CheckSquare, Square, GripVertical } from "lucide-react";

interface SortableColumnItemProps {
  id: string;
  columnName: string;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}

function SortableColumnItem({
  id,
  columnName,
  index,
  isSelected,
  onToggle,
}: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-2 p-2.5 rounded-md hover:bg-background/80 transition-colors group ${
        isDragging ? "bg-primary/10 shadow-lg z-50" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-0.5 touch-none"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
      </div>
      <Checkbox
        id={`col-${id}`}
        checked={isSelected}
        onCheckedChange={onToggle}
        className="mt-0.5 border-border/50 text-white"
      />
      <Label
        htmlFor={`col-${id}`}
        className="text-sm font-normal leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
      >
        <span className="font-medium">{index + 1}.</span>{" "}
        {formatIdentifier(columnName)}
      </Label>
    </div>
  );
}

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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev: string[]) =>
      prev.includes(columnName)
        ? prev.filter((c: string) => c !== columnName)
        : [...prev, columnName]
    );
  };

  const toggleRelatedColumn = (table: string, col: string) => {
    const columnPath = `${table}.${col}`;
    setSelectedColumns((prev: string[]) => {
      if (prev.includes(columnPath)) {
        return prev.filter((c: string) => c !== columnPath);
      } else {
        return [...prev, columnPath];
      }
    });
    
    setRelatedSelections((prev) => {
      const existing = prev[table] || [];
      const updated = existing.includes(col)
        ? existing.filter((c) => c !== col)
        : [...existing, col];
      return { ...prev, [table]: updated };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedColumns((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
                {/* All selected columns (main + related) - draggable in mixed order */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedColumns}
                    strategy={verticalListSortingStrategy}
                  >
                    {selectedColumns.map((columnPath, index) => {
                      // Check if it's a related column (contains ".")
                      const isRelated = columnPath.includes(".");
                      const displayName = isRelated
                        ? columnPath // e.g., "users.name"
                        : columnPath;
                      
                      return (
                        <SortableColumnItem
                          key={columnPath}
                          id={columnPath}
                          columnName={displayName}
                          index={index}
                          isSelected={true}
                          onToggle={() => {
                            if (isRelated) {
                              const [table, col] = columnPath.split(".");
                              toggleRelatedColumn(table, col);
                            } else {
                              toggleColumn(columnPath);
                            }
                          }}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>

                {/* Unselected main table columns */}
                {currentTable.columns
                  .filter((c) => !selectedColumns.includes(c.name))
                  .map((column) => (
                    <div
                      key={column.name}
                      className="flex items-start space-x-2 p-2.5 rounded-md hover:bg-background/80 transition-colors opacity-60"
                    >
                      <div className="w-[28px]"></div>
                      <Checkbox
                        id={`col-${column.name}`}
                        checked={false}
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

                {/* Unselected related table columns */}
                {includeRelations && relationTableNames.length > 0 && (
                  <>
                    {relationTableNames.map((rt) => {
                      const relMeta = schema.find((t) => t.name === rt);
                      if (!relMeta) return null;
                      
                      return (
                        <div key={rt}>
                          <Separator className="my-4" />
                          <div className="mb-3 px-2.5">
                            <span className="text-sm font-semibold text-primary">
                              {formatIdentifier(rt)} (Related)
                            </span>
                          </div>
                          {relMeta.columns
                            .filter((c) => !selectedColumns.includes(`${rt}.${c.name}`))
                            .map((c) => (
                              <div
                                key={c.name}
                                className="flex items-start space-x-2 p-2.5 rounded-md hover:bg-background/80 transition-colors opacity-60"
                              >
                                <div className="w-[28px]"></div>
                                <Checkbox
                                  id={`rel-${rt}-${c.name}`}
                                  checked={false}
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
