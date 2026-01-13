"use client";

import { useState } from "react";
import { FileUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface ImportCsvHelpDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const EXAMPLE_DATA = [
  {
    first_name: "Jane",
    middle_name: "A.",
    last_name: "Doe",
    email: "jane.doe@email.com",
    phone: "801-555-1234",
    groups: "Teacher",
  },
  {
    first_name: "John",
    middle_name: "",
    last_name: "Smith",
    email: "",
    phone: "801-555-5678",
    groups: "Missionary",
  },
];

export function ImportCsvHelpDialog({
  open,
  onClose,
  onImport,
}: ImportCsvHelpDialogProps) {
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImport(event);
    setFileInputKey((prev) => prev + 1); // Reset file input
    onClose();
  };

  const downloadTemplate = () => {
    const headers = [
      "First Name",
      "Middle Name",
      "Last Name",
      "Email",
      "Phone",
      "Groups",
    ];
    const rows = [
      ["Jane", "A.", "Doe", "jane.doe@email.com", "801-555-1234", "Missionary"],
      ["John", "", "Smith", "", "801-555-5678", "Work"],
    ];

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "contacts-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts from CSV</DialogTitle>
          <DialogDescription>
            Learn how to format your CSV file for importing contacts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>First Name</strong> (required) - Contact&apos;s first
                name
              </li>
              <li>
                <strong>Last Name</strong> (required) - Contact&apos;s last name
              </li>
              <li>
                <strong>Phone</strong> (required) - Phone number (will be
                formatted automatically)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Optional Columns:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>
                <strong>Middle Name</strong> - Contact&apos;s middle name or
                initial
              </li>
              <li>
                <strong>Email</strong> - Email address
              </li>
              <li>
                <strong>Groups</strong> - Group names (recommended for
                organization)
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Example Format:</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Middle Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Groups</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXAMPLE_DATA.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.first_name}</TableCell>
                      <TableCell>{row.middle_name || "—"}</TableCell>
                      <TableCell>{row.last_name}</TableCell>
                      <TableCell>{row.email || "—"}</TableCell>
                      <TableCell>{row.phone}</TableCell>
                      <TableCell>{row.groups}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Important Tips:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All column headers are case-insensitive</li>
              <li>Extra columns will be ignored</li>
              <li>Phone numbers will be automatically formatted</li>
              <li>For multiple groups, separate them with semicolons (;)</li>
              <li>Duplicate phone numbers will be skipped</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Input
            key={fileInputKey}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="flex-1">
            <Button variant="default" className="w-full" asChild>
              <span>
                <FileUp className="h-4 w-4 mr-2" />
                Import CSV File
              </span>
            </Button>
          </label>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
