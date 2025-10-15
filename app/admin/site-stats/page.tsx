"use client";

import { useEffect, useState } from "react";
import type { SiteStat } from "@/types/site-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SiteStatsEditor() {
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedStats, setEditedStats] = useState<Record<string, SiteStat>>({});

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

  function handleEdit(stat: SiteStat) {
    setEditingId(stat.id);
    setEditedStats({ ...editedStats, [stat.id]: { ...stat } });
  }

  function handleCancel(id: string) {
    setEditingId(null);
    const newEdited = { ...editedStats };
    delete newEdited[id];
    setEditedStats(newEdited);
  }

  async function handleSave(id: string) {
    const editedStat = editedStats[id];
    if (!editedStat) return;

    try {
      const response = await fetch("/api/site-stats", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editedStat.id,
          stat_value: editedStat.stat_value,
          stat_label: editedStat.stat_label,
          stat_suffix: editedStat.stat_suffix,
          is_active: editedStat.is_active,
        }),
      });

      if (!response.ok) throw new Error("Failed to update stat");

      const updatedStat = await response.json();

      // Update local state
      setStats(stats.map((s) => (s.id === updatedStat.id ? updatedStat : s)));
      setEditingId(null);
      const newEdited = { ...editedStats };
      delete newEdited[id];
      setEditedStats(newEdited);
    } catch (error) {
      console.error("Error updating stat:", error);
      alert("Error updating stat");
    }
  }

  function updateEditedStat(id: string, field: keyof SiteStat, value: any) {
    setEditedStats({
      ...editedStats,
      [id]: {
        ...editedStats[id],
        [field]: value,
      },
    });
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
      <h1 className="text-3xl font-bold mb-6">Site Stats Editor</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Suffix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => {
              const isEditing = editingId === stat.id;
              const currentStat = isEditing ? editedStats[stat.id] : stat;

              return (
                <TableRow key={stat.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={currentStat.stat_label}
                        onChange={(e) =>
                          updateEditedStat(
                            stat.id,
                            "stat_label",
                            e.target.value
                          )
                        }
                        className="h-8"
                      />
                    ) : (
                      stat.stat_label
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={currentStat.stat_value}
                        onChange={(e) =>
                          updateEditedStat(
                            stat.id,
                            "stat_value",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="h-8 w-24"
                      />
                    ) : (
                      <span className="font-semibold">
                        {stat.stat_value.toLocaleString()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={currentStat.stat_suffix || ""}
                        onChange={(e) =>
                          updateEditedStat(
                            stat.id,
                            "stat_suffix",
                            e.target.value
                          )
                        }
                        className="h-8 w-16"
                        placeholder="+"
                      />
                    ) : (
                      stat.stat_suffix
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleSave(stat.id)}
                          size="sm"
                          variant="default"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => handleCancel(stat.id)}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleEdit(stat)}
                        size="sm"
                        variant="outline"
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
