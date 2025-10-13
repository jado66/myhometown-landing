"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Palette,
  Dumbbell,
  Laptop,
  Lightbulb,
} from "lucide-react";
import type { Class } from "@/util/mock-data/mock-classes";

interface ClassCardProps {
  classData: Class;
}

const categoryIcons = {
  education: BookOpen,
  arts: Palette,
  fitness: Dumbbell,
  technology: Laptop,
  "life-skills": Lightbulb,
};

const categoryColors = {
  education: "bg-blue-100 text-blue-700 border-blue-200",
  arts: "bg-purple-100 text-purple-700 border-purple-200",
  fitness: "bg-green-100 text-green-700 border-green-200",
  technology: "bg-orange-100 text-orange-700 border-orange-200",
  "life-skills": "bg-pink-100 text-pink-700 border-pink-200",
};

const levelColors = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
  "all-levels": "bg-slate-100 text-slate-700",
};

export function ClassCard({ classData }: ClassCardProps) {
  const Icon = categoryIcons[classData.category];
  const spotsLeft = classData.capacity - classData.enrolled;
  const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;
  const isFull = spotsLeft === 0;

  return (
    <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
              categoryColors[classData.category]
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Badge variant="outline" className={levelColors[classData.level]}>
              {classData.level.replace("-", " ")}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl leading-tight">
          {classData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {classData.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">Instructor:</span>
            <span className="text-muted-foreground">
              {classData.instructor}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{classData.schedule}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{classData.duration}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {classData.ageGroup} • {classData.enrolled}/{classData.capacity}{" "}
              enrolled
            </span>
          </div>
        </div>

        <div className="pt-2">
          {isFull ? (
            <Button disabled className="w-full" size="lg">
              Class Full
            </Button>
          ) : (
            <>
              <Button className="w-full" size="lg">
                Sign Up
              </Button>
              {isAlmostFull && (
                <p className="text-xs text-amber-600 text-center mt-2 font-medium">
                  Only {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left!
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
