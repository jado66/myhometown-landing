"use server";

import type {
  TableSchema,
  ColumnSchema,
  ForeignKey,
  SchemaData,
} from "@/types/schema";
import { supabaseServer } from "@/util/supabase-server";

export async function getSchemaData(): Promise<SchemaData> {
  try {
    // Get all tables from public schema
    const { data: tables, error: tablesError } = await supabaseServer.rpc(
      "get_tables_info",
      {}
    );

    if (tablesError) {
      // Fallback: Use simple public schema introspection
      console.error("[v0] Error fetching tables:", tablesError);
      console.log(
        "[v0] Fallback not available - please create the get_tables_info RPC function"
      );

      // Return empty tables array as we can't query information_schema via PostgREST
      return { tables: [] };
    }
    // Normalize shape: RPC returns foreign_keys, we want foreignKeys
    const normalized: TableSchema[] = (tables || []).map((t: any) => {
      return {
        name: t.name,
        columns: Array.isArray(t.columns)
          ? t.columns.map((c: any) => ({
              name: c.name,
              type: c.type,
              nullable: !!c.nullable,
              isPrimaryKey: !!c.isPrimaryKey,
            }))
          : [],
        foreignKeys: Array.isArray(t.foreign_keys)
          ? t.foreign_keys.map((fk: any) => ({
              columnName: fk.columnName,
              referencedTable: fk.referencedTable,
              referencedColumn: fk.referencedColumn,
            }))
          : [],
      } as TableSchema;
    });

    return { tables: normalized };
  } catch (error) {
    console.error("[v0] Error in getSchemaData:", error);
    if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
      return { tables: [], error: "SUPABASE_NOT_CONFIGURED" };
    }
    return { tables: [] };
  }
}

export interface SimpleFilter {
  column: string;
  value: string;
}

export type FilterOperator =
  | "eq"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between"
  | "in";

export interface AdvancedFilter extends SimpleFilter {
  operator?: FilterOperator; // defaults to eq when omitted
  valueTo?: string; // used for between
}

export interface SortSpec {
  column: string;
  direction: "asc" | "desc";
}

// Explicit index signature to avoid 'unknown' indexing when casting
type RelatedSelections = Record<string, string[]>;

