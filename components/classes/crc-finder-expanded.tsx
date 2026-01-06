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
import { Search, LocateIcon, LoaderPinwheel, MapPinCheck } from "lucide-react";
import type { CRC, CRCWithDistance, UserLocation } from "@/types/crc";
import { calculateDistance } from "@/lib/geo-utils";
import { CRCCard } from "../crcs/crc-card";

interface CRCFinderExpandedProps {
  crcs: CRC[];
  onCRCSelect: (crc: CRC) => void;
  selectedCRC: CRC | null;
}

export function CRCFinderExpanded({
  crcs,
  onCRCSelect,
  selectedCRC,
}: CRCFinderExpandedProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const cities = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(
        crcs
          .map((crc) => crc.city?.name)
          .filter((city): city is string => !!city)
      )
    ).sort();
    return uniqueCities;
  }, [crcs]);

  const handleUseMyLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      () => {
        setLocationError(
          "Unable to retrieve your location. Please try searching manually."
        );
        setIsLoadingLocation(false);
      }
    );
  };

  const hasSearchCriteria =
    userLocation !== null || searchQuery !== "" || selectedCity !== "all";

  const { filteredCRCs, totalResults } = useMemo((): {
    filteredCRCs: (CRC | CRCWithDistance)[];
    totalResults: number;
  } => {
    let filtered = crcs;

    filtered = filtered.filter((crc: CRC) => {
      const matchesSearch =
        searchQuery === "" ||
        crc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crc.city?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crc.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity =
        selectedCity === "all" || crc.city?.name === selectedCity;

      return matchesSearch && matchesCity;
    });

    const totalResults = filtered.length;

    // Only use location-based sorting if user has location AND hasn't selected a specific city
    if (userLocation && selectedCity === "all") {
      const crcsWithDistance: CRCWithDistance[] = filtered
        .filter((crc) => crc.lat !== undefined && crc.lng !== undefined)
        .map((crc: CRC) => ({
          ...crc,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            crc.lat!,
            crc.lng!
          ),
        }));
      return {
        filteredCRCs: crcsWithDistance.sort((a, b) => a.distance - b.distance),
        totalResults,
      };
    }

    return {
      filteredCRCs: filtered,
      totalResults,
    };
  }, [searchQuery, selectedCity, userLocation, crcs]);

  return (
    <section id="crc-finder" className="py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Search and Filter Card */}
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-xl">Find Your Community</CardTitle>
              <CardDescription>
                Search and filter to find classes near you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Use My Location Button - Primary Action */}
              <Button
                size="lg"
                onClick={handleUseMyLocation}
                disabled={isLoadingLocation}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
              >
                {isLoadingLocation ? (
                  <>
                    <LoaderPinwheel className="mr-2 h-5 w-5 animate-spin" />
                    Finding your location...
                  </>
                ) : (
                  <>
                    <LocateIcon className="mr-2 h-5 w-5" />
                    Use My Location
                  </>
                )}
              </Button>

              {/* Location Status Messages */}
              <AnimatePresence mode="wait">
                {locationError && (
                  <motion.div
                    className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {locationError}
                  </motion.div>
                )}

                {userLocation && (
                  <motion.div
                    className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md flex items-center justify-between"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPinCheck className="h-4 w-4" />
                      <span>Location enabled - showing nearest CRCs</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserLocation(null)}
                      className="h-auto py-1 px-2 text-xs hover:bg-green-100"
                    >
                      Clear
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or search manually
                  </span>
                </div>
              </div>

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
                {(searchQuery || selectedCity !== "all" || userLocation) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("all");
                      setUserLocation(null);
                      setLocationError(null);
                    }}
                    className="h-12"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {hasSearchCriteria && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredCRCs.length} of {crcs.length} Community
                  Resource Centers
                  {userLocation &&
                    selectedCity === "all" &&
                    " (sorted by distance)"}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Grid - Only show when there's search criteria */}
          <AnimatePresence>
            {hasSearchCriteria ? (
              filteredCRCs.length > 0 ? (
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
                  {filteredCRCs.map((crc: CRC | CRCWithDistance) => (
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
                        setUserLocation(null);
                        setLocationError(null);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardContent className="text-center py-16">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <LocateIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      Ready to Find Your CRC?
                    </h3>
                    <p className="text-muted-foreground">
                      Use your location for the fastest results, or search
                      manually to explore all available Community Resource
                      Centers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
