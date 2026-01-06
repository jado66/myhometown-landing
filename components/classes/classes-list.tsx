"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CRC } from "@/types/crc";
import { useClasses } from "@/hooks/use-classes";
import { ClassCard } from "./class-card";

interface ClassesListProps {
  selectedCRC: CRC;
}

export function ClassesList({ selectedCRC }: ClassesListProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all");

  // Get the community ID from the selected CRC
  const communityId = selectedCRC.community?.id;

  // Fetch classes from the database
  const {
    classes: databaseClasses,
    loading,
    error,
  } = useClasses({
    communityId,
    autoFetch: !!communityId,
  });

  // Transform database classes to match the mock format for existing components
  const crcClasses = useMemo(() => {
    return databaseClasses.map((dbClass) => ({
      id: dbClass.id,
      title: dbClass.title,
      description: dbClass.description,
      category: "education" as const, // Default category since we don't have categories yet
      instructor: dbClass.instructor || "TBD",
      schedule: dbClass.schedule,
      duration: dbClass.duration,
      capacity: dbClass.capacity,
      enrolled: dbClass.enrolled,
      level: dbClass.level,
      ageGroup: dbClass.ageGroup,
      crcId: dbClass.crcId,
    }));
  }, [databaseClasses]);

  const filteredClasses = useMemo(() => {
    return crcClasses.filter((c) => {
      // Since we don't have categories yet, just filter by level
      const matchesLevel = levelFilter === "all" || c.level === levelFilter;
      return matchesLevel;
    });
  }, [crcClasses, levelFilter]);

  // For now, we'll just show a basic level filter since categories don't exist yet
  const showFilters = crcClasses.length > 0;

  return (
    <div className="space-y-8">
      {/* Filters */}

      {/* Classes Grid */}
      {loading ? (
        <Card className="border-2">
          <CardContent className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Loading Classes
            </h3>
            <p className="text-muted-foreground">
              Fetching the latest classes for {selectedCRC.name}...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-2 border-destructive/50">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Classes
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredClasses.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {filteredClasses.map((classData) => (
            <motion.div
              key={classData.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ClassCard classData={classData} />
            </motion.div>
          ))}
        </motion.div>
      ) : crcClasses.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Classes Available
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedCRC.name} doesn&apos;t have any classes scheduled at the
              moment. Check back soon for updates!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Classes Match Your Filters
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to see more classes
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setLevelFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
