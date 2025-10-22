"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Heart,
} from "lucide-react";
import { DayOfService, CityWithCommunities } from "@/types/days-of-service";
import {
  getDaysOfServiceByCity,
  getAllDaysOfService,
  getCitiesWithCommunities,
} from "@/lib/days-of-service";
import { format, parseISO, isSameDay } from "date-fns";

export function DaysOfServiceSection() {
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [daysOfService, setDaysOfService] = useState<DayOfService[]>([]);
  const [cities, setCities] = useState<CityWithCommunities[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch days of service when city selection changes
  useEffect(() => {
    async function fetchDaysOfService() {
      setLoading(true);
      setError(null);

      try {
        let data: DayOfService[];
        if (selectedCity && selectedCity !== "all") {
          data = await getDaysOfServiceByCity(selectedCity);
        } else {
          data = await getAllDaysOfService();
        }
        setDaysOfService(data);
      } catch (err) {
        console.error("Error fetching days of service:", err);
        setError("Failed to load days of service. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchDaysOfService();
  }, [selectedCity]);

  const hasInteracted = selectedCity !== "all";

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isSameDay(start, end)) {
      return format(start, "MMMM d, yyyy");
    } else {
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
  };

  const displayedDaysOfService = daysOfService.slice(0, 6); // Show up to 6 events

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-green-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Upcoming Days of Service
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join community service events in your area and make a difference in
            Utah neighborhoods
          </p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8 mb-16">
          {/* Left Sidebar - City Selection */}
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                Find Service Opportunities
              </CardTitle>
              <CardDescription>
                Browse days of service by city or view all upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Filter by City
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}, {city.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <motion.div
                className="pt-4 border-t border-gray-200 space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-sm text-gray-600">
                  {loading ? (
                    "Loading events..."
                  ) : daysOfService.length === 0 ? (
                    "No upcoming events found"
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-primary">
                        {displayedDaysOfService.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-primary">
                        {daysOfService.length}
                      </span>{" "}
                      {daysOfService.length === 1 ? "event" : "events"}
                      {hasInteracted && selectedCity !== "all" && (
                        <> in selected city</>
                      )}
                    </>
                  )}
                </p>
                {daysOfService.length > 6 && (
                  <p className="text-xs text-gray-500">
                    Showing the next 6 events. More opportunities available!
                  </p>
                )}
              </motion.div>

              {/* Call to Action */}
              <div className="pt-4 border-t border-gray-200 ">
                <Button
                  className="w-full text-primary bg-primary/10 hover:bg-primary/20"
                  onClick={() => {
                    const formSection =
                      document.getElementById("volunteer-form");
                    if (formSection) {
                      formSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Sign Up to Volunteer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Content Area - Events or Info */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {!hasInteracted && daysOfService.length === 0 && !loading ? (
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
                        What are Days of Service?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg leading-relaxed text-gray-700">
                        Days of Service are organized community volunteer events
                        where neighbors come together to strengthen Utah
                        communities through coordinated service projects and
                        activities.
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Community Building
                            </h4>
                            <p className="text-sm text-gray-600">
                              Connect with neighbors and build lasting
                              relationships through service.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Heart className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Meaningful Impact
                            </h4>
                            <p className="text-sm text-gray-600">
                              Make a real difference in your community through
                              organized service projects.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Flexible Participation
                            </h4>
                            <p className="text-sm text-gray-600">
                              Choose from various service opportunities that fit
                              your schedule.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1 text-gray-900">
                              Local Focus
                            </h4>
                            <p className="text-sm text-gray-600">
                              Serve in your own neighborhood and see the direct
                              impact of your efforts.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 p-5 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-center font-medium text-primary flex items-center justify-center gap-2">
                          <ArrowRight className="h-5 w-5" />
                          Select a city to view upcoming service opportunities
                          in your area
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={`service-results-${selectedCity}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="space-y-6"
                >
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : error ? (
                    <Card className="border-2 border-red-200">
                      <CardContent className="text-center py-12">
                        <h3 className="text-lg font-semibold text-red-700 mb-2">
                          Error Loading Events
                        </h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button
                          variant="outline"
                          onClick={() => window.location.reload()}
                        >
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  ) : displayedDaysOfService.length > 0 ? (
                    <motion.div
                      key={`results-grid-${selectedCity}`}
                      className="grid gap-6"
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
                      {displayedDaysOfService.map((day, index) => (
                        <motion.div
                          key={day.id}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                          }}
                        >
                          <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {day.name || `Day of Service - ${day.short_id}`}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {formatDateRange(
                                    day.start_date,
                                    day.end_date
                                  )}
                                </span>
                              </div>

                              {day.check_in_location && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{day.check_in_location}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {isSameDay(
                                    parseISO(day.start_date),
                                    parseISO(day.end_date)
                                  )
                                    ? "Single day event"
                                    : "Multi-day event"}
                                </span>
                              </div>

                              {(day.partner_stakes?.length ||
                                day.partner_wards?.length) && (
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <Users className="w-4 h-4 mt-0.5" />
                                  <div>
                                    {day.partner_stakes &&
                                      day.partner_stakes.length > 0 && (
                                        <div>
                                          <p className="text-sm font-medium text-foreground">
                                            Partner Stakes:
                                          </p>
                                          <p className="text-sm">
                                            {day.partner_stakes.join(", ")}
                                          </p>
                                        </div>
                                      )}
                                    {day.partner_wards &&
                                      day.partner_wards.length > 0 && (
                                        <div
                                          className={
                                            day.partner_stakes?.length
                                              ? "mt-2"
                                              : ""
                                          }
                                        >
                                          <p className="text-sm font-medium text-foreground">
                                            Partner Wards:
                                          </p>
                                          <p className="text-sm">
                                            {day.partner_wards.join(", ")}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2">
                                {day.is_locked ? (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                                    Registration Closed
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                    Registration Open
                                  </div>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const formSection =
                                      document.getElementById("volunteer-form");
                                    if (formSection) {
                                      formSection.scrollIntoView({
                                        behavior: "smooth",
                                      });
                                    }
                                  }}
                                  className="group-hover:bg-primary group-hover:text-white transition-colors"
                                >
                                  Sign Up{" "}
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <Card className="border-2 border-dashed">
                      <CardContent className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Upcoming Events
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {hasInteracted
                            ? "No service events found in the selected city"
                            : "No upcoming days of service scheduled"}
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedCity("all")}
                        >
                          View All Cities
                        </Button>
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
