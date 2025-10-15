"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
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
import {
  ArrowLeft,
  BriefcaseBusiness,
  GraduationCap,
  IceCreamCone,
  LoaderPinwheel,
  LocateIcon,
  MapPinCheck,
  Music4,
} from "lucide-react";
import { CRC, CRCWithDistance, UserLocation } from "@/types/crc";
import { calculateDistance } from "@/lib/geo-utils";
import { CRCCard } from "./crc-card";

interface CRCFinderSectionProps {
  crcs: CRC[];
}

export function CRCFinderSection({ crcs }: CRCFinderSectionProps) {
  const t = useTranslations("home.crcFinder");
  const p = useTranslations("home.crcFinder.searchPanel");
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
      setLocationError(p("noResults"));
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
        setLocationError(p("findingLocation"));
        setIsLoadingLocation(false);
      }
    );
  };

  const hasInteracted =
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
    // AND all CRCs have lat/lng data
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
        filteredCRCs: crcsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 4),
        totalResults,
      };
    }

    return {
      filteredCRCs: filtered.slice(0, 4),
      totalResults,
    };
  }, [searchQuery, selectedCity, userLocation, crcs]);

  return (
    <section
      id="classes"
      className="py-16 md:py-24 bg-gradient-to-b from-white to-stone-50"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t("heading")}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subheading")}
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 mb-16">
          {/* Left Sidebar - Search Controls */}

          <Card className="shadow-lg border-2 h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{p("searchCardTitle")}</CardTitle>
              <CardDescription>{p("searchCardDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Use My Location Button */}
              <Button
                size="lg"
                onClick={handleUseMyLocation}
                disabled={isLoadingLocation}
                className="w-full bg-primary hover:bg-primary/90 text-white h-12"
              >
                {isLoadingLocation ? (
                  <>
                    <LoaderPinwheel className="mr-2 h-5 w-5 animate-spin" />
                    {p("findingLocation")}
                  </>
                ) : (
                  <>
                    <LocateIcon className="mr-2 h-5 w-5" />
                    {p("useMyLocation")}
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
                      <span>{p("locationEnabled")}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserLocation(null)}
                      className="h-auto py-1 px-2 text-xs hover:bg-green-100"
                    >
                      {p("clear")}
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
                    {p("orSearchManually")}
                  </span>
                </div>
              </div>

              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {p("searchLabel")}
                </label>
                <Input
                  type="text"
                  placeholder={p("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {p("filterByCity")}
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={p("allCities")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">{p("allCities")}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              {hasInteracted && (
                <motion.div
                  className="pt-4 border-t border-gray-200 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-gray-600">
                    {totalResults === 0 ? (
                      p("noResults")
                    ) : (
                      <>
                        {p("resultsShowing")}{" "}
                        <span className="font-semibold text-primary">
                          {filteredCRCs.length}
                        </span>{" "}
                        {p("of")}{" "}
                        <span className="font-semibold text-primary">
                          {totalResults}
                        </span>{" "}
                        {totalResults === 1 ? p("crcSingular") : p("crcPlural")}
                        {userLocation &&
                          selectedCity === "all" &&
                          ` ${p("nearestToYou")}`}
                      </>
                    )}
                  </p>
                  {totalResults > 4 && (
                    <p className="text-xs text-gray-500">
                      {p("narrowResultsHint")}
                    </p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Right Content Area - Info or Results */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {!hasInteracted ? (
                <motion.div
                  key="info-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl md:text-3xl">
                        {p("whatIsHeading")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg leading-relaxed text-gray-700">
                        {p("whatIsDescription")}
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex gap-3 p-4 bg-stone-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Free Education
                            </h4>
                            <p className="text-sm text-gray-600">
                              ESL classes, computer skills, citizenship prep,
                              and more—all at no cost.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-stone-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Music4 className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Arts & Music
                            </h4>
                            <p className="text-sm text-gray-600">
                              Piano lessons, art classes, and creative programs
                              for all ages.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-stone-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <IceCreamCone className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Family Programs
                            </h4>
                            <p className="text-sm text-gray-600">
                              Youth activities, family events, and community
                              gatherings.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-stone-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <BriefcaseBusiness className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Job Readiness
                            </h4>
                            <p className="text-sm text-gray-600">
                              Vocational training, resume help, and career
                              development resources.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-5 bg-primary/5 rounded-lg border border-primary/20 hidden md:block">
                        <p className="text-center font-medium text-primary flex items-center justify-center gap-2 ">
                          <ArrowLeft className="h-5 w-5 md:block hidden" />
                          {p("useSearchPanelHint")}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={`search-results-${selectedCity}-${searchQuery}-${
                    userLocation ? "located" : "manual"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  {filteredCRCs.length > 0 ? (
                    <motion.div
                      key={`results-grid-${selectedCity}-${searchQuery}`}
                      className="grid gap-6 sm:grid-cols-2"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.08,
                          },
                        },
                      }}
                    >
                      {filteredCRCs.map((crc) => (
                        <CRCCard key={crc.id} crc={crc} />
                      ))}
                    </motion.div>
                  ) : (
                    <Card className="border-2 border-dashed">
                      <CardContent className="text-center pt-12">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {p("noCrCsFoundTitle")}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {p("noCrCsFoundBody")}
                        </p>
                        {/* Dont see your city here */}

                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCity("all");
                            setUserLocation(null);
                          }}
                        >
                          {p("clearAllFilters")}
                        </Button>

                        <div className="mt-10 mb-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Don&apos;t see your city?{" "}
                            <a
                              href="/contact"
                              className="text-primary hover:underline font-medium"
                            >
                              Contact us
                            </a>{" "}
                            to learn about upcoming opportunities in your area.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
