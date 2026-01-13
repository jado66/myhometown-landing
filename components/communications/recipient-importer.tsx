"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Upload, FileText, X, AlertTriangle, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ImportedContact {
  name: string;
  phone: string;
  isValid: boolean;
  error?: string;
}

interface RecipientImporterProps {
  onImport: (contacts: ImportedContact[]) => void;
  maxContacts?: number;
}

const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");
  
  // Handle US numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  
  // Already has country code
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return phone; // Return original if can't parse
};

const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  // US number: 10 digits or 11 digits starting with 1
  if (cleaned.length === 10) return true;
  if (cleaned.length === 11 && cleaned.startsWith("1")) return true;
  // International: 7-15 digits
  if (cleaned.length >= 7 && cleaned.length <= 15) return true;
  return false;
};

const parseCSV = (content: string): ImportedContact[] => {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const contacts: ImportedContact[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Skip header row (common headers)
    if (
      i === 0 &&
      (line.toLowerCase().includes("name") || line.toLowerCase().includes("phone"))
    ) {
      continue;
    }

    // Split by comma, handle quoted values
    const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const cleanParts = parts.map((p) => p.replace(/^"|"$/g, "").trim());

    let name = "";
    let phone = "";

    if (cleanParts.length === 1) {
      // Only phone number
      phone = cleanParts[0];
      name = "Imported Contact";
    } else if (cleanParts.length >= 2) {
      // Name and phone
      name = cleanParts[0];
      phone = cleanParts[1];
    }

    if (!phone) continue;

    const normalizedPhone = normalizePhoneNumber(phone);
    const isValid = validatePhoneNumber(normalizedPhone);

    contacts.push({
      name: name || "Unknown",
      phone: normalizedPhone,
      isValid,
      error: isValid ? undefined : "Invalid phone number format",
    });
  }

  return contacts;
};

export function RecipientImporter({ onImport, maxContacts = 1000 }: RecipientImporterProps) {
  const [importing, setImporting] = useState(false);
  const [previewContacts, setPreviewContacts] = useState<ImportedContact[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content);
      
      if (parsed.length > maxContacts) {
        setPreviewContacts(parsed.slice(0, maxContacts));
      } else {
        setPreviewContacts(parsed);
      }
      
      setImporting(false);
    };
    reader.onerror = () => {
      setImporting(false);
      setPreviewContacts([]);
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    onImport(previewContacts.filter((c) => c.isValid));
    handleClear();
  };

  const handleClear = () => {
    setPreviewContacts([]);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validCount = previewContacts.filter((c) => c.isValid).length;
  const invalidCount = previewContacts.filter((c) => !c.isValid).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Recipients from CSV</CardTitle>
        <CardDescription>
          Upload a CSV file with phone numbers to bulk import recipients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Processing..." : "Choose CSV File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {fileName && (
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{fileName}</span>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Format Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p className="font-semibold">CSV Format:</p>
              <div className="text-xs space-y-1">
                <p>• Two columns: Name, Phone Number</p>
                <p>• Example: John Doe, (555) 123-4567</p>
                <p>• Phone-only format also supported: (555) 123-4567</p>
                <p>• Header row is optional and will be skipped if detected</p>
                <p>• Maximum {maxContacts.toLocaleString()} contacts per import</p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Preview Section */}
        {previewContacts.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Import Preview</h4>
                <div className="flex gap-2">
                  {validCount > 0 && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      {validCount} Valid
                    </Badge>
                  )}
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>
              </div>

              {invalidCount > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {invalidCount} contact{invalidCount !== 1 ? "s have" : " has"} invalid
                    phone number{invalidCount !== 1 ? "s" : ""} and will be skipped
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              <div className="rounded-lg border max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewContacts.map((contact, index) => (
                      <TableRow
                        key={index}
                        className={cn(!contact.isValid && "bg-destructive/10")}
                      >
                        <TableCell>
                          {contact.isValid ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <X className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono text-sm">{contact.phone}</p>
                            {contact.error && (
                              <p className="text-xs text-destructive mt-1">
                                {contact.error}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportConfirm}
                  disabled={validCount === 0}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Import {validCount} Contact{validCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
