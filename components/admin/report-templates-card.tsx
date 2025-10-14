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
import {
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  Sparkles,
} from "lucide-react";
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
    <Card className="border-2 border-primary/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                Report Templates
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary font-semibold"
              >
                {templates.length + savedQueries.length}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-primary/10">
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-sm">
          Click a template to load its configuration
        </CardDescription>
      </CardHeader>
      {open && (
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="group relative rounded-lg border-2 border-border hover:border-primary/50 bg-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                    {tpl.name}
                  </p>
                  <Sparkles className="h-4 w-4 text-primary/40 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs font-normal">
                    {tpl.table}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {tpl.columns.length} cols
                  </Badge>
                  {tpl.filters.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tpl.filters.length} filters
                    </Badge>
                  )}
                  {tpl.sorts.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tpl.sorts.length} sorts
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {savedQueries.map((tpl) => (
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
                className="group relative rounded-lg border-2 border-border hover:border-primary/50 bg-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer flex flex-col gap-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {tpl.name}
                    </p>
                    <Badge className="text-xs font-normal shrink-0 text-white">
                      Custom
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSaved(tpl.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs font-normal">
                    {tpl.table}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal">
                    {tpl.columns.length} cols
                  </Badge>
                  {tpl.filters.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tpl.filters.length} filters
                    </Badge>
                  )}
                  {tpl.sorts.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {tpl.sorts.length} sorts
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">
                  Save New Template
                </Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManageOpen((o) => !o)}
                className="hover:bg-primary/10"
              >
                {manageOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show
                  </>
                )}
              </Button>
            </div>
            {manageOpen && (
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4 text-primary" />
                  <Label htmlFor="saved-query-name" className="font-medium">
                    Save Current Configuration
                  </Label>
                </div>
                <Input
                  id="saved-query-name"
                  placeholder="e.g. Monthly Volunteer Summary"
                  value={savedQueryName}
                  onChange={(e) => onSavedQueryNameChange(e.target.value)}
                  disabled={loadingSaved}
                  className="border-2 focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={onSaveCurrent}
                    disabled={!canSaveCurrent || loadingSaved}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Current
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSavedQueryNameChange("")}
                    disabled={loadingSaved || !savedQueryName}
                    className="hover:bg-muted"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
