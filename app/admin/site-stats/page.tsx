"use client";

import { useEffect, useState } from "react";
import type { SiteStat } from "@/types/site-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SiteStatsEditor() {
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStat, setEditingStat] = useState<SiteStat | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const response = await fetch("/api/site-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editingStat) return;

    setSaving(true);
    try {
      const response = await fetch("/api/site-stats", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingStat.id,
          stat_value: editingStat.stat_value,
          stat_label: editingStat.stat_label,
          stat_suffix: editingStat.stat_suffix,
          is_active: editingStat.is_active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stat");

      const updatedStat = await response.json();

      // Update local state
      setStats(stats.map((s) => (s.id === updatedStat.id ? updatedStat : s)));
      setEditingStat(null);
      alert("Stat updated successfully!");
    } catch (error) {
      console.error("Error updating stat:", error);
      alert("Error updating stat");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Site Stats Editor</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Site Stats Editor</h1>

      <div className="grid gap-4">
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {stat.stat_label} ({stat.stat_key})
                </span>
                <Button
                  onClick={() => setEditingStat(stat)}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#318d43]">
                {stat.stat_value.toLocaleString()}
                {stat.stat_suffix}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Order: {stat.display_order} | Status:{" "}
                {stat.is_active ? "Active" : "Inactive"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingStat}
        onOpenChange={(open) => !open && setEditingStat(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Stat: {editingStat?.stat_key}</DialogTitle>
          </DialogHeader>

          {editingStat && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="stat_label">Label</Label>
                <Input
                  id="stat_label"
                  value={editingStat.stat_label}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      stat_label: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="stat_value">Value</Label>
                <Input
                  id="stat_value"
                  type="number"
                  value={editingStat.stat_value}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      stat_value: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="stat_suffix">Suffix (e.g., +)</Label>
                <Input
                  id="stat_suffix"
                  value={editingStat.stat_suffix || ""}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      stat_suffix: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingStat.is_active}
                  onChange={(e) =>
                    setEditingStat({
                      ...editingStat,
                      is_active: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="is_active">Active (shown on site)</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setEditingStat(null)}
              variant="outline"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
