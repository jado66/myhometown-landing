"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { Class, Semester, Category } from "@/types/classes";
import { MeetingsEditor } from "./meetings-editor";
import { FormBuilder } from "./form-builder";
import { FormPreview } from "./form-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

type ClassEditorProps = {
  classData: Class;
  semester: Semester;
  categories: Category[];
  onSave: (classData: Class) => void;
  onCancel: () => void;
  onDelete: (classId: string) => void;
  isNew: boolean;
};

export function ClassEditor({
  classData,
  semester,
  categories,
  onSave,
  onCancel,
  onDelete,
  isNew,
}: ClassEditorProps) {
  const [editedClass, setEditedClass] = useState<Class>(classData);

  const handleSave = () => {
    onSave(editedClass);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Create" : "Edit"} Class
            </h1>
            <p className="text-muted-foreground">{semester.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Button
              variant="destructive"
              onClick={() => onDelete(editedClass.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Class
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Class Details</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="form">Signup Form</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the core details of your class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Class Title</Label>
                <Input
                  id="title"
                  value={editedClass.title}
                  onChange={(e) =>
                    setEditedClass({ ...editedClass, title: e.target.value })
                  }
                  placeholder="e.g., Introduction to Pottery"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedClass.description}
                  onChange={(e) =>
                    setEditedClass({
                      ...editedClass,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what students will learn in this class..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={editedClass.categoryId || "none"}
                  onValueChange={(value) =>
                    setEditedClass({
                      ...editedClass,
                      categoryId: value === "none" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teacher">Teacher (Optional)</Label>
                <Input
                  id="teacher"
                  value={editedClass.teacher || ""}
                  onChange={(e) =>
                    setEditedClass({ ...editedClass, teacher: e.target.value })
                  }
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editedClass.startDate}
                    onChange={(e) =>
                      setEditedClass({
                        ...editedClass,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editedClass.endDate}
                    onChange={(e) =>
                      setEditedClass({
                        ...editedClass,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedClass.location}
                  onChange={(e) =>
                    setEditedClass({ ...editedClass, location: e.target.value })
                  }
                  placeholder="e.g., Room 101, Art Building"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Capacity (Optional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={editedClass.capacity || ""}
                    onChange={(e) =>
                      setEditedClass({
                        ...editedClass,
                        capacity: e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Maximum number of students"
                  />
                </div>
                <div>
                  <Label htmlFor="enrolled">Currently Enrolled</Label>
                  <Input
                    id="enrolled"
                    type="number"
                    value={editedClass.enrolled || 0}
                    onChange={(e) =>
                      setEditedClass({
                        ...editedClass,
                        enrolled: e.target.value
                          ? Number.parseInt(e.target.value)
                          : 0,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="waitlist"
                  checked={editedClass.waitlistEnabled || false}
                  onCheckedChange={(checked) =>
                    setEditedClass({
                      ...editedClass,
                      waitlistEnabled: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="waitlist"
                  className="text-sm font-normal cursor-pointer"
                >
                  Enable waitlist when class is full
                </Label>
              </div>

              <div>
                <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
                <Input
                  id="bannerImage"
                  value={editedClass.bannerImage || ""}
                  onChange={(e) =>
                    setEditedClass({
                      ...editedClass,
                      bannerImage: e.target.value,
                    })
                  }
                  placeholder="https://example.com/banner.jpg"
                />
                {editedClass.bannerImage && (
                  <div className="mt-2 rounded-lg overflow-hidden border">
                    <img
                      src={editedClass.bannerImage || "/placeholder.svg"}
                      alt="Banner preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingsEditor
            meetings={editedClass.meetings}
            onChange={(meetings: any) =>
              setEditedClass({ ...editedClass, meetings })
            }
          />
        </TabsContent>

        <TabsContent value="form">
          <FormBuilder
            form={editedClass.signupForm}
            onChange={(signupForm: any) =>
              setEditedClass({ ...editedClass, signupForm })
            }
          />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
              <CardDescription>
                This is how your signup form will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <FormPreview fields={editedClass.signupForm.fields} />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
