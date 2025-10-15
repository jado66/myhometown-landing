"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ChevronDown } from "lucide-react";
import type { CRC } from "@/types/crc";
import { CRCFinderExpanded } from "@/components/classes/crc-finder-expanded";
import { ClassesList } from "@/components/classes/classes-list";
import PatternBackground from "@/components/ui/pattern-background";
import { Container } from "@/layout/container";

interface ClassesPageClientProps {
  crcs: CRC[];
}

export function ClassesPageClient({ crcs }: ClassesPageClientProps) {
  const [selectedCRC, setSelectedCRC] = useState<CRC | null>(null);

  const handleCRCSelect = (crc: CRC) => {
    setSelectedCRC(crc);
    setTimeout(() => {
      const classesSection = document.getElementById("classes-section");
      if (classesSection) {
        classesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleChangeCRC = () => {
    const finderSection = document.getElementById("crc-finder");
    if (finderSection) {
      finderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                  Community Classes
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 text-pretty leading-relaxed max-w-3xl mx-auto">
                  Discover free classes and programs at your local Community
                  Resource Center. Learn new skills, connect with neighbors, and
                  grow together.
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

        {/* CRC Finder Section */}
        <CRCFinderExpanded
          crcs={crcs}
          onCRCSelect={handleCRCSelect}
          selectedCRC={selectedCRC}
        />

        {/* Divider */}
        {selectedCRC && (
          <hr className="border-t border-muted-foreground/20 mx-4 md:mx-0" />
        )}

        {/* Classes Section */}
        {selectedCRC && (
          <section id="classes-section" className="py-8 md:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Selected CRC Info Card */}
                <Card className="shadow-lg border-2 mb-8">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-semibold">
                          Classes at {selectedCRC.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedCRC.city?.name || ""}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedCRC.address}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangeCRC}
                        className="flex-shrink-0 bg-transparent"
                      >
                        Change Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Classes List */}
                <ClassesList selectedCRC={selectedCRC} />
              </div>
            </div>
          </section>
        )}
      </div>
    </Container>
  );
}
