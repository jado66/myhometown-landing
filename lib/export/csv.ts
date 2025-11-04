import Papa from "papaparse";

interface ReportMetadata {
  reportTitle?: string;
  reportHeader?: string;
  reportDescription?: string;
  generatedAt?: string;
  table?: string;
  rowCount?: number;
  columnCount?: number;
}

export function exportToCSV(
  data: any[],
  filename: string,
  metadata?: ReportMetadata
) {
  let csvContent = "";

  // Add metadata as header comments if provided
  if (metadata) {
    if (metadata.reportHeader) {
      csvContent += `# ${metadata.reportHeader}\n`;
    }
    if (metadata.reportTitle) {
      csvContent += `# Report: ${metadata.reportTitle}\n`;
    }
    if (metadata.reportDescription) {
      csvContent += `# Description: ${metadata.reportDescription}\n`;
    }
    if (metadata.generatedAt) {
      csvContent += `# Generated: ${metadata.generatedAt}\n`;
    }
    if (metadata.table) {
      csvContent += `# Source Table: ${metadata.table}\n`;
    }
    if (metadata.rowCount !== undefined) {
      csvContent += `# Total Rows: ${metadata.rowCount}\n`;
    }
    if (metadata.columnCount !== undefined) {
      csvContent += `# Total Columns: ${metadata.columnCount}\n`;
    }
    csvContent += "#\n"; // Empty comment line separator
  }

  // Convert data to CSV using Papa Parse
  const csv = Papa.unparse(data);
  csvContent += csv;

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
