"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import {
  format,
  startOfMonth,
  getYear,
  setMonth,
  isAfter,
  isSameMonth,
} from "date-fns";

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

interface Category {
  value: string;
  label: string;
  description: string | React.ReactNode;
}

const categories: Category[] = [
  {
    value: "crc",
    label: "Community Resource Center",
    description:
      "Log any hours associated with Community Resource Center activities, including community events, tutoring, meetings, planning, travel, etc.",
  },
  {
    value: "dos",
    label: "Days Of Service",
    description:
      "Log any hours associated with Days Of Service activities, including meeting, planning, travel, etc.",
  },
  {
    value: "administrative",
    label: "Administrative Work",
    description: (
      <>
        <strong>ONLY</strong> log hours in this category if you are a myHometown
        Utah, City, or Community Executive.
      </>
    ),
  },
];

function getMonthOptions() {
  const options = [];
  const now = new Date();
  const currentYear = getYear(now);
  for (let month = 0; month < 12; month++) {
    const date = startOfMonth(setMonth(new Date(currentYear, 0), month));
    if (isAfter(date, now)) {
      continue;
    }
    options.push({
      value: date.toISOString(),
      label: format(date, "MMMM yyyy"),
    });
  }
  return options.reverse();
}

interface LogHoursDialogProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  activities: DetailedActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DetailedActivity[]>>;
  updateActivity: (
    id: string,
    field: keyof Omit<DetailedActivity, "id">,
    value: string
  ) => void;
  error: string | null;
  submitting: boolean;
  handleSubmit: () => void;
  editingId: string | null;
  resetForm: () => void;
}

export function LogHoursDialog({
  open,
  onClose,
  selectedDate,
  setSelectedDate,
  activities,
  setActivities,
  updateActivity,
  error,
  submitting,
  handleSubmit,
  editingId,
  resetForm,
}: LogHoursDialogProps) {
  // Ensure we always have one activity object per defined category
  useEffect(() => {
    if (!open) return;
    setActivities((prev: DetailedActivity[]) => {
      const byCategory = new Map(
        prev.map((a: DetailedActivity) => [a.category, a])
      );
      let changed = false;
      const normalized = categories.map((cat) => {
        if (byCategory.has(cat.value)) return byCategory.get(cat.value)!;
        changed = true;
        return {
          id: cat.value,
          category: cat.value,
          description: "",
          hours: "",
        } as DetailedActivity;
      });
      const extras = prev.filter(
        (a: DetailedActivity) => !categories.some((c) => c.value === a.category)
      );
      if (extras.length) {
        changed = true;
        return [...normalized, ...extras];
      }
      return changed ? normalized : prev;
    });
  }, [open, setActivities]);

  const totalHours = activities.reduce(
    (sum, act) => sum + (Number(act.hours) || 0),
    0
  );

  const monthOptions = getMonthOptions();

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          resetForm();
        }
      }}
    >
      <DialogContent className="!max-w-[1200px] w-[95vw] h-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {editingId ? "Edit" : "Log"} Your Service Hours
          </DialogTitle>
          <DialogDescription>
            Track your service hours by month and activity category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Selection */}
          <div className="space-y-2">
            <Label htmlFor="month-select" className="text-sm font-medium">
              Select Month
            </Label>
            <select
              id="month-select"
              className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={
                monthOptions.find((opt) =>
                  isSameMonth(new Date(opt.value), selectedDate)
                )?.value || ""
              }
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            >
              <option value="">Choose month...</option>
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Breakdown */}
          <div className="space-y-2">
            <div>
              <h3 className="text-lg font-semibold">Activity Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Enter hours for applicable categories (You can leave categories
                blank)
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              {categories.map((category, index) => {
                const activity = activities.find(
                  (a) => a.category === category.value
                ) || {
                  id: category.value,
                  category: category.value,
                  description: "",
                  hours: "",
                };

                return (
                  <div
                    key={category.value}
                    className={`p-3 hover:bg-muted/50 transition-colors ${
                      index !== categories.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-semibold text-primary text-sm">
                          {category.label}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {category.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`hours-${category.value}`}
                            className="text-xs"
                          >
                            Hours
                          </Label>
                          <Input
                            id={`hours-${category.value}`}
                            type="number"
                            step="0.25"
                            min="0"
                            placeholder="0"
                            value={activity.hours}
                            onChange={(e) =>
                              updateActivity(
                                activity.id,
                                "hours",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <Label
                            htmlFor={`desc-${category.value}`}
                            className="text-xs"
                          >
                            Description (optional)
                          </Label>
                          <Input
                            id={`desc-${category.value}`}
                            placeholder="Describe activities..."
                            value={activity.description}
                            onChange={(e) =>
                              updateActivity(
                                activity.id,
                                "description",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Hours Display */}
          <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground px-6 py-2 rounded-md">
              <span className="font-semibold">
                Total: {totalHours.toFixed(0)} hours
              </span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingId ? "Updating..." : "Logging..."}
              </>
            ) : editingId ? (
              "Update Hours"
            ) : (
              "Log Hours"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
