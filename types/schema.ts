export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  foreignKeys: ForeignKey[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
}

export interface ForeignKey {
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface SchemaData {
  tables: TableSchema[];
  error?: string; // Add optional error field to track configuration issues
}
