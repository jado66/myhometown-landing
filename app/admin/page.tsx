"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Database,
  Table2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getSchemaData,
  getTableData,
  type SimpleFilter,
  type AdvancedFilter,
  type SortSpec,
} from "@/app/actions/schema";
import type { TableSchema } from "@/types/schema";
import { exportToCSV } from "@/lib/export/csv";
import { exportToPDF } from "@/components/pdf";
import { toast } from "sonner";
import {
  ReportTemplatesCard,
  TemplateInfo,
} from "@/components/admin/report-templates-card";
import { DataSourceCard } from "@/components/admin/data-source-card";
import { FiltersSortingCard } from "@/components/admin/filters-sorting-card";
import { formatIdentifier } from "@/lib/reporting";

export default function ReportBuilderPage() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [includeRelations, setIncludeRelations] = useState(false);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  // Filtering state
  const [filterColumn, setFilterColumn] = useState<string>("");
  const [filterOperator, setFilterOperator] = useState<string>("eq");
  const [filterValue, setFilterValue] = useState<string>("");
  const [filterValueTo, setFilterValueTo] = useState<string>("");
  const [filters, setFilters] = useState<AdvancedFilter[]>([]);
  // Use 'none' sentinel instead of empty string to satisfy SelectItem requirements
  const [sortColumn, setSortColumn] = useState<string>("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sorts, setSorts] = useState<SortSpec[]>([]); // chained sorts
  // Saved Queries state
  interface SavedQuery {
    id: string; // uuid
    name: string;
    table: string;
    columns: string[];
    filters: AdvancedFilter[];
    sorts: SortSpec[];
    includeRelations: boolean;
    createdAt: number;
    updatedAt: number;
  }
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [savedQueryName, setSavedQueryName] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [pendingLoadId, setPendingLoadId] = useState<string | null>(null);
  // Saved query name for saving template
  // (collapse logic moved to child component)

  // Default templates (static examples – adjust as needed)
  interface TemplatePreset {
    id: string;
    name: string;
    table: string;
    columns: string[];
    includeRelations: boolean;
    filters: AdvancedFilter[];
    sorts: SortSpec[];
  }

  const defaultTemplates: TemplatePreset[] = [
    {
      id: "volunteer-summary",
      name: "Volunteer Summary (Last 30 Days)",
      table: "volunteer_activity", // adjust table name to real one
      columns: ["volunteer_id", "activity_type", "hours", "created_at"],
      includeRelations: false,
      filters: [
        {
          column: "created_at",
          operator: "gte",
          value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10),
        },
      ],
      sorts: [{ column: "created_at", direction: "desc" }],
    },
    {
      id: "class-popularity",
      name: "Class Popularity", // counts per class
      table: "classes", // adjust to actual table
      columns: ["id", "title", "enrollment_count", "category"],
      includeRelations: false,
      filters: [],
      sorts: [
        { column: "enrollment_count", direction: "desc" },
        { column: "title", direction: "asc" },
      ],
    },
    {
      id: "crc-directory",
      name: "CRC Directory", // basic directory listing
      table: "crcs", // adjust to actual table
      columns: ["id", "name", "city", "state"],
      includeRelations: true,
      filters: [],
      sorts: [{ column: "city", direction: "asc" }],
    },
  ];

  const applyTemplate = (tpl: {
    table: string;
    columns: string[];
    includeRelations: boolean;
    filters: AdvancedFilter[];
    sorts: SortSpec[];
    name?: string;
  }) => {
    // Ensure table exists before applying columns
    setSelectedTable(tpl.table);
    // Delay setting dependent state until schema resolved if necessary
    setSelectedColumns(tpl.columns);
    setIncludeRelations(tpl.includeRelations);
    setFilters(tpl.filters);
    setSorts(tpl.sorts);
    toast.success(`Loaded template: ${tpl.name || tpl.table}`);
  };

  // IndexedDB helpers (lightweight, no external lib)
  const DB_NAME = "reportBuilderDB";
  const DB_VERSION = 1;
  const STORE = "queries";

  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: "id" });
          store.createIndex("name", "name", { unique: true });
        }
      };
      req.onsuccess = () => resolve(req.result);
    });
  }

  // Saved query persistence helpers
  async function listSavedQueries(): Promise<SavedQuery[]> {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const req = store.getAll();
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result as SavedQuery[]);
      });
    } catch (e) {
      console.error("[report] listSavedQueries error", e);
      return [];
    }
  }

  async function loadQuery(id: string): Promise<SavedQuery | undefined> {
    try {
      const db = await openDB();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const req = store.get(id);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result as SavedQuery | undefined);
      });
    } catch (e) {
      console.error("[report] loadQuery error", e);
      return undefined;
    }
  }

  async function saveQuery(q: {
    name: string;
    table: string;
    columns: string[];
    filters: AdvancedFilter[];
    sorts: SortSpec[];
    includeRelations: boolean;
  }): Promise<SavedQuery> {
    const now = Date.now();
    const record: SavedQuery = {
      id: crypto.randomUUID(),
      name: q.name,
      table: q.table,
      columns: q.columns,
      filters: q.filters,
      sorts: q.sorts,
      includeRelations: q.includeRelations,
      createdAt: now,
      updatedAt: now,
    };
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const req = store.add(record);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error("[report] saveQuery error", e);
      throw e;
    }
    return record;
  }

  async function deleteQuery(id: string): Promise<void> {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const req = store.delete(id);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve();
      });
    } catch (e) {
      console.error("[report] deleteQuery error", e);
      throw e;
    }
  }

  const currentTable = schema.find((t) => t.name === selectedTable);

  // Relation table names (each referenced table once) for display/export when includeRelations is true
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
  // Track selected related table columns independently
  const [relatedSelections, setRelatedSelections] = useState<
    Record<string, string[]>
  >({});

  // Relation column paths limited to ONLY user-selected related columns (table.column)
  const relationSelectedColumnPaths: string[] = includeRelations
    ? relationTableNames.flatMap((rt) =>
        (relatedSelections[rt] || []).map((c) => `${rt}.${c}`)
      )
    : [];
  // Memoize selectableColumns to avoid triggering effects every render
  const selectableColumns = useMemo(
    () => [...new Set([...selectedColumns, ...relationSelectedColumnPaths])],
    [selectedColumns.join("|"), relationSelectedColumnPaths.join("|")]
  );

  // Ensure filters & sorts reference only currently selectable columns (skip update if unchanged)
  useEffect(() => {
    setFilters((prev) => {
      const cleaned = prev.filter((f) => selectableColumns.includes(f.column));
      return cleaned.length === prev.length ? prev : cleaned;
    });
    setSorts((prev) => {
      const cleaned = prev.filter((s) => selectableColumns.includes(s.column));
      return cleaned.length === prev.length ? prev : cleaned;
    });
  }, [selectableColumns]);

  useEffect(() => {
    if (!includeRelations) {
      setRelatedSelections({});
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
  }, [includeRelations, relationTableNames.join("|")]);

  const toggleRelatedColumn = (table: string, col: string) => {
    setRelatedSelections((prev) => {
      const existing = prev[table] || [];
      const updated = existing.includes(col)
        ? existing.filter((c) => c !== col)
        : [...existing, col];
      return { ...prev, [table]: updated };
    });
  };

  // Displayed columns: selected root columns plus chosen related columns (table.column)
  const displayedColumns = includeRelations
    ? [
        ...selectedColumns,
        ...relationTableNames.flatMap((rt) =>
          (relatedSelections[rt] || []).map((c) => `${rt}.${c}`)
        ),
      ]
    : selectedColumns;

  // formatIdentifier now imported from shared reporting util

  const toggleColumn = (columnName: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((c) => c !== columnName)
        : [...prev, columnName]
    );
  };

  const selectAllColumns = () => {
    if (currentTable) {
      setSelectedColumns(currentTable.columns.map((c) => c.name));
    }
  };

  const refreshPreview = async () => {
    if (!selectedTable || selectedColumns.length === 0) return;
    setLoadingPreview(true);
    const data = await getTableData(
      selectedTable,
      selectedColumns,
      includeRelations,
      filters,
      sorts.length > 0 ? sorts : undefined,
      relatedSelections
    );
    setPreviewData(data);
    setLoadingPreview(false);
  };

  const handleAddSort = () => {
    if (sortColumn === "none") return;
    setSorts((prev) => {
      const without = prev.filter((s) => s.column !== sortColumn);
      return [...without, { column: sortColumn, direction: sortDirection }];
    });
    setSortColumn("none");
    setSortDirection("asc");
  };

  const removeSort = (column: string) => {
    setSorts((prev) => prev.filter((s) => s.column !== column));
  };

  // Add a new filter
  const handleAddFilter = () => {
    if (!filterColumn || !filterValue) return;
    setFilters((prev) => {
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
    setFilters((prev) => prev.filter((f) => f.column !== column));
  };

  const handleExportCSV = () => {
    if (previewData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const filename = `${selectedTable}_${
      new Date().toISOString().split("T")[0]
    }`;
    // Flatten rows: root columns copied directly; related columns referenced via table.column path.
    const flattened = previewData.map((row) => {
      const out: Record<string, any> = {};
      for (const col of displayedColumns) {
        if (col.includes(".")) {
          const [rt, rc] = col.split(".");
          const relObj = row[rt];
          out[col] = relObj ? relObj[rc] ?? null : null;
        } else {
          out[col] = row[col];
        }
      }
      return out;
    });
    exportToCSV(flattened, filename);
    toast.success(
      `CSV exported successfully. Downloaded ${previewData.length} rows to ${filename}.csv`
    );
  };

  const handleExportPDF = async () => {
    if (previewData.length === 0) {
      toast.error("No data to export");
      return;
    }

    setExportingPDF(true);

    try {
      await exportToPDF(
        selectedTable,
        selectedColumns,
        previewData,
        includeRelations
      );

      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("[v0] PDF export error:", error);
      toast.error("There was an error generating the PDF. Please try again.");
    } finally {
      setExportingPDF(false);
    }
  };

  // Save current query
  const handleSaveCurrentQuery = async () => {
    if (
      !selectedTable ||
      selectedColumns.length === 0 ||
      !savedQueryName.trim()
    ) {
      toast.error("Select table/columns and provide a name to save.");
      return;
    }
    try {
      const record = await saveQuery({
        name: savedQueryName.trim(),
        table: selectedTable,
        columns: selectedColumns,
        filters,
        sorts,
        includeRelations,
      });
      setSavedQueryName("");
      const list = await listSavedQueries();
      setSavedQueries(list.sort((a, b) => b.updatedAt - a.updatedAt));
      toast.success(`Saved query '${record.name}'`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save query");
    }
  };

  const handleLoadQuery = async (id: string) => {
    const q = savedQueries.find((sq) => sq.id === id);
    if (!q) return;
    // Set table first, other fields applied in pending effect
    setPendingLoadId(id);
    setSelectedTable(q.table);
  };

  const handleDeleteQuery = async (id: string) => {
    await deleteQuery(id);
    const list = await listSavedQueries();
    setSavedQueries(list.sort((a, b) => b.updatedAt - a.updatedAt));
    toast.success("Deleted saved query");
  };
  // Build template arrays for child component
  const combinedTemplates: TemplateInfo[] = [
    ...defaultTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      table: t.table,
      columns: t.columns,
      includeRelations: t.includeRelations,
      filters: t.filters,
      sorts: t.sorts,
    })),
    ...savedQueries.map((q) => ({
      id: q.id,
      name: q.name,
      table: q.table,
      columns: q.columns,
      includeRelations: q.includeRelations,
      filters: q.filters,
      sorts: q.sorts,
    })),
  ];

  const savedTemplates: TemplateInfo[] = savedQueries.map((q) => ({
    id: q.id,
    name: q.name,
    table: q.table,
    columns: q.columns,
    includeRelations: q.includeRelations,
    filters: q.filters,
    sorts: q.sorts,
  }));

  // Load schema once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getSchemaData();
      if (!cancelled) {
        setSchema(data.tables);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply pending saved query after schema/tables ready
  useEffect(() => {
    if (!pendingLoadId) return;
    (async () => {
      const q = await loadQuery(pendingLoadId);
      if (!q) return;
      const tableReady = schema.find((t) => t.name === q.table);
      if (!tableReady) return; // wait until schema has table
      setSelectedColumns(q.columns);
      setFilters(q.filters);
      setSorts(q.sorts);
      setIncludeRelations(q.includeRelations);
      setPendingLoadId(null);
      toast.success(`Loaded saved query: ${q.name}`);
    })();
  }, [pendingLoadId, schema]);

  // Auto select columns when table changes
  useEffect(() => {
    if (!selectedTable) {
      setSelectedColumns([]);
      setFilters([]);
      setSorts([]);
      setFilterColumn("");
      setFilterValue("");
      return;
    }
    const table = schema.find((t) => t.name === selectedTable);
    if (table) {
      const allCols = table.columns.map((c) => c.name);
      // Only update if different to avoid extra renders
      const sameLength = allCols.length === selectedColumns.length;
      const sameContent =
        sameLength && allCols.every((c) => selectedColumns.includes(c));
      if (!sameContent) {
        setSelectedColumns(allCols);
        setFilters([]);
        setSorts([]);
      }
    }
  }, [selectedTable, schema]);

  // Load preview whenever relevant selections change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedTable || selectedColumns.length === 0) {
        setPreviewData([]);
        return;
      }
      setLoadingPreview(true);
      const data = await getTableData(
        selectedTable,
        selectedColumns,
        includeRelations,
        filters,
        sorts.length > 0 ? sorts : undefined,
        relatedSelections
      );
      if (!cancelled) {
        setPreviewData(data);
        setLoadingPreview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    selectedTable,
    selectedColumns,
    includeRelations,
    filters,
    sorts,
    // Trigger refetch when related selections change
    JSON.stringify(relatedSelections),
  ]);
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Global Reporting Tool
              </h1>
              <p className="text-sm text-muted-foreground">
                Generate CSV and PDF reports from your data
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <ReportTemplatesCard
            templates={combinedTemplates}
            savedQueries={savedTemplates}
            loadingSaved={loadingSaved}
            savedQueryName={savedQueryName}
            onSavedQueryNameChange={setSavedQueryName}
            onSaveCurrent={handleSaveCurrentQuery}
            canSaveCurrent={Boolean(
              selectedTable &&
                selectedColumns.length > 0 &&
                savedQueryName.trim()
            )}
            onApplyTemplate={applyTemplate}
            onDeleteSaved={handleDeleteQuery}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DataSourceCard
              loading={loading}
              schema={schema}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              includeRelations={includeRelations}
              setIncludeRelations={setIncludeRelations}
              relatedSelections={relatedSelections}
              setRelatedSelections={setRelatedSelections}
            />
            <FiltersSortingCard
              selectedTable={selectedTable}
              selectableColumns={selectableColumns}
              filters={filters}
              setFilters={setFilters}
              sorts={sorts}
              setSorts={setSorts}
            />
          </div>

          {/* Data Preview Row */}
          <div className="space-y-6 ">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Table2 className="h-5 w-5" />
                      Data Preview
                    </CardTitle>
                    <CardDescription>
                      Preview your report data before export
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshPreview}
                      disabled={
                        !selectedTable ||
                        selectedColumns.length === 0 ||
                        loadingPreview
                      }
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          loadingPreview ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={
                        !selectedTable ||
                        selectedColumns.length === 0 ||
                        previewData.length === 0
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleExportPDF}
                      disabled={
                        !selectedTable ||
                        selectedColumns.length === 0 ||
                        previewData.length === 0 ||
                        exportingPDF
                      }
                    >
                      {exportingPDF ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-w-full overflow-auto">
                {loading ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : !selectedTable ? (
                  <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                      <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium text-foreground">
                        No table selected
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select a table from the sidebar to preview data
                      </p>
                    </div>
                  </div>
                ) : selectedColumns.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border">
                    <div className="text-center">
                      <Table2 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium text-foreground">
                        No columns selected
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select at least one column to preview data
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {formatIdentifier(selectedTable)}
                        </Badge>
                        <Badge variant="outline">
                          {displayedColumns.length} columns
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {previewData.length}{" "}
                        {previewData.length === 100 ? "(limited)" : ""} rows
                      </p>
                    </div>
                    <div className="rounded-lg border border-border">
                      <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
                        {loadingPreview ? (
                          <div className="flex h-[400px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : previewData.length === 0 ? (
                          <div className="flex h-[400px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                              No data found
                            </p>
                          </div>
                        ) : (
                          <table className="w-full table-auto border-collapse">
                            <thead className="sticky top-0 bg-muted z-10">
                              <tr>
                                {displayedColumns.map((col) => (
                                  <th
                                    key={col}
                                    className="border-b border-border px-4 py-3 text-left text-sm font-medium text-muted-foreground whitespace-nowrap"
                                  >
                                    {formatIdentifier(col)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.map((row, idx) => (
                                <tr
                                  key={idx}
                                  className="border-b border-border last:border-0 hover:bg-muted/50"
                                >
                                  {displayedColumns.map((col) => {
                                    // Resolve value (root or related table column path)
                                    let value: any;
                                    if (col.includes(".")) {
                                      const [rt, rc] = col.split(".");
                                      const relObj = row[rt];
                                      value = relObj ? relObj[rc] : null;
                                    } else {
                                      value = row[col];
                                    }
                                    return (
                                      <td
                                        key={col}
                                        className="px-4 py-3 text-sm text-foreground whitespace-nowrap"
                                      >
                                        {value === null ||
                                        value === undefined ? (
                                          <span className="text-muted-foreground italic">
                                            null
                                          </span>
                                        ) : typeof value === "object" ? (
                                          <span
                                            className="text-muted-foreground"
                                            title={JSON.stringify(value)}
                                          >
                                            {(() => {
                                              const obj = value;
                                              if (!obj) return "null";
                                              const preferred =
                                                obj.name || obj.title || obj.id;
                                              if (preferred)
                                                return String(
                                                  preferred
                                                ).substring(0, 50);
                                              const json = JSON.stringify(obj);
                                              return json.length > 50
                                                ? json.substring(0, 50) + "..."
                                                : json;
                                            })()}
                                          </span>
                                        ) : (
                                          String(value)
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
