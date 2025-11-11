/**
 * IndexedDB utilities for report templates
 */

import type { ReportVariable } from "@/components/admin/variables-card";

export interface SavedQuery {
  id: string;
  name: string;
  table: string;
  columns: string[];
  filters: any[];
  sorts: any[];
  includeRelations: boolean;
  createdAt: number;
  updatedAt: number;
  reportTitle?: string;
  reportHeader?: string;
  reportDescription?: string;
  variables?: ReportVariable[];
}

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
        store.createIndex("name", "name", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function listSavedQueries(): Promise<SavedQuery[]> {
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
    console.error("[reportDB] listSavedQueries error", e);
    return [];
  }
}

export async function loadQuery(id: string): Promise<SavedQuery | undefined> {
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
    console.error("[reportDB] loadQuery error", e);
    return undefined;
  }
}

export async function saveQuery(q: {
  name: string;
  table: string;
  columns: string[];
  filters: any[];
  sorts: any[];
  includeRelations: boolean;
  reportTitle?: string;
  reportHeader?: string;
  reportDescription?: string;
  variables?: ReportVariable[];
}): Promise<SavedQuery> {
  // Check for duplicate names first
  const existingQueries = await listSavedQueries();
  if (existingQueries.some((existing) => existing.name === q.name)) {
    throw new Error(
      `A query with the name "${q.name}" already exists. Please choose a different name.`
    );
  }

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
    reportTitle: q.reportTitle,
    reportHeader: q.reportHeader,
    reportDescription: q.reportDescription,
    variables: q.variables,
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
    console.error("[reportDB] saveQuery error", e);
    throw e;
  }
  return record;
}

export async function deleteQuery(id: string): Promise<void> {
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
    console.error("[reportDB] deleteQuery error", e);
    throw e;
  }
}

export async function updateQuery(
  id: string,
  updates: Partial<SavedQuery>
): Promise<SavedQuery> {
  try {
    const existing = await loadQuery(id);
    if (!existing) {
      throw new Error("Query not found");
    }

    const updated: SavedQuery = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.put(updated);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });

    return updated;
  } catch (e) {
    console.error("[reportDB] updateQuery error", e);
    throw e;
  }
}

export async function clearAllQueries(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = store.clear();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve();
    });
  } catch (e) {
    console.error("[reportDB] clearAllQueries error", e);
    throw e;
  }
}
