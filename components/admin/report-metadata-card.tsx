"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import type { ReportVariable } from "./variables-card";

interface ReportMetadataCardProps {
  reportTitle: string;
  setReportTitle: (value: string) => void;
  reportHeader: string;
  setReportHeader: (value: string) => void;
  reportDescription: string;
  setReportDescription: (value: string) => void;
  variables?: ReportVariable[];
}

export function ReportMetadataCard({
  reportTitle,
  setReportTitle,
  reportHeader,
  setReportHeader,
  reportDescription,
  setReportDescription,
  variables = [],
}: ReportMetadataCardProps) {
  return (
    <Card className="col-span-1 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <FileText className="h-4.5 w-4.5 text-accent" />
          </div>
          Report Metadata
        </CardTitle>
        <CardDescription className="mt-2">
          Add custom title, header, and description to your exports
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <div className="space-y-2">
          <Label htmlFor="report-title" className="text-sm font-semibold">
            Report Title
          </Label>
          <Input
            id="report-title"
            placeholder="e.g., Q4 2024 Volunteer Activity Report"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="h-11 bg-background border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            Main title that appears at the top of exported reports
          </p>
          {variables.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Use {`{{param1}}, {{param2}}`} for dynamic values
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-header" className="text-sm font-semibold">
            Report Header
          </Label>
          <Input
            id="report-header"
            placeholder="e.g., MyHometown Community Services"
            value={reportHeader}
            onChange={(e) => setReportHeader(e.target.value)}
            className="h-11 bg-background border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            Organization or department name shown above the title
          </p>
          {variables.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Use {`{{param1}}, {{param2}}`} for dynamic values
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-description" className="text-sm font-semibold">
            Description
          </Label>
          <Textarea
            id="report-description"
            placeholder="e.g., This report summarizes volunteer activities and participation metrics for the fourth quarter of 2024..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="min-h-[100px] bg-background border-border/50 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Additional context or summary for the report
          </p>
          {variables.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Use {`{{param1}}, {{param2}}`} for dynamic values
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
