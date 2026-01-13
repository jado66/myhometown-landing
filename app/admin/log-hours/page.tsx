"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/user-context";
import { LogHoursDialog } from "@/components/admin/log-hours-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { format, startOfMonth, isSameMonth, parseISO } from "date-fns";
import { toast } from "sonner";

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

interface MissionaryHourEntry {
  id: string;
  period_start_date: string;
  entry_method: "weekly" | "monthly";
  total_hours: number;
  location: string | null;
  activities: DetailedActivity[];
  created_at: string;
}

const categoryDisplay: { [key: string]: { label: string } } = {
  crc: { label: "Community Resource Center" },
  dos: { label: "Days Of Service" },
  administrative: { label: "Administrative Work" },
};

export default function LogHoursPage() {
  const { user, isLoading: userLoading } = useUser();
  const [hours, setHours] = useState<MissionaryHourEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHours: 0,
    thisMonthHours: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [visibleHoursCount, setVisibleHoursCount] = useState(3);

  // Dialog states
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Form states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<DetailedActivity[]>([
    { id: crypto.randomUUID(), category: "", description: "", hours: "" },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);
    try {
      const hoursResponse = await fetch(`/api/missionary/${user.email}/hours`);
      if (!hoursResponse.ok) {
        if (hoursResponse.status === 404) {
          throw new Error("MISSIONARY_NOT_FOUND");
        }
        throw new Error("Failed to fetch data.");
      }
      const { hours: hoursData } = await hoursResponse.json();
      setHours(hoursData);
      calculateStats(hoursData);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch dashboard data:", err);
      if (err.message !== "MISSIONARY_NOT_FOUND") {
        toast.error("Failed to load hours data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    }
  }, [user?.email]);

  const calculateStats = (hoursData: MissionaryHourEntry[]) => {
    const now = new Date();
    const totalHours = hoursData.reduce(
      (sum, h) => sum + Number(h.total_hours),
      0
    );

    const thisMonthHours = hoursData
      .filter((h) => {
        const entryDate = parseISO(h.period_start_date);
        const isSame = isSameMonth(entryDate, now);
        return isSame;
      })
      .reduce((sum, h) => sum + Number(h.total_hours), 0);

    setStats({ totalHours, thisMonthHours });
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setActivities([
      { id: crypto.randomUUID(), category: "", description: "", hours: "" },
    ]);
    setEditingId(null);
  };

  const handleLogHours = () => {
    resetForm();
    setLogDialogOpen(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/missionary/hours/${id}`);
      if (!response.ok) throw new Error("Failed to fetch entry for editing.");

      const entryData = await response.json();
      setEditingId(id);
      setSelectedDate(parseISO(entryData.period_start_date));
      setActivities(
        entryData.activities.map((act: any) => ({
          ...act,
          id: crypto.randomUUID(),
          hours: String(act.hours),
        }))
      );
      setLogDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to load entry");
    }
  };

  const updateActivity = (
    id: string,
    field: keyof Omit<DetailedActivity, "id">,
    value: string
  ) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const totalActivityHours = activities.reduce(
        (sum, act) => sum + (Number(act.hours) || 0),
        0
      );

      if (totalActivityHours < 0) {
        throw new Error("Please enter valid hours.");
      }

      const periodStartDate = startOfMonth(selectedDate);

      const payload = {
        period_start_date: format(periodStartDate, "yyyy-MM-dd"),
        total_hours: totalActivityHours,
        activities: activities.map(({ id, ...rest }) => ({
          ...rest,
          hours: Number(rest.hours),
        })),
        entryMethod: "monthly",
      };

      const url = editingId
        ? `/api/missionary/hours/${editingId}`
        : "/api/missionary/hours";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? payload
            : {
                ...payload,
                email: user?.email,
              }
        ),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit hours.");
      }

      toast.success(
        editingId ? "Hours updated successfully" : "Hours logged successfully"
      );
      setLogDialogOpen(false);
      resetForm();
      fetchDashboardData();
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (id: string) => {
    setEntryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setEntryToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      const response = await fetch(`/api/missionary/hours/${entryToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete entry.");

      toast.success("Hours entry deleted");
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to delete entry");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error === "MISSIONARY_NOT_FOUND") {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Account Not Set Up</p>
              <p>
                Your account ({user.email}) is not yet registered in the
                Missionary Volunteer Management System. Please contact your
                Community Executive Director to have your account added to the
                missionaries roster.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Log Service Hours</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome back, {user.first_name || user.email}!
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Log New Hours Button */}
      <Button
        onClick={handleLogHours}
        size="lg"
        className="w-full h-24 text-2xl"
      >
        <Plus className="mr-2 h-6 w-6" />
        Log New Hours
      </Button>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.totalHours}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {stats.thisMonthHours}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Hour Logs */}
      {hours.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <Alert>
              <AlertDescription>No hours logged yet.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Hour Logs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Column Headers */}
            <div className="px-6 py-3 border-b bg-muted/50">
              <div className="grid grid-cols-12 gap-4 items-center font-semibold text-sm">
                <div className="col-span-3">Month</div>
                <div className="col-span-2">Total Hours</div>
                <div className="col-span-3">Date Logged</div>
                <div className="col-span-4 text-right">Actions</div>
              </div>
            </div>

            {/* Hours List */}
            <Accordion type="single" collapsible className="w-full">
              {hours
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.period_start_date).getTime() -
                    new Date(a.period_start_date).getTime()
                )
                .slice(0, visibleHoursCount)
                .map((entry) => (
                  <AccordionItem
                    key={entry.id}
                    value={entry.id}
                    className="border-b last:border-0"
                  >
                    <AccordionTrigger className="px-6 hover:bg-muted/50 [&[data-state=open]]:bg-muted/50">
                      <div className="grid grid-cols-12 gap-4 items-center w-full text-left">
                        <div className="col-span-3 font-semibold">
                          {format(
                            parseISO(entry.period_start_date),
                            "MMMM yyyy"
                          )}
                        </div>
                        <div className="col-span-2">
                          <Badge variant="default">
                            {entry.total_hours} hours
                          </Badge>
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {format(parseISO(entry.created_at), "yyyy-MM-dd")}
                        </div>
                        <div className="col-span-4 flex justify-end gap-2">
                          <div
                            role="button"
                            tabIndex={0}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(entry.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleEdit(entry.id);
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </div>
                          <div
                            role="button"
                            tabIndex={0}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeleteDialog(entry.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                handleOpenDeleteDialog(entry.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Activity</TableHead>
                            <TableHead className="text-right">Hours</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.activities
                            .filter(
                              (act) => act.category && Number(act.hours) > 0
                            )
                            .map((act, actIdx) => (
                              <TableRow key={actIdx}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {categoryDisplay[act.category]?.label ||
                                        act.category}
                                    </div>
                                    {act.description && (
                                      <div className="text-sm text-muted-foreground">
                                        {act.description}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {act.hours}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>

            {/* Show More Button */}
            {hours.length > visibleHoursCount && (
              <div className="p-4 flex justify-center border-t">
                <Button
                  variant="outline"
                  onClick={() => setVisibleHoursCount((prev) => prev + 5)}
                >
                  Show More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Log Hours Dialog */}
      <LogHoursDialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        activities={activities}
        setActivities={setActivities}
        updateActivity={updateActivity}
        error={error}
        submitting={submitting}
        handleSubmit={handleSubmit}
        editingId={editingId}
        resetForm={resetForm}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hour Log?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this hour log? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