export async function getTableData(
  tableName: string,
  columns: string[],
  includeRelations = false,
  filters: (SimpleFilter | AdvancedFilter)[] = [],
  sort?: SortSpec | SortSpec[],
  relatedSelections: RelatedSelections = {}
): Promise<any[]> {
  try {
    // Separate main table columns from related table columns
    const mainColumns = columns.filter((col) => !col.includes("."));
    const relatedColumns = columns.filter((col) => col.includes("."));

    // Build select list starting with main table columns
    let selectList = mainColumns.join(",");
    // Identify filters & sorts that target related tables (table.column syntax)
    const foreignFilterTables = new Set<string>();
    const foreignSortTables = new Set<string>();
    for (const fRaw of filters) {
      const f = fRaw as AdvancedFilter;
      if (f.column && f.column.includes(".")) {
        foreignFilterTables.add(f.column.split(".")[0]);
      }
    }
    if (sort) {
      const sArr = Array.isArray(sort) ? sort : [sort];
      for (const s of sArr) {
        if (s.column && s.column.includes(".")) {
          foreignSortTables.add(s.column.split(".")[0]);
        }
      }
    }
    // Build effective related selections: merge explicit relatedSelections with columns from displayedColumns
    const ensuredSelections: RelatedSelections = { ...relatedSelections };

    // Add related columns from the columns parameter (table.column format)
    for (const relCol of relatedColumns) {
      const [rt, rc] = relCol.split(".");
      ensuredSelections[rt] = ensuredSelections[rt] || [];
      if (
        !ensuredSelections[rt].includes(rc) &&
        !ensuredSelections[rt].includes("*")
      ) {
        ensuredSelections[rt].push(rc);
      }
    }
    for (const fRaw of filters) {
      const f = fRaw as AdvancedFilter;
      if (f.column && f.column.includes(".")) {
        const [rt, rc] = f.column.split(".");
        ensuredSelections[rt] = ensuredSelections[rt] || [];
        if (
          !ensuredSelections[rt].includes(rc) &&
          !ensuredSelections[rt].includes("*")
        ) {
          ensuredSelections[rt].push(rc);
        }
      }
    }
    if (sort) {
      const sArr = Array.isArray(sort) ? sort : [sort];
      for (const s of sArr) {
        if (s.column && s.column.includes(".")) {
          const [rt, rc] = s.column.split(".");
          ensuredSelections[rt] = ensuredSelections[rt] || [];
          if (
            !ensuredSelections[rt].includes(rc) &&
            !ensuredSelections[rt].includes("*")
          ) {
            ensuredSelections[rt].push(rc);
          }
        }
      }
    }
    if (includeRelations) {
      try {
        const { data: tablesMeta } = await supabaseServer.rpc(
          "get_tables_info",
          {}
        );
        const meta = ((tablesMeta || []) as any[]).find(
          (t: any) => t.name === tableName
        );
        if (meta && Array.isArray(meta.foreign_keys)) {
          const relatedTables: string[] = Array.from(
            new Set<string>(
              meta.foreign_keys
                .filter(
                  (fk: any) =>
                    fk.referencedTable && fk.referencedTable !== tableName
                )
                .map((fk: any) => fk.referencedTable as string)
            )
          );
          const segments: string[] = [];
          for (const rawRt of relatedTables) {
            const rt = rawRt as string;
            const cols = ensuredSelections[rt];
            // Use inner join when we filter or sort on this related table to exclude NULL matches
            const needsInner =
              foreignFilterTables.has(rt) || foreignSortTables.has(rt);
            const joinPrefix = needsInner ? `${rt}!inner` : rt;
            if (cols && cols.length > 0) {
              if (cols.includes("*")) {
                segments.push(`${joinPrefix}(*)`);
              } else {
                segments.push(`${joinPrefix}(${cols.join(",")})`);
              }
            } else {
              // minimal selection to make ordering possible (id)
              segments.push(`${joinPrefix}(id)`);
            }
          }
          if (segments.length > 0) {
            selectList = [selectList, ...segments].join(",");
          }
        }
      } catch (e) {
        console.warn("[v0] Failed to append related tables to select:", e);
      }
    }
    console.debug("[schema] Built selectList:", selectList);

    let query = supabaseServer.from(tableName).select(selectList).limit(100);

    // Helper to decide if a string looks numeric (for GT/LT comparisons)
    const looksNumeric = (val: string) => /^-?\d+(\.\d+)?$/.test(val);

    // Apply advanced filters (support dot path for related table columns)
    for (const raw of filters) {
      const f = raw as AdvancedFilter; // treat as advanced, fallback to eq
      if (!f.column) continue;
      if (f.value === undefined || f.value === "") continue;

      const op: FilterOperator = f.operator || "eq";
      const column = f.column;
      const value = f.value;

      switch (op) {
        case "eq":
          query = query.eq(column, value);
          break;
        case "contains":
          query = query.ilike(column, `%${value}%`);
          break;
        case "startsWith":
          query = query.ilike(column, `${value}%`);
          break;
        case "endsWith":
          query = query.ilike(column, `%${value}`);
          break;
        case "gt":
          query = query.gt(column, looksNumeric(value) ? Number(value) : value);
          break;
        case "gte":
          query = query.gte(
            column,
            looksNumeric(value) ? Number(value) : value
          );
          break;
        case "lt":
          query = query.lt(column, looksNumeric(value) ? Number(value) : value);
          break;
        case "lte":
          query = query.lte(
            column,
            looksNumeric(value) ? Number(value) : value
          );
          break;
        case "between": {
          // Apply as gte + lte when both values present
          const v2 = f.valueTo;
          if (v2 && v2 !== "") {
            query = query.gte(
              column,
              looksNumeric(value) ? Number(value) : value
            );
            query = query.lte(column, looksNumeric(v2) ? Number(v2) : v2);
          } else {
            // fallback to eq if second value missing
            query = query.eq(column, value);
          }
          break;
        }
        case "in": {
          // Comma or semicolon separated list
          const parts = value
            .split(/[,;]+/)
            .map((p) => p.trim())
            .filter(Boolean);
          if (parts.length > 0) {
            query = query.in(column, parts);
          }
          break;
        }
        default:
          query = query.eq(column, value);
      }
    }

    // Apply sorting (support multiple)
    if (sort) {
      const sorts = Array.isArray(sort) ? sort : [sort];
      for (const s of sorts) {
        if (!s.column) continue;
        if (s.column.includes(".")) {
          // Supabase requires foreignTable option instead of dot path for order
          const [rt, rc] = s.column.split(".");
          query = query.order(rc, {
            ascending: s.direction === "asc",
            foreignTable: rt,
          });
        } else if (columns.includes(s.column)) {
          query = query.order(s.column, { ascending: s.direction === "asc" });
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[v0] Error fetching table data:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[v0] Error in getTableData:", error);
    return [];
  }
}
