"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, Plus, Trash2, Search } from "lucide-react";
import type { FormField, SignupForm } from "@/types/classes";
import { Textarea } from "@/components/ui/textarea";
import {
  AVAILABLE_FIELDS,
  STRUCTURAL_ELEMENTS,
} from "@/lib/classes/available-fields";

type FormBuilderProps = {
  form: SignupForm;
  onChange: (form: SignupForm) => void;
};

export function FormBuilder({ form, onChange }: FormBuilderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const allFields = { ...AVAILABLE_FIELDS, ...STRUCTURAL_ELEMENTS };
  const categories = Array.from(
    new Set(Object.values(allFields).map((f) => f.category))
  );

  const filteredFields = Object.entries(allFields).filter(([key, field]) => {
    const matchesSearch =
      field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.category.toLowerCase().includes(searchTerm.toLowerCase());
    const notInForm = !form.fields.some((f) => f.id === key);
    return matchesSearch && notInForm;
  });

  const handleAddField = (fieldKey: string) => {
    const fieldTemplate = allFields[fieldKey as keyof typeof allFields];

    // Special handling for address field - add all address sub-fields
    if (fieldKey === "address") {
      const addressFields: FormField[] = [
        {
          id: "addressLine1",
          type: "text",
          label: "Address Line 1",
          required: false,
        },
        {
          id: "addressLine2",
          type: "text",
          label: "Address Line 2",
          required: false,
        },
        { id: "city", type: "text", label: "City", required: false },
        { id: "state", type: "text", label: "State/Province", required: false },
        {
          id: "zipCode",
          type: "text",
          label: "ZIP/Postal Code",
          required: false,
        },
        { id: "country", type: "text", label: "Country", required: false },
      ];
      onChange({ fields: [...form.fields, ...addressFields] });
    } else {
      const newField: FormField = {
        id: fieldKey,
        type: fieldTemplate.type,
        label: fieldTemplate.label,
        required: fieldTemplate.required,
        options: "options" in fieldTemplate ? fieldTemplate.options : undefined,
        content: "content" in fieldTemplate ? fieldTemplate.content : undefined,
        url: "url" in fieldTemplate ? fieldTemplate.url : undefined,
      };
      onChange({ fields: [...form.fields, newField] });
    }

    setIsAddDialogOpen(false);
    setSearchTerm("");
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    onChange({
      fields: form.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const handleDeleteField = (id: string) => {
    onChange({ fields: form.fields.filter((f) => f.id !== id) });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFields = [...form.fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);

    onChange({ fields: newFields });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const needsContentEditing = (field: FormField) => {
    return (
      field.type === "header" ||
      field.type === "staticText" ||
      field.type === "externalLink" ||
      field.type === "bannerImage"
    );
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Signup Form Builder</CardTitle>
          <CardDescription>
            Customize the information you collect from students
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {form.fields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-move"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{field.label}</p>
                <p className="text-sm text-muted-foreground">
                  {field.type} {field.required && "• Required"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {needsContentEditing(field) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Edit Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit {field.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {field.type === "select" && (
                          <div>
                            <Label>Options (one per line)</Label>
                            <Textarea
                              value={field.options?.join("\n") || ""}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  options: e.target.value
                                    .split("\n")
                                    .filter(Boolean),
                                })
                              }
                              rows={4}
                            />
                          </div>
                        )}
                        {(field.type === "header" ||
                          field.type === "staticText") && (
                          <div>
                            <Label>Content</Label>
                            <Textarea
                              value={field.content || ""}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  content: e.target.value,
                                })
                              }
                              rows={3}
                            />
                          </div>
                        )}
                        {(field.type === "externalLink" ||
                          field.type === "bannerImage") && (
                          <div>
                            <Label>URL</Label>
                            <Input
                              value={field.url || ""}
                              onChange={(e) =>
                                handleUpdateField(field.id, {
                                  url: e.target.value,
                                })
                              }
                              placeholder="https://..."
                            />
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {field.type !== "header" &&
                  field.type !== "staticText" &&
                  field.type !== "divider" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          handleUpdateField(field.id, { required: !!checked })
                        }
                      />
                      <Label
                        htmlFor={`required-${field.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Required
                      </Label>
                    </div>
                  )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Add Form Field</DialogTitle>
              <DialogDescription>
                Choose a field to add to your form
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs defaultValue={categories[0]}>
                <TabsList
                  className="grid w-full"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(
                      categories.length,
                      4
                    )}, 1fr)`,
                  }}
                >
                  {categories.slice(0, 4).map((cat) => (
                    <TabsTrigger key={cat} value={cat} className="text-xs">
                      {cat.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="grid grid-cols-2 gap-2">
                        {filteredFields
                          .filter(([_, field]) => field.category === category)
                          .map(([key, field]) => (
                            <Button
                              key={key}
                              variant="outline"
                              className="h-auto flex-col items-start p-3 text-left bg-transparent"
                              onClick={() => handleAddField(key)}
                            >
                              <span className="font-medium text-sm">
                                {field.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {field.type}
                              </span>
                            </Button>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
