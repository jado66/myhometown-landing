"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Computer, Flag, Music } from "lucide-react";
import { PopularClass } from "@/types/crc";

const popularClasses: PopularClass[] = [
  {
    name: "ESL (English as a Second Language)",
    description:
      "Learn English in a supportive environment with experienced instructors. Multiple levels available.",
  },
  {
    name: "Piano Lessons",
    description:
      "Free piano instruction for beginners and intermediate students. All ages welcome.",
  },
  {
    name: "Computer Skills",
    description:
      "Basic computer literacy, internet safety, and essential software training.",
  },
  {
    name: "Citizenship Prep",
    description:
      "Prepare for your U.S. citizenship test with study materials and practice sessions.",
  },
];

const classIcons = {
  "ESL (English as a Second Language)": BookOpen,
  "Piano Lessons": Music,
  "Computer Skills": Computer,
  "Citizenship Prep": Flag,
} as const;

export function PopularClassesSection() {
  return (
    <div className="pt-16 border-t border-gray-200 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Popular Classes
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our most popular programs available at Community Resource
          Centers across Utah.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {popularClasses.map((classItem) => {
          const IconComponent =
            classIcons[classItem.name as keyof typeof classIcons];

          return (
            <Card
              key={classItem.name}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {classItem.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{classItem.description}</p>
                <Button
                  className="w-full bg-[#e45620] hover:bg-[#e45620]/90 text-white"
                  size="sm"
                >
                  Find a Class
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
