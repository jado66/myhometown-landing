"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { CRC } from "@/types/crc";
import { crcs } from "@/data/crcs";
import { CRCCard } from "../crcs/crc-card";

interface CRCFinderExpandedProps {
  onCRCSelect: (crc: CRC) => void;
  selectedCRC: CRC | null;
}

export function CRCFinderExpanded({
  onCRCSelect,
  selectedCRC,
}: CRCFinderExpandedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const cities = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(crcs.map((crc) => crc.city))
    ).sort();
    return uniqueCities;
  }, []);

  const filteredCRCs = useMemo(() => {
    let filtered = crcs;

    filtered = filtered.filter((crc: CRC) => {
      const matchesSearch =
        searchQuery === "" ||
        crc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crc.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = selectedCity === "all" || crc.city === selectedCity;

      return matchesSearch && matchesCity;
    });

    return filtered;
  }, [searchQuery, selectedCity]);

  return (
    <section id="crc-finder" className="py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search and Filter Card */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-xl">
                Find Your Community Resource Center
              </CardTitle>
              <CardDescription>
                Search and filter to find classes near you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, city, or address..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="!h-12 sm:w-[240px]">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(searchQuery || selectedCity !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("all");
                    }}
                    className="h-12"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredCRCs.length} of {crcs.length} Community
                Resource Centers
              </div>
            </CardContent>
          </Card>

          {/* Results Grid */}
          <AnimatePresence>
            {filteredCRCs.length > 0 ? (
              <motion.div
                key={`results-${filteredCRCs.length}`}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  when: "beforeChildren",
                  staggerChildren: 0.08,
                  duration: 0.2,
                }}
              >
                {filteredCRCs.map((crc: CRC) => (
                  <motion.div
                    key={crc.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div
                      onClick={() => onCRCSelect(crc)}
                      className={`cursor-pointer transition-all duration-300 ${
                        selectedCRC?.id === crc.id
                          ? "ring-2 ring-primary/50 rounded-lg"
                          : ""
                      }`}
                    >
                      <CRCCard
                        crc={crc}
                        onSelect={onCRCSelect}
                        showSelectButton
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="text-center py-12">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No CRCs Found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("all");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
