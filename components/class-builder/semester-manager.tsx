"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Trash2, Archive, ArchiveRestore, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Semester, Category } from "@/types/classes";

type SemesterManagerProps = {
  semesters: Semester[];
  onUpdate: (semesters: Semester[]) => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
};

const PRESET_COLORS = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Teal", value: "bg-teal-500" },
  { name: "Amber", value: "bg-amber-500" },
];

export function SemesterManager({
  semesters,
  onUpdate,
  categories,
  onUpdateCategories,
}: SemesterManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("bg-blue-500");

  const handleAdd = () => {
    if (!name || !startDate || !endDate) return;

    const newSemester: Semester = {
      id: Date.now().toString(),
      name,
      startDate,
      endDate,
      classes: [],
      archived: false,
    };

    onUpdate([...semesters, newSemester]);
    setName("");
    setStartDate("");
    setEndDate("");
  };

  const handleDelete = (id: string) => {
    onUpdate(semesters.filter((s) => s.id !== id));
  };

  const handleToggleArchive = (id: string) => {
    onUpdate(
      semesters.map((s) => (s.id === id ? { ...s, archived: !s.archived } : s))
    );
  };

  const handleAddCategory = () => {
    if (!categoryName) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryName,
      color: categoryColor,
    };

    onUpdateCategories([...categories, newCategory]);
    setCategoryName("");
    setCategoryColor("bg-blue-500");
  };

  const handleDeleteCategory = (id: string) => {
    onUpdateCategories(categories.filter((c) => c.id !== id));
  };

  const activeSemesters = semesters.filter((s) => !s.archived);
  const archivedSemesters = semesters.filter((s) => s.archived);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Manage Semesters
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Semesters & Categories</DialogTitle>
          <DialogDescription>
            Organize your classes with semesters and categories
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="semesters" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="semesters">Semesters</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="semesters" className="space-y-4 mt-4">
            {activeSemesters.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Active Semesters</h3>
                {activeSemesters.map((semester) => (
                  <div
                    key={semester.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{semester.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(semester.startDate).toLocaleDateString()} -{" "}
                        {new Date(semester.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleArchive(semester.id)}
                        title="Archive semester"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(semester.id)}
                        disabled={semesters.length === 1}
                        title="Delete semester"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {archivedSemesters.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-muted-foreground">
                  Archived Semesters
                </h3>
                {archivedSemesters.map((semester) => (
                  <div
                    key={semester.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-muted-foreground">
                        {semester.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(semester.startDate).toLocaleDateString()} -{" "}
                        {new Date(semester.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleArchive(semester.id)}
                        title="Restore semester"
                      >
                        <ArchiveRestore className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(semester.id)}
                        title="Delete semester"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Add New Semester</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Semester Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Fall 2025"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAdd}
                  disabled={!name || !startDate || !endDate}
                  className="w-full"
                >
                  Add Semester
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            {categories.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Existing Categories</h3>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${category.color}`} />
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Add New Category</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    placeholder="e.g., Programming"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`h-10 rounded border-2 ${color.value} ${
                          categoryColor === color.value
                            ? "border-foreground ring-2 ring-offset-2"
                            : "border-transparent"
                        }`}
                        onClick={() => setCategoryColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleAddCategory}
                  disabled={!categoryName}
                  className="w-full"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
