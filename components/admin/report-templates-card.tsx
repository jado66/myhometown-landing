"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2 } from "lucide-react";
import type { AdvancedFilter, SortSpec } from "@/app/actions/schema";

export interface TemplateInfo {
  id: string;
  name: string;
  table: string;
  columns: string[];
  includeRelations: boolean;
  filters: AdvancedFilter[];
  sorts: SortSpec[];
}

interface ReportTemplatesCardProps {
  templates: TemplateInfo[];
  savedQueries: TemplateInfo[]; // custom ones mapped to TemplateInfo
  loadingSaved: boolean;
  savedQueryName: string;
  onSavedQueryNameChange: (v: string) => void;
  onSaveCurrent: () => void;
  canSaveCurrent: boolean;
  onApplyTemplate: (tpl: TemplateInfo) => void;
  onDeleteSaved: (id: string) => void;
}

export function ReportTemplatesCard({
  templates,
  savedQueries,
  loadingSaved,
  savedQueryName,
  onSavedQueryNameChange,
  onSaveCurrent,
  canSaveCurrent,
  onApplyTemplate,
  onDeleteSaved,
}: ReportTemplatesCardProps) {
  const [open, setOpen] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <CardTitle className="text-base">Report Templates</CardTitle>
            <Badge variant="secondary">{templates.length}</Badge>
          </div>
          <Button variant="ghost" size="sm">
            {open ? "Collapse" : "Expand"}
          </Button>
        </div>
        <CardDescription>
          Click a template to load its configuration
        </CardDescription>
      </CardHeader>
      {open && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                role="button"
                tabIndex={0}
                onClick={() => onApplyTemplate(tpl)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onApplyTemplate(tpl);
                  }
                }}
                className="group rounded border px-3 py-2 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer flex flex-col gap-1"
              >
                <p className="font-medium truncate">{tpl.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {tpl.table} · {tpl.columns.length} cols · {tpl.filters.length}{" "}
                  filters · {tpl.sorts.length} sorts
                </p>
              </div>
            ))}
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-medium">Manage Templates</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManageOpen((o) => !o)}
              >
                {manageOpen ? "Hide" : "Show"}
              </Button>
            </div>
            {manageOpen && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saved-query-name">
                    Save Current Configuration
                  </Label>
                  <Input
                    id="saved-query-name"
                    placeholder="e.g. Monthly Volunteer Summary"
                    value={savedQueryName}
                    onChange={(e) => onSavedQueryNameChange(e.target.value)}
                    disabled={loadingSaved}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={onSaveCurrent}
                      disabled={!canSaveCurrent || loadingSaved}
                    >
                      Save Current
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSavedQueryNameChange("")}
                      disabled={loadingSaved || !savedQueryName}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                {loadingSaved ? (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                  </div>
                ) : savedQueries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No custom templates saved yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Label>Delete Saved Templates</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {savedQueries.map((q) => (
                        <div
                          key={q.id}
                          className="rounded border px-3 py-2 text-xs flex items-center justify-between"
                        >
                          <span className="truncate max-w-[70%]" title={q.name}>
                            {q.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-0"
                            onClick={() => onDeleteSaved(q.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
