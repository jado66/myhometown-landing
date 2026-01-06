"use client";

import type React from "react";
import Link from "next/link";
import {
  Home,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Class, Semester, Category } from "@/types/classes";

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Programming", color: "bg-blue-500" },
  { id: "2", name: "Design", color: "bg-purple-500" },
  { id: "3", name: "Data Science", color: "bg-green-500" },
  { id: "4", name: "Business", color: "bg-orange-500" },
  { id: "5", name: "Marketing", color: "bg-pink-500" },
  { id: "6", name: "Arts", color: "bg-indigo-500" },
];

const MOCK_SEMESTERS: Semester[] = [
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
          { id: "m2", day: "Wednesday", startTime: "18:00", endTime: "20:00" },
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
        description: "Learn SEO, social media marketing, and content strategy",
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
          { id: "m10", day: "Saturday", startTime: "10:00", endTime: "14:00" },
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
          { id: "m6", day: "Wednesday", startTime: "17:00", endTime: "19:00" },
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
          { id: "m12", day: "Wednesday", startTime: "18:30", endTime: "21:00" },
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
          { id: "m15", day: "Thursday", startTime: "18:00", endTime: "21:00" },
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
          { id: "m16", day: "Wednesday", startTime: "19:00", endTime: "21:30" },
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
];

