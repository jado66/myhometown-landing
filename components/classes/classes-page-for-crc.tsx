"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/layout/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useClasses } from "@/hooks/use-classes";
import { CRC } from "@/types/crc";
import PatternBackground from "@/components/ui/pattern-background";
import Link from "next/link";

interface ClassesPageForCRCProps {
  crc: CRC;
}

export function ClassesPageForCRC({ crc }: ClassesPageForCRCProps) {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [joinWaitlist, setJoinWaitlist] = useState(false);

  // Carousel state for class preview
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const elapsedTimeRef = useRef(0);
  const lastTickRef = useRef(Date.now());

  // Get real classes data for the CRC
  const {
    classes: realClasses,
    loading,
    error,
  } = useClasses({
    communityId: crc.community?.id,
    autoFetch: true,
  });

  // Transform real classes to match the interface format
  const availableClasses = realClasses.filter((cls) => {
    const isFull =
      cls.capacity && cls.enrolled ? cls.enrolled >= cls.capacity : false;
    return !isFull;
  });

  // Carousel for class preview
  useEffect(() => {
    if (availableClasses.length <= 1 || isPaused || selectedClass) {
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
        setCarouselIndex((prev) => (prev + 1) % availableClasses.length);
        elapsedTimeRef.current = 0;
        setProgress(0);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [availableClasses.length, isPaused, selectedClass]);

  const isClassFull = (classItem: any) => {
    return classItem.capacity && classItem.enrolled
      ? classItem.enrolled >= classItem.capacity
      : false;
  };

  const renderFormField = (field: any) => {
    // Form field rendering logic would be based on real signup form structure
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
  };

  // Success state after form submission
  if (isSubmitted) {
    return (
      <Container>
        <div className="container mx-auto py-16 px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-3xl">
                {joinWaitlist
                  ? "Added to Waitlist!"
                  : "Registration Successful!"}
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
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedClass(null);
                    setFormData({});
                    setJoinWaitlist(false);
                  }}
                  className="w-full"
                >
                  Register for Another Class
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/classes">Browse All Locations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PatternBackground
          patternSize={55}
          opacity={1}
          color="#2c863eff"
          backgroundColor="#257936ff"
          id="classes-hero"
        >
          <section className="relative text-white py-20 px-4 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="flex justify-center mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Link href="/classes" className="flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Browse All Locations
                    </Link>
                  </Button>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                  {crc.name}
                </h1>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{crc.city?.name || ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-foreground/90">
                    <Calendar className="w-5 h-5" />
                    <span className="text-lg">{crc.address}</span>
                  </div>
                </div>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 text-pretty leading-relaxed max-w-3xl mx-auto">
                  Discover free classes and programs at this Community Resource
                  Center. Learn new skills, connect with neighbors, and grow
                  together.
                </p>

                <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium">Learn Skills</span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium">
                      Meet Neighbors
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-base font-medium">100% Free</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-primary-foreground/60" />
            </div>
          </section>
        </PatternBackground>

        {/* Classes Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Class Registration Interface */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Class List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Classes</CardTitle>
                      <CardDescription>
                        {loading
                          ? "Loading classes..."
                          : `${availableClasses.length} classes available`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : error ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Error loading classes. Please try again.
                          </AlertDescription>
                        </Alert>
                      ) : availableClasses.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No classes found for this location
                        </p>
                      ) : (
                        availableClasses.map((classItem) => {
                          const isFull = isClassFull(classItem);
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
                                  {classItem.instructor || "TBD"}
                                </span>
                              </div>
                            </Button>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Class Details and Registration */}
                <div className="lg:col-span-2">
                  {!selectedClass ? (
                    availableClasses.length > 0 ? (
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
                            <CardHeader>
                              <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                                {availableClasses[carouselIndex]?.title}
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-700"
                                >
                                  {availableClasses[carouselIndex]?.level ||
                                    "All Levels"}
                                </Badge>
                              </CardTitle>
                              <CardDescription>
                                {availableClasses[carouselIndex]?.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                  {availableClasses[carouselIndex]
                                    ?.instructor && (
                                    <div className="flex items-start gap-2">
                                      <UserCheck className="h-4 w-4 mt-1 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">
                                          Instructor
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {
                                            availableClasses[carouselIndex]
                                              ?.instructor
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2">
                                    <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        Enrollment
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {availableClasses[carouselIndex]
                                          ?.enrolled || 0}{" "}
                                        /{" "}
                                        {availableClasses[carouselIndex]
                                          ?.capacity || "Unlimited"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        Schedule
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {availableClasses[carouselIndex]
                                          ?.schedule || "TBD"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        Duration
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {availableClasses[carouselIndex]
                                          ?.duration || "TBD"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={() =>
                                      setSelectedClass(
                                        availableClasses[carouselIndex]
                                      )
                                    }
                                  >
                                    Register for This Class
                                  </Button>
                                  <p className="text-center text-sm text-muted-foreground">
                                    Click on a class from the sidebar or
                                    register for this featured class
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </motion.div>
                        </AnimatePresence>

                        {availableClasses.length > 1 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                            <div
                              className="h-full bg-primary transition-all duration-100 ease-linear"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </Card>
                    ) : (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center py-12">
                          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No available classes at this location
                          </p>
                        </CardContent>
                      </Card>
                    )
                  ) : (
                    <Card className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-2xl flex items-center gap-2 flex-wrap">
                              {selectedClass.title}
                              {isClassFull(selectedClass) && (
                                <Badge variant="destructive">FULL</Badge>
                              )}
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-700"
                              >
                                {selectedClass.level || "All Levels"}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {selectedClass.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {isClassFull(selectedClass) && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                This class is currently full. Contact the CRC to
                                check for waitlist availability.
                              </AlertDescription>
                            </Alert>
                          )}

                          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            {selectedClass.instructor && (
                              <div className="flex items-start gap-2">
                                <UserCheck className="h-4 w-4 mt-1 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Instructor
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedClass.instructor}
                                  </p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  Enrollment
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedClass.enrolled || 0} /{" "}
                                  {selectedClass.capacity || "Unlimited"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Schedule</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedClass.schedule || "TBD"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedClass.duration || "TBD"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {!isClassFull(selectedClass) && (
                            <form onSubmit={handleSubmit} className="space-y-4">
                              <h3 className="text-lg font-semibold">
                                Registration Form
                              </h3>

                              {/* Basic form fields */}
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="firstName">
                                    First Name
                                    <span className="text-destructive ml-1">
                                      *
                                    </span>
                                  </Label>
                                  <Input
                                    id="firstName"
                                    required
                                    value={formData.firstName || ""}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        firstName: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="lastName">
                                    Last Name
                                    <span className="text-destructive ml-1">
                                      *
                                    </span>
                                  </Label>
                                  <Input
                                    id="lastName"
                                    required
                                    value={formData.lastName || ""}
                                    onChange={(e) =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        lastName: e.target.value,
                                      }))
                                    }
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="email">
                                  Email Address
                                  <span className="text-destructive ml-1">
                                    *
                                  </span>
                                </Label>
                                <Input
                                  id="email"
                                  type="email"
                                  required
                                  value={formData.email || ""}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div>
                                <Label htmlFor="phone">
                                  Phone Number
                                  <span className="text-destructive ml-1">
                                    *
                                  </span>
                                </Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  required
                                  value={formData.phone || ""}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      phone: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                              >
                                Register for Class
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
          </div>
        </section>
      </div>
    </Container>
  );
}
