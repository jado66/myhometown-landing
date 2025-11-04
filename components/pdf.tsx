import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  reportHeader: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    fontSize: 10,
    color: "#444",
    marginBottom: 10,
    lineHeight: 1.5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 10,
  },
  metadata: {
    fontSize: 9,
    color: "#888",
    marginBottom: 15,
  },
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#888",
  },
});

interface ReportMetadata {
  title?: string;
  header?: string;
  description?: string;
}

interface PDFReportProps {
  tableName: string;
  columns: string[];
  data: any[];
  includeRelations: boolean;
  metadata?: ReportMetadata;
}

function PDFReport({
  tableName,
  columns,
  data,
  includeRelations,
  metadata,
}: PDFReportProps) {
  const now = new Date().toLocaleString();

  return (
    <Document>
      <Page
        size="A4"
        orientation={columns.length > 5 ? "landscape" : "portrait"}
        style={styles.page}
      >
        <View style={styles.header}>
          {metadata?.header && (
            <Text style={styles.reportHeader}>{metadata.header}</Text>
          )}
          <Text style={styles.title}>
            {metadata?.title || `Data Report: ${tableName}`}
          </Text>
          {metadata?.description && (
            <Text style={styles.description}>{metadata.description}</Text>
          )}
          <Text style={styles.subtitle}>
            {columns.length} columns • {data.length} rows
            {includeRelations && " • With relations"}
          </Text>
          <Text style={styles.metadata}>
            Source: {tableName} • Generated on {now}
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {columns.map((col) => (
              <Text key={col} style={styles.tableCell}>
                {col}
              </Text>
            ))}
          </View>

          {data.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              {columns.map((col) => (
                <Text key={col} style={styles.tableCell}>
                  {row[col] === null
                    ? "null"
                    : typeof row[col] === "object"
                    ? JSON.stringify(row[col]).substring(0, 30) + "..."
                    : String(row[col]).substring(0, 50)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Global Reporting Tool • Page 1</Text>
      </Page>
    </Document>
  );
}

export async function exportToPDF(
  tableName: string,
  columns: string[],
  data: any[],
  includeRelations: boolean,
  metadata?: ReportMetadata
) {
  const blob = await pdf(
    <PDFReport
      tableName={tableName}
      columns={columns}
      data={data}
      includeRelations={includeRelations}
      metadata={metadata}
    />
  ).toBlob();

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${tableName}_${new Date().toISOString().split("T")[0]}.pdf`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
