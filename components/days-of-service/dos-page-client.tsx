"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
  Calendar,
  Users,
  Heart,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowRight,
  Search,
} from "lucide-react";
import { DayOfServiceCalendar } from "@/components/days-of-service/calendar";
import type {
  DayOfServicePublic,
  CityWithCommunities,
} from "@/types/days-of-service";
import { VolunteerForm } from "@/components/volunteer/volunteer-form";
import {
  getDaysOfServicePublic,
  getDaysOfServicePublicByCity,
  getCitiesWithCommunities,
} from "@/lib/days-of-service";
import PatternBackground from "@/components/ui/pattern-background";
import { ChevronDown } from "lucide-react";
import { Container } from "@/layout/container";
import { format, parseISO, startOfDay } from "date-fns";

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

interface DaysOfServicePageInnerProps {
  stats: Stat[];
}

function DaysOfServicePageInner({ stats }: DaysOfServicePageInnerProps) {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDayOfService, setSelectedDayOfService] =
    useState<DayOfServicePublic | null>(null);
  const [daysOfService, setDaysOfService] = useState<DayOfServicePublic[]>([]);
  const [cities, setCities] = useState<CityWithCommunities[]>([]);
  const [citiesWithEvents, setCitiesWithEvents] = useState<
    CityWithCommunities[]
  >([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Fetch cities on component mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const citiesData = await getCitiesWithCommunities();
        setCities(citiesData);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    }
    fetchCities();
  }, []);

  // Filter cities that have upcoming events
  useEffect(() => {
    async function filterCitiesWithEvents() {
      if (cities.length === 0) return;

      try {
        const citiesWithUpcomingEvents: CityWithCommunities[] = [];

        for (const city of cities) {
          const cityEvents = await getDaysOfServicePublicByCity(city.id);

          // Filter out past dates for this city
          const today = startOfDay(new Date());
          const futureDays = cityEvents.filter((day) => {
            const dayDate = startOfDay(parseISO(day.start_date));
            return dayDate >= today;
          });

          if (futureDays.length > 0) {
            citiesWithUpcomingEvents.push(city);
          }
        }

        setCitiesWithEvents(citiesWithUpcomingEvents);

        // If the currently selected city is not in the filtered list, reset to "all"
        if (
          selectedCity !== "all" &&
          !citiesWithUpcomingEvents.find((city) => city.id === selectedCity)
        ) {
          setSelectedCity("all");
        }
      } catch (error) {
        console.error("Error filtering cities with events:", error);
        // Fallback to showing all cities if there's an error
        setCitiesWithEvents(cities);
      }
    }

    filterCitiesWithEvents();
  }, [cities, selectedCity]);

  // Fetch days of service when city selection changes
  useEffect(() => {
    async function fetchDaysOfService() {
      setLoading(true);
      try {
        let data: DayOfServicePublic[];
        if (selectedCity && selectedCity !== "all") {
          data = await getDaysOfServicePublicByCity(selectedCity);
        } else {
          data = await getDaysOfServicePublic();
        }

        // Filter out past dates (only show today and future dates)
        const today = startOfDay(new Date());
        const futureDays = data.filter((day) => {
          const dayDate = startOfDay(parseISO(day.start_date));
          return dayDate >= today;
        });

        setDaysOfService(futureDays);
      } catch (error) {
        console.error("Error fetching days of service:", error);
        setDaysOfService([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDaysOfService();
  }, [selectedCity]);

  // Auto-select a Day of Service via query param (?dos=<id>) and scroll to form
  useEffect(() => {
    const dosId = searchParams.get("dos");
    if (!dosId || selectedDayOfService) return;
    if (daysOfService.length === 0) return; // wait until data loaded
    const target = daysOfService.find((d) => d.id === dosId);
    if (target) {
      // Optionally set date filter to that day
      setSelectedDate(new Date(target.start_date));
      handleSelectDayOfService(target);
    }
  }, [searchParams, daysOfService, selectedDayOfService]);

  // Helper function to get city name from city_id
  const getCityName = (cityId: string): string => {
    const city = cities.find((c) => c.id === cityId);
    return city ? `${city.name}, ${city.state}` : "Unknown City";
  };

  const filteredDaysOfService = useMemo(() => {
    let filtered = daysOfService;

    filtered = filtered.filter((dos: DayOfServicePublic) => {
      const cityName = getCityName(dos.city_id);
      const matchesSearch =
        searchQuery === "" ||
        (dos.name &&
          dos.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cityName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity =
        selectedCity === "all" || dos.city_id === selectedCity;

      const matchesDate =
        !selectedDate ||
        new Date(dos.start_date).toDateString() ===
          selectedDate.toDateString() ||
        new Date(dos.end_date).toDateString() === selectedDate.toDateString() ||
        (new Date(dos.start_date) <= selectedDate &&
          selectedDate <= new Date(dos.end_date));

      return matchesSearch && matchesCity && matchesDate;
    });

    return filtered.sort(
      (a: DayOfServicePublic, b: DayOfServicePublic) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
  }, [daysOfService, searchQuery, selectedCity, selectedDate, cities]);

  const handleCalendarDateClick = (date: Date, dosId: string) => {
    setSelectedDate(date);
    const dos = daysOfService.find((d: DayOfServicePublic) => d.id === dosId);
    if (dos && cardRefs.current[dosId]) {
      cardRefs.current[dosId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setTimeout(() => {
        setSelectedDayOfService(dos);
      }, 500);
    }
  };

  const handleSelectDayOfService = (dos: DayOfServicePublic) => {
    setSelectedDayOfService(dos);
    const formElement = document.getElementById("volunteer-form-section");
    formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectChangeButton = () => {
    setSelectedDayOfService(null);
    const finderElement = document.getElementById("days-of-service-finder");
    finderElement?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          id="days-of-service-hero"
        >
          <section className="relative text-white py-20 px-4 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                  {t("dosPage.hero.title")}
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 text-pretty leading-relaxed max-w-3xl mx-auto">
                  {t("dosPage.hero.subtitle")}
                </p>

                <div className="bg-primary-foreground/10 bg-white text-foreground rounded-lg p-6 mb-8 border border-primary-foreground/20">
                  <h3 className="text-xl font-semibold mb-3">
                    {t("dosPage.hero.how.heading")}
                  </h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <span>{t("dosPage.hero.how.step1")}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <span>{t("dosPage.hero.how.step2")}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 hidden md:block" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <span>{t("dosPage.hero.how.step3")}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      {t("dosPage.hero.benefits.community")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Heart className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      {t("dosPage.hero.benefits.impact")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      {t("dosPage.hero.benefits.flexible")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-primary-foreground/60" />
            </div>
          </section>
        </PatternBackground>

        {/* Calendar Section */}
        {/* <section className="py-12 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-lg border-2">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl">
                  Service Calendar
                </CardTitle>
                <CardDescription>
                  Click on any highlighted date to view details and register for the next three months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DayOfServiceCalendar
                  daysOfService={daysOfService}
                  selectedDate={selectedDate}
                  onDateClick={handleCalendarDateClick}
                />
                {selectedDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDate(undefined);
                    }}
                    className="w-full mt-4"
                  >
                    Clear Date Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section> */}

        <section
          id="days-of-service-finder"
          className="py-8 md:py-12 text-foreground"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Search and Filter Bar */}
              <Card className="shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-xl">
                    {t("dosPage.finder.heading")}
                  </CardTitle>
                  <CardDescription>
                    {t("dosPage.finder.subheading")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t("dosPage.finder.searchPlaceholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 pl-10"
                      />
                    </div>
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger className="!h-12 sm:w-[240px]">
                        <SelectValue
                          placeholder={t("dosPage.finder.allCitiesPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">
                          {t("dosPage.finder.allCities")}
                        </SelectItem>
                        {citiesWithEvents.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}, {city.state}
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
                        className="h-12 mt-8"
                      >
                        {t("dosPage.finder.clearFilters")}
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {t("dosPage.finder.showing", {
                      count: filteredDaysOfService.length,
                      total: daysOfService.length,
                    })}
                    {loading && ` ${t("dosPage.finder.loading")}`}
                  </div>
                </CardContent>
              </Card>

              {/* Results Grid */}
              <AnimatePresence>
                {loading ? (
                  <Card className="border-2">
                    <CardContent className="text-center py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-lg font-medium">
                          {t("dosPage.loading")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : filteredDaysOfService.length > 0 ? (
                  <motion.div
                    key={`results-${filteredDaysOfService.length}`}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: {
                        opacity: 0,
                      },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 0.1,
                        },
                      },
                    }}
                  >
                    {filteredDaysOfService.map(
                      (dos: DayOfServicePublic, index: number) => (
                        <motion.div
                          key={dos.id}
                          ref={(el) => {
                            cardRefs.current[dos.id] = el;
                          }}
                          variants={{
                            hidden: {
                              opacity: 0,
                              y: 20,
                            },
                            visible: {
                              opacity: 1,
                              y: 0,
                              transition: {
                                duration: 0.5,
                                ease: "easeOut",
                              },
                            },
                          }}
                        >
                          <Card
                            className={`border-2 hover:border-primary hover:shadow-lg transition-all duration-300 h-full cursor-pointer ${
                              selectedDayOfService?.id === dos.id
                                ? "border-primary shadow-lg ring-2 ring-primary/20"
                                : ""
                            }`}
                            onClick={() =>
                              !dos.is_locked && handleSelectDayOfService(dos)
                            }
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-xl">
                                  {dos.name ||
                                    `Service Day - ${getCityName(dos.city_id)}`}
                                </CardTitle>
                                {dos.is_locked && (
                                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              <CardDescription className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {getCityName(dos.city_id)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span className="font-medium">
                                    {new Date(
                                      dos.start_date
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                {dos.start_date !== dos.end_date && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="ml-6">
                                      to{" "}
                                      {new Date(
                                        dos.end_date
                                      ).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                                {dos.check_in_location && (
                                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{dos.check_in_location}</span>
                                  </div>
                                )}
                              </div>

                              {dos.partner_stake_names &&
                                dos.partner_stake_names.length > 0 && (
                                  <div className="pt-3 border-t">
                                    <p className="text-xs text-muted-foreground mb-2">
                                      Participating Communities:
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {dos.partner_stake_names.map(
                                        (stake: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                          >
                                            {stake}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              <Button
                                className="w-full text-white"
                                disabled={dos.is_locked}
                              >
                                {dos.is_locked ? (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    {t("dosPage.cards.registrationClosed")}
                                  </>
                                ) : selectedDayOfService?.id === dos.id ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {t("dosPage.cards.selected")}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {t("dosPage.cards.selectThisDay")}
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    )}
                  </motion.div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="text-center py-12">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("dosPage.empty.title")}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {t("dosPage.empty.body")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCity("all");
                          setSelectedDate(undefined);
                        }}
                      >
                        {t("dosPage.finder.clearAllFilters")}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <hr className="border-t border-muted-foreground/20 mx-4 md:mx-0" />

        <section id="volunteer-form-section" className="py-8 md:py-12 ">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className=" mx-auto">
              <Card className="shadow-xl border-2">
                <CardHeader className="text-primary-foreground">
                  <CardTitle className="text-2xl md:text-3xl">
                    {t("dosPage.registration.heading")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  {selectedDayOfService ? (
                    <>
                      {/* Selected Day of Service Info */}
                      <div className="mb-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <h4 className="font-semibold text-lg">
                              {selectedDayOfService.name ||
                                t("dosPage.cards.fallbackTitle", {
                                  city: getCityName(
                                    selectedDayOfService.city_id
                                  ),
                                })}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {getCityName(selectedDayOfService.city_id)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  selectedDayOfService.start_date
                                ).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectChangeButton}
                            className="flex-shrink-0"
                          >
                            {t("dosPage.registration.change")}
                          </Button>
                        </div>
                      </div>
                      <VolunteerForm />
                    </>
                  ) : (
                    <div className="text-center py-12 space-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {t("dosPage.registration.noSelectionTitle")}
                      </h3>
                      <p className="text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto">
                        {t("dosPage.registration.noSelectionBody")}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const element = document.getElementById(
                            "days-of-service-finder"
                          );
                          element?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }}
                      >
                        {t("dosPage.registration.browse")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 text-center">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}

export function DaysOfServicePageClient({
  stats,
}: DaysOfServicePageInnerProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DaysOfServicePageInner stats={stats} />
    </Suspense>
  );
}
