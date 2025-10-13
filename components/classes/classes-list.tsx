"use client";

import { useState, useMemo } from "react";
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
import { Filter } from "lucide-react";
import type { CRC } from "@/types/crc";
import { classes } from "@/util/mock-data/mock-classes";
import { ClassCard } from "./class-card";

interface ClassesListProps {
  selectedCRC: CRC;
}

export function ClassesList({ selectedCRC }: ClassesListProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const crcClasses = useMemo(() => {
    return classes.filter((c) => c.crcId === selectedCRC.id);
  }, [selectedCRC.id]);

  const filteredClasses = useMemo(() => {
    return crcClasses.filter((c) => {
      const matchesCategory =
        categoryFilter === "all" || c.category === categoryFilter;
      const matchesLevel = levelFilter === "all" || c.level === levelFilter;
      return matchesCategory && matchesLevel;
    });
  }, [crcClasses, categoryFilter, levelFilter]);

  const categories = useMemo(() => {
    return Array.from(new Set(crcClasses.map((c) => c.category)));
  }, [crcClasses]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">Filter Classes</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Level
              </label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(categoryFilter !== "all" || levelFilter !== "all") && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredClasses.length} of {crcClasses.length} classes
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setLevelFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
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
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Classes Found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters to see more classes
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setCategoryFilter("all");
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