export default function SignupPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [joinWaitlist, setJoinWaitlist] = useState(false);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsedTimeRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  const allAvailableClasses = MOCK_SEMESTERS.flatMap((semester) =>
    semester.classes.filter((cls) => {
      const isFull =
        cls.capacity && cls.enrolled ? cls.enrolled >= cls.capacity : false;
      return !isFull;
    })
  );

  const carouselClasses = allAvailableClasses;

  useEffect(() => {
    if (carouselClasses.length <= 1 || isPaused) {
      if (isPaused) {
        lastTickRef.current = Date.now();
      }
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      elapsedTimeRef.current += delta;

      const newProgress = (elapsedTimeRef.current / 8000) * 100;

      if (newProgress >= 100) {
        setCarouselIndex((prev) => (prev + 1) % carouselClasses.length);
        elapsedTimeRef.current = 0;
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [carouselClasses.length, isPaused]);

  const classesByCategory = MOCK_CATEGORIES.map((category) => ({
    category,
    classes:
      MOCK_SEMESTERS.find((s) => s.id === selectedSemester)
        ?.classes.filter((cls) => cls.categoryId === category.id)
        .filter(
          (cls) =>
            selectedCategory === "all" || cls.categoryId === selectedCategory
        ) || [],
  })).filter((group) => group.classes.length > 0);

  const availableClasses =
    MOCK_SEMESTERS.find((s) => s.id === selectedSemester)?.classes.filter(
      (cls) => selectedCategory === "all" || cls.categoryId === selectedCategory
    ) || [];

  // Removed carouselClasses and carouselIndex, isPaused, progress, elapsedTimeRef, lastTickRef
  // Removed useEffect for carousel logic

  const isClassFull = (classItem: Class) => {
    return classItem.capacity && classItem.enrolled
      ? classItem.enrolled >= classItem.capacity
      : false;
  };

  const renderFormField = (field: any) => {
    if (field.type === "address" && field.subFields) {
      return (
        <div key={field.id} className="space-y-3 p-4 border rounded-lg">
          <Label className="text-base font-semibold">{field.label}</Label>
          <div className="grid gap-3">
            {field.subFields.map((subField: any) => (
              <div key={subField.id}>
                <Label htmlFor={subField.id}>
                  {subField.label}
                  {subField.required && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  id={subField.id}
                  type="text"
                  required={subField.required}
                  value={formData[subField.id] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [subField.id]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div key={field.id}>
        <Label htmlFor={field.id}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {field.type === "textarea" ? (
          <Textarea
            id={field.id}
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
            }
          />
        ) : field.type === "select" ? (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, [field.id]: value }))
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            required={field.required}
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
            }
          />
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Handle form submission logic here
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">
              {joinWaitlist ? "Added to Waitlist!" : "Registration Successful!"}
            </CardTitle>
            <CardDescription>
              {joinWaitlist
                ? `You have been added to the waitlist for ${selectedClass?.title}. We'll notify you if a spot opens up.`
                : `You have been successfully registered for ${selectedClass?.title}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              A confirmation email has been sent to {formData.email}.
              {!joinWaitlist && " We look forward to seeing you in class!"}
            </p>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedClass(null);
                setSelectedSemester("");
                setFormData({});
                setJoinWaitlist(false);
              }}
            >
              Register for Another Class
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Class Registration</h1>
        <p className="text-muted-foreground">
          Browse available classes and register for the ones that interest you
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Semester</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_SEMESTERS.map((semester) => (
                <Button
                  key={semester.id}
                  variant={
                    selectedSemester === semester.id ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedSemester(semester.id);
                    setSelectedClass(null);
                    setSelectedCategory("all");
                    // Removed carousel reset logic
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {semester.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {selectedSemester && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Filter by Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedClass(null);
                    }}
                  >
                    All Categories
                  </Button>
                  {MOCK_CATEGORIES.map((category) => {
                    const classCount =
                      MOCK_SEMESTERS.find(
                        (s) => s.id === selectedSemester
                      )?.classes.filter((cls) => cls.categoryId === category.id)
                        .length || 0;

                    if (classCount === 0) return null;

                    return (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        size="sm"
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setSelectedClass(null);
                        }}
                      >
                        <span>{category.name}</span>
                        <Badge
                          variant="secondary"
                          className={`${category.color} text-white text-xs`}
                        >
                          {classCount}
                        </Badge>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCategory !== "all"
                      ? MOCK_CATEGORIES.find((c) => c.id === selectedCategory)
                          ?.name
                      : "All Classes"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedCategory === "all" ? (
                    classesByCategory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No classes found
                      </p>
                    ) : (
                      classesByCategory.map((group) => (
                        <div key={group.category.id} className="space-y-2">
                          <div className="flex items-center gap-2 px-2">
                            <Badge
                              variant="secondary"
                              className={`${group.category.color} text-white text-xs`}
                            >
                              {group.category.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {group.classes.length} classes
                            </span>
                          </div>
                          {group.classes.map((classItem) => {
                            const isFull = isClassFull(classItem);
                            return (
                              <Button
                                key={classItem.id}
                                variant={
                                  selectedClass?.id === classItem.id
                                    ? "default"
                                    : "outline"
                                }
                                className="w-full justify-start text-left h-auto py-3 ml-4"
                                onClick={() => setSelectedClass(classItem)}
                              >
                                <div className="flex flex-col items-start gap-1 w-full">
                                  <div className="flex items-center gap-2 w-full">
                                    <span className="font-semibold flex-1 text-sm">
                                      {classItem.title}
                                    </span>
                                    {isFull && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        FULL
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {classItem.meetings.length} meetings/week
                                  </span>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      ))
                    )
                  ) : availableClasses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No classes found for this category
                    </p>
                  ) : (
                    availableClasses.map((classItem) => {
                      const isFull = isClassFull(classItem);
                      const category = MOCK_CATEGORIES.find(
                        (cat) => cat.id === classItem.categoryId
                      );

                      return (
                        <Button
                          key={classItem.id}
                          variant={
                            selectedClass?.id === classItem.id
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start text-left h-auto py-3"
                          onClick={() => setSelectedClass(classItem)}
                        >
                          <div className="flex flex-col items-start gap-1 w-full">
                            <div className="flex items-center gap-2 w-full">
                              <span className="font-semibold flex-1">
                                {classItem.title}
                              </span>
                              {isFull && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  FULL
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {classItem.meetings.length} meetings/week
                            </span>
                          </div>
                        </Button>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Removed activeTab check for column span */}
        <div className="lg:col-span-2">
          {!selectedSemester ? (
            carouselClasses.length > 0 ? (
              <Card
                className="h-full relative overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  lastTickRef.current = Date.now();
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    {carouselClasses[carouselIndex].bannerImage && (
                      <div className="w-full h-64 overflow-hidden rounded-t-lg relative">
                        <Badge className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white">
                          PREVIEW
                        </Badge>
                        <img
                          src={
                            carouselClasses[carouselIndex].bannerImage ||
                            "/placeholder.svg"
                          }
                          alt={carouselClasses[carouselIndex].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                        {carouselClasses[carouselIndex].title}
                        {carouselClasses[carouselIndex].categoryId && (
                          <Badge
                            variant="secondary"
                            className={`${
                              MOCK_CATEGORIES.find(
                                (cat) =>
                                  cat.id ===
                                  carouselClasses[carouselIndex].categoryId
                              )?.color
                            } text-white`}
                          >
                            {
                              MOCK_CATEGORIES.find(
                                (cat) =>
                                  cat.id ===
                                  carouselClasses[carouselIndex].categoryId
                              )?.name
                            }
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {carouselClasses[carouselIndex].description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          {carouselClasses[carouselIndex].teacher && (
                            <div className="flex items-start gap-2">
                              <UserCheck className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Instructor
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {carouselClasses[carouselIndex].teacher}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Enrollment</p>
                              <p className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].capacity
                                  ? `${
                                      carouselClasses[carouselIndex].enrolled ||
                                      0
                                    }/${
                                      carouselClasses[carouselIndex].capacity
                                    } enrolled`
                                  : "Unlimited capacity"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  carouselClasses[carouselIndex].startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  carouselClasses[carouselIndex].endDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 md:col-span-2">
                            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Schedule</p>
                              <div className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].meetings.map(
                                  (meeting) => (
                                    <div key={meeting.id}>
                                      {meeting.day} {meeting.startTime} -{" "}
                                      {meeting.endTime}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Button
                            size="lg"
                            className="w-full"
                            onClick={() => {
                              const semester = MOCK_SEMESTERS.find((s) =>
                                s.classes.some(
                                  (c) =>
                                    c.id === carouselClasses[carouselIndex].id
                                )
                              );
                              if (semester) {
                                setSelectedSemester(semester.id);
                                setSelectedClass(
                                  carouselClasses[carouselIndex]
                                );
                              }
                            }}
                          >
                            Register for This Class
                          </Button>
                          <div className="text-center text-sm text-muted-foreground">
                            <span className="inline-block mx-2">or</span>
                          </div>
                          <p className="text-center text-sm text-muted-foreground">
                            Click on a class from the sidebar
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No available classes at this time
                  </p>
                </CardContent>
              </Card>
            )
          ) : !selectedClass ? (
            carouselClasses.length > 0 ? (
              <Card
                className="h-full relative overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  lastTickRef.current = Date.now();
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    {carouselClasses[carouselIndex].bannerImage && (
                      <div className="w-full h-64 overflow-hidden rounded-t-lg relative">
                        <Badge className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white">
                          PREVIEW
                        </Badge>
                        <img
                          src={
                            carouselClasses[carouselIndex].bannerImage ||
                            "/placeholder.svg"
                          }
                          alt={carouselClasses[carouselIndex].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                        {carouselClasses[carouselIndex].title}
                        {carouselClasses[carouselIndex].categoryId && (
                          <Badge
                            variant="secondary"
                            className={`${
                              MOCK_CATEGORIES.find(
                                (cat) =>
                                  cat.id ===
                                  carouselClasses[carouselIndex].categoryId
                              )?.color
                            } text-white`}
                          >
                            {
                              MOCK_CATEGORIES.find(
                                (cat) =>
                                  cat.id ===
                                  carouselClasses[carouselIndex].categoryId
                              )?.name
                            }
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {carouselClasses[carouselIndex].description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          {carouselClasses[carouselIndex].teacher && (
                            <div className="flex items-start gap-2">
                              <UserCheck className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Instructor
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {carouselClasses[carouselIndex].teacher}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Location</p>
                              <p className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Enrollment</p>
                              <p className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].capacity
                                  ? `${
                                      carouselClasses[carouselIndex].enrolled ||
                                      0
                                    }/${
                                      carouselClasses[carouselIndex].capacity
                                    } enrolled`
                                  : "Unlimited capacity"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Duration</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(
                                  carouselClasses[carouselIndex].startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  carouselClasses[carouselIndex].endDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 md:col-span-2">
                            <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Schedule</p>
                              <div className="text-sm text-muted-foreground">
                                {carouselClasses[carouselIndex].meetings.map(
                                  (meeting) => (
                                    <div key={meeting.id}>
                                      {meeting.day} {meeting.startTime} -{" "}
                                      {meeting.endTime}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Button
                            size="lg"
                            className="w-full"
                            onClick={() => {
                              const semester = MOCK_SEMESTERS.find((s) =>
                                s.classes.some(
                                  (c) =>
                                    c.id === carouselClasses[carouselIndex].id
                                )
                              );
                              if (semester) {
                                setSelectedSemester(semester.id);
                                setSelectedClass(
                                  carouselClasses[carouselIndex]
                                );
                              }
                            }}
                          >
                            Register for This Class
                          </Button>
                          <div className="text-center text-sm text-muted-foreground">
                            <span className="inline-block mx-2">or</span>
                          </div>
                          <p className="text-center text-sm text-muted-foreground">
                            Click on a class from the sidebar
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No available classes at this time
                  </p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="relative">
              {selectedClass.bannerImage && (
                <div className="w-full h-64 overflow-hidden rounded-t-lg">
                  <img
                    src={selectedClass.bannerImage || "/placeholder.svg"}
                    alt={selectedClass.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                      {selectedClass.title}
                      {isClassFull(selectedClass) && (
                        <Badge variant="destructive">FULL</Badge>
                      )}
                      {selectedClass.categoryId && (
                        <Badge
                          variant="secondary"
                          className={`${
                            MOCK_CATEGORIES.find(
                              (cat) => cat.id === selectedClass.categoryId
                            )?.color
                          } text-white`}
                        >
                          {
                            MOCK_CATEGORIES.find(
                              (cat) => cat.id === selectedClass.categoryId
                            )?.name
                          }
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedClass.description}
                    </CardDescription>
                  </div>
                </div>
                {/* Removed "Register for This Class" button and carousel preview logic */}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isClassFull(selectedClass) &&
                    selectedClass.waitlistEnabled && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This class is currently full. You can join the
                          waitlist and we&apos;ll notify you if a spot becomes
                          available.
                        </AlertDescription>
                      </Alert>
                    )}

                  {isClassFull(selectedClass) &&
                    !selectedClass.waitlistEnabled && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This class is currently full and waitlist is not
                          available. Please check back later or choose another
                          class.
                        </AlertDescription>
                      </Alert>
                    )}

                  <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    {selectedClass.teacher && (
                      <div className="flex items-start gap-2">
                        <UserCheck className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Instructor</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedClass.teacher}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Enrollment</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass.capacity
                            ? `${selectedClass.enrolled || 0}/${
                                selectedClass.capacity
                              } enrolled`
                            : "Unlimited capacity"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            selectedClass.startDate
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(selectedClass.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Schedule</p>
                        <div className="text-sm text-muted-foreground">
                          {selectedClass.meetings.map((meeting) => (
                            <div key={meeting.id}>
                              {meeting.day} {meeting.startTime} -{" "}
                              {meeting.endTime}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(!isClassFull(selectedClass) ||
                    selectedClass.waitlistEnabled) && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Registration Form
                      </h3>

                      {isClassFull(selectedClass) &&
                        selectedClass.waitlistEnabled && (
                          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                            <Checkbox
                              id="waitlist"
                              checked={joinWaitlist}
                              onCheckedChange={(checked) =>
                                setJoinWaitlist(checked as boolean)
                              }
                              required
                            />
                            <Label
                              htmlFor="waitlist"
                              className="text-sm font-normal cursor-pointer"
                            >
                              I understand this class is full and I&apos;m joining
                              the waitlist
                            </Label>
                          </div>
                        )}

                      {selectedClass.signupForm.fields.map(renderFormField)}
                      <Button type="submit" className="w-full" size="lg">
                        {isClassFull(selectedClass) &&
                        selectedClass.waitlistEnabled
                          ? "Join Waitlist"
                          : "Register for Class"}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
