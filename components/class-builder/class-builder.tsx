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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SemesterManager } from "./semester-manager";
import { ClassEditor } from "./class-editor";
import {
  CalendarPlus,
  MapPin,
  Users,
  Archive,
  UserCheck,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Category, Class, Semester } from "@/types/classes";

export function ClassBuilder() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Programming", color: "bg-blue-500" },
    { id: "2", name: "Design", color: "bg-purple-500" },
    { id: "3", name: "Data Science", color: "bg-green-500" },
    { id: "4", name: "Business", color: "bg-orange-500" },
    { id: "5", name: "Marketing", color: "bg-pink-500" },
    { id: "6", name: "Arts", color: "bg-indigo-500" },
  ]);

  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: "1",
      name: "Spring 2025",
      startDate: "2025-01-15",
      endDate: "2025-05-15",
      classes: [
        {
          id: "c1",
          title: "Introduction to Web Development",
          description:
            "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites",
          startDate: "2025-01-20",
          endDate: "2025-05-10",
          location: "Room 101, Main Building",
          capacity: 25,
          enrolled: 22,
          waitlistEnabled: true,
          categoryId: "1",
          teacher: "Dr. Sarah Johnson",
          semesterId: "1",
          bannerImage: "/web-development-coding-laptop.jpg",
          meetings: [
            { id: "m1", day: "Monday", startTime: "18:00", endTime: "20:00" },
            {
              id: "m2",
              day: "Wednesday",
              startTime: "18:00",
              endTime: "20:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              { id: "phone", type: "tel", label: "Phone", required: true },
              {
                id: "experience",
                type: "textarea",
                label: "Previous Coding Experience",
                required: false,
              },
            ],
          },
        },
        {
          id: "c2",
          title: "Advanced React Development",
          description:
            "Master React hooks, state management, and modern patterns for building scalable applications",
          startDate: "2025-02-01",
          endDate: "2025-05-15",
          location: "Room 203, Tech Center",
          capacity: 20,
          enrolled: 20,
          waitlistEnabled: true,
          categoryId: "1",
          teacher: "Michael Chen",
          semesterId: "1",
          bannerImage: "/react-javascript-modern-development.jpg",
          meetings: [
            { id: "m3", day: "Tuesday", startTime: "19:00", endTime: "21:00" },
            { id: "m4", day: "Thursday", startTime: "19:00", endTime: "21:00" },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              {
                id: "skillLevel",
                type: "select",
                label: "React Experience Level",
                required: true,
                options: [
                  "Never used React",
                  "Basic knowledge",
                  "Intermediate",
                  "Advanced",
                ],
              },
              {
                id: "address",
                type: "address",
                label: "Address",
                required: true,
                subFields: [
                  {
                    id: "address1",
                    type: "text",
                    label: "Address Line 1",
                    required: true,
                  },
                  {
                    id: "address2",
                    type: "text",
                    label: "Address Line 2",
                    required: false,
                  },
                  { id: "city", type: "text", label: "City", required: true },
                  {
                    id: "state",
                    type: "text",
                    label: "State/Province",
                    required: true,
                  },
                  {
                    id: "zip",
                    type: "text",
                    label: "ZIP/Postal Code",
                    required: true,
                  },
                  {
                    id: "country",
                    type: "text",
                    label: "Country",
                    required: true,
                  },
                ],
              },
            ],
          },
        },
        {
          id: "c5",
          title: "UX/UI Design Principles",
          description:
            "Master the art of creating intuitive and beautiful user experiences",
          startDate: "2025-01-25",
          endDate: "2025-05-12",
          location: "Design Studio, Building C",
          capacity: 18,
          enrolled: 12,
          waitlistEnabled: false,
          categoryId: "2",
          teacher: "Jessica Williams",
          semesterId: "1",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            { id: "m8", day: "Tuesday", startTime: "18:00", endTime: "20:30" },
            { id: "m9", day: "Thursday", startTime: "18:00", endTime: "20:30" },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              {
                id: "portfolio",
                type: "text",
                label: "Portfolio URL",
                required: false,
              },
            ],
          },
        },
        {
          id: "c6",
          title: "Digital Marketing Fundamentals",
          description:
            "Learn SEO, social media marketing, and content strategy",
          startDate: "2025-02-05",
          endDate: "2025-05-10",
          location: "Room 405, Business Building",
          capacity: 30,
          enrolled: 18,
          waitlistEnabled: false,
          categoryId: "5",
          teacher: "David Thompson",
          semesterId: "1",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            {
              id: "m10",
              day: "Saturday",
              startTime: "10:00",
              endTime: "14:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              { id: "phone", type: "tel", label: "Phone", required: true },
              {
                id: "businessType",
                type: "select",
                label: "Are you marketing a business?",
                required: false,
                options: [
                  "Yes, my own business",
                  "Yes, I work for a company",
                  "No, just learning",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "2",
      name: "Fall 2025",
      startDate: "2025-09-01",
      endDate: "2025-12-15",
      classes: [
        {
          id: "c3",
          title: "Python for Data Science",
          description:
            "Explore data analysis, visualization, and machine learning with Python",
          startDate: "2025-09-05",
          endDate: "2025-12-10",
          location: "Room 305, Science Building",
          capacity: 30,
          enrolled: 15,
          waitlistEnabled: false,
          categoryId: "3",
          teacher: "Prof. Emily Rodriguez",
          semesterId: "2",
          bannerImage: "/python-data-science-analytics-charts.jpg",
          meetings: [
            { id: "m5", day: "Monday", startTime: "17:00", endTime: "19:00" },
            {
              id: "m6",
              day: "Wednesday",
              startTime: "17:00",
              endTime: "19:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              {
                id: "programmingBg",
                type: "select",
                label: "Programming Background",
                required: true,
                options: [
                  "No experience",
                  "Some experience",
                  "Experienced programmer",
                ],
              },
              {
                id: "goals",
                type: "textarea",
                label: "What do you hope to learn?",
                required: false,
              },
            ],
          },
        },
        {
          id: "c7",
          title: "Entrepreneurship 101",
          description: "Learn how to start, fund, and grow your own business",
          startDate: "2025-09-10",
          endDate: "2025-12-12",
          location: "Room 201, Business Building",
          capacity: 25,
          enrolled: 19,
          waitlistEnabled: true,
          categoryId: "4",
          teacher: "Mark Anderson",
          semesterId: "2",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            { id: "m11", day: "Monday", startTime: "18:30", endTime: "21:00" },
            {
              id: "m12",
              day: "Wednesday",
              startTime: "18:30",
              endTime: "21:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              { id: "phone", type: "tel", label: "Phone", required: true },
              {
                id: "businessIdea",
                type: "textarea",
                label: "Tell us about your business idea",
                required: false,
              },
            ],
          },
        },
        {
          id: "c8",
          title: "Watercolor Painting",
          description:
            "Explore watercolor techniques and develop your artistic style",
          startDate: "2025-09-08",
          endDate: "2025-12-08",
          location: "Art Studio 2",
          capacity: 15,
          enrolled: 15,
          waitlistEnabled: true,
          categoryId: "6",
          teacher: "Lisa Martinez",
          semesterId: "2",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            { id: "m13", day: "Friday", startTime: "14:00", endTime: "17:00" },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              {
                id: "artBackground",
                type: "select",
                label: "Previous Art Experience",
                required: true,
                options: [
                  "Complete beginner",
                  "Some experience",
                  "Experienced artist",
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: "3",
      name: "Summer 2025",
      startDate: "2025-06-01",
      endDate: "2025-08-15",
      classes: [
        {
          id: "c9",
          title: "Mobile App Development",
          description: "Build iOS and Android apps using React Native",
          startDate: "2025-06-05",
          endDate: "2025-08-10",
          location: "Tech Lab 3",
          capacity: 20,
          enrolled: 8,
          waitlistEnabled: false,
          categoryId: "1",
          teacher: "Alex Kim",
          semesterId: "3",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            { id: "m14", day: "Tuesday", startTime: "18:00", endTime: "21:00" },
            {
              id: "m15",
              day: "Thursday",
              startTime: "18:00",
              endTime: "21:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
              { id: "phone", type: "tel", label: "Phone", required: true },
            ],
          },
        },
        {
          id: "c10",
          title: "Social Media Strategy",
          description:
            "Master social media platforms and grow your online presence",
          startDate: "2025-06-10",
          endDate: "2025-08-12",
          location: "Marketing Hub",
          capacity: 35,
          enrolled: 22,
          waitlistEnabled: false,
          categoryId: "5",
          teacher: "David Thompson",
          semesterId: "3",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            {
              id: "m16",
              day: "Wednesday",
              startTime: "19:00",
              endTime: "21:30",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
            ],
          },
        },
      ],
    },
    {
      id: "4",
      name: "Winter 2024",
      startDate: "2024-11-01",
      endDate: "2024-12-20",
      archived: true,
      classes: [
        {
          id: "c4",
          title: "UI/UX Design Fundamentals",
          description: "Learn the principles of user-centered design",
          startDate: "2024-11-05",
          endDate: "2024-12-15",
          location: "Design Lab",
          capacity: 15,
          enrolled: 15,
          waitlistEnabled: false,
          categoryId: "2",
          teacher: "Alex Martinez",
          semesterId: "4",
          bannerImage: "/ui-ux-design-wireframe-mockup.jpg",
          meetings: [
            { id: "m7", day: "Friday", startTime: "14:00", endTime: "17:00" },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
            ],
          },
        },
      ],
    },
    {
      id: "5",
      name: "Spring 2024",
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      archived: true,
      classes: [
        {
          id: "c11",
          title: "Introduction to JavaScript",
          description: "Learn JavaScript fundamentals and modern ES6+ features",
          startDate: "2024-01-20",
          endDate: "2024-05-10",
          location: "Room 102, Main Building",
          capacity: 28,
          enrolled: 28,
          waitlistEnabled: false,
          categoryId: "1",
          teacher: "Dr. Sarah Johnson",
          semesterId: "5",
          bannerImage: "/placeholder.svg?height=400&width=800",
          meetings: [
            { id: "m17", day: "Monday", startTime: "18:00", endTime: "20:00" },
            {
              id: "m18",
              day: "Wednesday",
              startTime: "18:00",
              endTime: "20:00",
            },
          ],
          signupForm: {
            fields: [
              {
                id: "firstName",
                type: "text",
                label: "First Name",
                required: true,
              },
              {
                id: "lastName",
                type: "text",
                label: "Last Name",
                required: true,
              },
              { id: "email", type: "email", label: "Email", required: true },
            ],
          },
        },
      ],
    },
  ]);
  const [activeSemester, setActiveSemester] = useState<string>("1");
  const [showArchived, setShowArchived] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const activeSemesters = semesters.filter((s) => !s.archived);
  const archivedSemesters = semesters.filter((s) => s.archived);
  const displayedSemesters = showArchived ? archivedSemesters : activeSemesters;

  const currentSemester = semesters.find((s) => s.id === activeSemester);

  const isClassFull = (classItem: Class) => {
    return classItem.capacity && classItem.enrolled
      ? classItem.enrolled >= classItem.capacity
      : false;
  };

  const handleCreateClass = () => {
    const newClass: Class = {
      id: Date.now().toString(),
      title: "New Class",
      description: "",
      startDate: currentSemester?.startDate || "",
      endDate: currentSemester?.endDate || "",
      meetings: [],
      location: "",
      enrolled: 0,
      waitlistEnabled: false,
      semesterId: activeSemester,
      signupForm: {
        fields: [
          { id: "1", type: "text", label: "First Name", required: true },
          { id: "2", type: "text", label: "Last Name", required: true },
          { id: "3", type: "email", label: "Email", required: true },
          { id: "4", type: "tel", label: "Phone", required: true },
        ],
      },
    };
    setEditingClass(newClass);
    setIsCreating(true);
  };

  const handleSaveClass = (classData: Class) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === activeSemester) {
          const existingIndex = sem.classes.findIndex(
            (c) => c.id === classData.id
          );
          if (existingIndex >= 0) {
            const newClasses = [...sem.classes];
            newClasses[existingIndex] = classData;
            return { ...sem, classes: newClasses };
          } else {
            return { ...sem, classes: [...sem.classes, classData] };
          }
        }
        return sem;
      })
    );
    setEditingClass(null);
    setIsCreating(false);
  };

  const handleDeleteClass = (classId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => ({
        ...sem,
        classes: sem.classes.filter((c) => c.id !== classId),
      }))
    );
    setEditingClass(null);
  };

  if (editingClass) {
    return (
      <ClassEditor
        classData={editingClass}
        semester={currentSemester!}
        categories={categories}
        onSave={handleSaveClass}
        onCancel={() => {
          setEditingClass(null);
          setIsCreating(false);
        }}
        onDelete={handleDeleteClass}
        isNew={isCreating}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Class Manager</h1>
        <p className="text-muted-foreground">
          Manage your semesters and classes with ease
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 flex items-center gap-3">
          <Select value={activeSemester} onValueChange={setActiveSemester}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {displayedSemesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="opacity-100"
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="mr-2 h-4 w-4" />
            {showArchived ? "Show Active" : "Show Archived"} (
            {showArchived ? activeSemesters.length : archivedSemesters.length})
          </Button>
        </div>

        <SemesterManager
          semesters={semesters}
          onUpdate={setSemesters}
          categories={categories}
          onUpdateCategories={setCategories}
        />
      </div>

      {currentSemester && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {currentSemester.archived && (
                      <Archive className="h-5 w-5 text-muted-foreground" />
                    )}
                    {currentSemester.name}
                  </CardTitle>
                  <CardDescription>
                    {new Date(currentSemester.startDate).toLocaleDateString()} -{" "}
                    {new Date(currentSemester.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                {!currentSemester.archived && (
                  <Button onClick={handleCreateClass}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Create Class
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentSemester.classes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">
                    {currentSemester.archived
                      ? "No classes in this archived semester."
                      : "No classes yet. Create your first class to get started."}
                  </p>
                  {!currentSemester.archived && (
                    <Button onClick={handleCreateClass} variant="outline">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Create Class
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentSemester.classes.map((classItem) => {
                    const category = categories.find(
                      (cat) => cat.id === classItem.categoryId
                    );
                    const isFull = isClassFull(classItem);

                    return (
                      <Card
                        key={classItem.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setEditingClass(classItem)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-xl flex items-center gap-2">
                                {classItem.title}
                                {isFull && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    FULL
                                  </Badge>
                                )}
                                {category && (
                                  <Badge
                                    variant="secondary"
                                    className={`${category.color} text-white text-xs`}
                                  >
                                    {category.name}
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription>
                                {classItem.description || "No description"}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {classItem.teacher && (
                              <span className="flex items-center gap-1">
                                <UserCheck className="h-4 w-4" />
                                {classItem.teacher}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {classItem.location || "No location"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {classItem.capacity
                                ? `${classItem.enrolled || 0}/${
                                    classItem.capacity
                                  } enrolled${
                                    classItem.waitlistEnabled
                                      ? " (waitlist enabled)"
                                      : ""
                                  }`
                                : "Unlimited capacity"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {classItem.meetings.length} meeting
                              {classItem.meetings.length !== 1 ? "s" : ""} per
                              week
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
