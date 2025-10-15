"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  Heart,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  DayOfServicePublic,
  CityWithCommunities,
} from "@/types/days-of-service";
import {
  getDaysOfServicePublic,
  getDaysOfServicePublicByCity,
  getCitiesWithCommunities,
} from "@/lib/days-of-service";
import { format, parseISO, isAfter, startOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const highlightImages = {
  transform: {
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/6ac65a2c-c6d1-42e7-a792-7d33582de7f1-MHT%20DOS.webp",
    blur: "data:image/webp;base64,UklGRoICAABXRUJQVlA4WAoAAAAIAAAAEwAADAAAVlA4IIYBAACwCACdASoUAA0APh0Kg0CDAIAAYDiewAnTKEcDek0wFYgZIBvG8wCeq47X85mU2nif6PzwsS31F/5J/ePys4039bhgfHzShdrTV4sNhQAA/vkIJJ2zBu6l38ryHor/o6FSn/f/m1N+w34k/8KWwUHM5Tur1U3v29lqXJJgsRvofhq6KZ064DWQk4+Vt3fs2z5W2H9qXz7uE6epONTLD2ogn22d5/xi+jbdxhVz+v/uev6U+7VV/CugQR/85V7xRJ0Qam8esbrqq0OeUPBYy9YqemBQfkxuw622EKuXm62hNm6IPsfIM6P/zRCj96vxl+/+uAGuyzk+lH+UwQT7KN7feOLR7DRbo7lpXB08mIPjgbuf+9eAVEf+DIZ1ulOTwYB/9MyDIB/f89G/+Gv7sNiRgUqMPdf9tcr0+IquaiWtc/ZsWVxvi4qcIxBZd6AP/JR5D91PA4vj0Pg5Ms39ZpzH5lFvUv8I3mp7OKUPf/P/P/uOcj/EVe7+bM970da9mIqW97EAAABFWElG1gAAAElJKgAIAAAABgASAQMAAQAAAAEAAAAaAQUAAQAAAFYAAAAbAQUAAQAAAF4AAAAoAQMAAQAAAAIAAAAxAQIAEAAAAGYAAABphwQAAQAAAHYAAAAAAAAAYAAAAAEAAABgAAAAAQAAAFBhaW50Lk5FVCA1LjEuNwAFAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAKgBAABAAAAFAAAAAOgBAABAAAADQAAAAWgBAABAAAAuAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAAA=",
  },
  impact: {
    image:
      "https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/16e95792-4da2-4599-9858-27abaf55261f-IMG_1369crop.png",
    blur: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAGCAIAAABM9SnKAAABeWlDQ1BJQ0MgUHJvZmlsZQAAKM+Vkc8rRFEUxz/zQ8SIIllYTBpWQ4Oa2CgzCTVpGqMMNjNvfqn58XpvJk22ynaKEhu/FvwFbJW1UkRK1myJDdNz3owaKQvndu753O+953TvuWANZ5SsbvdANlfQQlM+50Jk0dn4jA07XTJ6o4quTgSDAf6091ssZrweMGvxP2uJJ3QFLE3C44qqFYSnhQOrBdXkLeFOJR2NC58IuzW5oPCNqcdq/GRyqsafJmvhkB+s7cLO1A+O/WAlrWWF5eW4spmi8n0f8yWORG5+TmKveA86Iabw4WSGSfx4GWJMZi8DDDMoK/7I91TzZ8lLriKzSgmNFVKkKeAWtSjVExKToidkZCiZ/f/dVz05Mlyr7vBBw6NhvPZB4yZUyobxcWAYlUOwPcB5rp6f34fRN9HLdc21B23rcHpR12LbcLYB3fdqVItWJZu4NZmEl2NojUDHFTQv1Xr2vc/RHYTX5KsuYWcX+uV82/IXOVBn0WZADa0AAAAJcEhZcwAALiIAAC4iAari3ZIAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuN4vW9zkAAACMZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAA35MEAOgDAADfkwQA6AMAAFBhaW50Lk5FVCA1LjEuNwACAACQBwAEAAAAMDIzMAGgAwABAAAA//8AAAAAAABer1M4nw+XqwAAAXBJREFUKFMFwU0vw2AAAOC+b7/Wru06inaLLWQTEeHAUbji4m/4He5uEuIy4ujiIpm4LBExEhEHEmFbq5Z9qLX7aN+264fnASeH+8w4XRt2OZCgOE+RZQl3qAjpukMKGZYCgpS2rWH7o7a4viGyrO+qpuMTGK3VTXBVOljuuZ0ApBgOskkbI2iABgQBEjDSvQlRpOmOFXNjywUkLn/VHZa3Ftcea9+hoUHjU5d81e3/RkMDR5BGftPiZhOFZT9ZjHpaA2++U6ObChGYpu8+f9WtgGRyRSHFM2kFnB0fqc1w5DmxmLc7g924IWUZdQjf7l7WVznkLxVmSF5wYrV62Z8GcyuvqqkoWRfBogzwne29xlhy0SgcQ8P6K4NcDyNu7y8qLe06tyUE9qb5UA6mnqkZM6LY0PnRB09aTOIwzyNwflqqfrih3eZTooc8PyJZGk7yOIQkxiaNTssbjPR2l5MzjPO3UJi3A0ARcR/FSgr7ByW5uf95qW9XAAAAAElFTkSuQmCC",
  },
};

export function DaysOfServiceSection() {
  const t = useTranslations("home.dos");
  const heroT = useTranslations("home.hero");
  const serviceHighlights = [
    {
      key: "transform",
      title: t("highlights.transform_title"),
      description: t("highlights.transform_desc"),
      image: highlightImages.transform.image,
      blurDataURL: highlightImages.transform.blur,
      icon: Users,
    },
    {
      key: "impact",
      title: t("highlights.impact_title"),
      description: t("highlights.impact_desc"),
      image: highlightImages.impact.image,
      blurDataURL: highlightImages.impact.blur,
      icon: Heart,
    },
  ];
  const [daysOfService, setDaysOfService] = useState<DayOfServicePublic[]>([]);
  const [cities, setCities] = useState<CityWithCommunities[]>([]);
  const [citiesWithEvents, setCitiesWithEvents] = useState<
    CityWithCommunities[]
  >([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<DayOfServicePublic | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        // Auto-select the first (next) upcoming day
        if (futureDays.length > 0) {
          setSelectedDay(futureDays[0]);
        } else {
          setSelectedDay(null);
        }
      } catch (error) {
        console.error("Error fetching days of service:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDaysOfService();
  }, [selectedCity]);

  // Helper function to get city name from city_id
  const getCityName = (cityId: string): string => {
    const city = cities.find((c) => c.id === cityId);
    return city ? `${city.name}, ${city.state}` : "Unknown City";
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4  lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
            {t("heading")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            {t("intro")}
          </p>
        </div>

        {/* Service Highlights */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {serviceHighlights.map((highlight, index) => (
            <Card
              key={index}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-64">
                <Image
                  src={highlight.image || "/placeholder.svg"}
                  alt={highlight.title}
                  fill
                  placeholder="blur"
                  blurDataURL={highlight.blurDataURL || undefined}
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md">
                  <highlight.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3">{highlight.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {highlight.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Dates & CTA */}
        <div className="text-primary-foreground rounded-2xl p-8 md:p-12 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {t("upcoming_heading")}
              </h3>
              <p className="text-primary-foreground/90 mb-6 text-pretty">
                {t("selectCityHelp")}
              </p>

              {/* City Filter & Days in One Row */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* City Filter */}
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedCity}
                      onValueChange={setSelectedCity}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 h-10">
                        <SelectValue placeholder={t("chooseCityPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">{t("allCities")}</SelectItem>
                        {citiesWithEvents.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}, {city.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Available Dates */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      {loading ? (
                        <></>
                      ) : daysOfService.length > 0 ? (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedCity}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, staggerChildren: 0.1 }}
                            className="flex flex-wrap gap-2"
                          >
                            {daysOfService.slice(0, 4).map((day, index) => (
                              <motion.button
                                key={day.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  delay: index * 0.1,
                                  duration: 0.2,
                                }}
                                whileHover={{
                                  scale: 1.05,
                                  y: -2,
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium relative overflow-hidden group ${
                                  selectedDay?.id === day.id
                                    ? "bg-white text-primary border-white shadow-lg"
                                    : "bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-md"
                                }`}
                              >
                                {selectedDay?.id !== day.id && (
                                  <motion.div
                                    className="absolute inset-0 bg-white/10"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileHover={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                  />
                                )}
                                <span className="relative z-10">
                                  {format(parseISO(day.start_date), "MMM d")}
                                </span>
                              </motion.button>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20"
                        >
                          <div className="text-sm font-medium">
                            {t("noUpcomingInCity")}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <AnimatePresence mode="wait">
                {selectedDay ? (
                  <motion.div
                    key={selectedDay.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xl font-bold ">
                        {selectedDay.name ||
                          t("serviceDayFallback", {
                            city: getCityName(selectedDay.city_id),
                          })}
                      </h4>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {selectedDay.is_locked ? (
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                            {t("registrationClosed")}
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                            {t("registrationOpen")}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="space-y-3 text-primary-foreground/90"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">
                          {format(
                            parseISO(selectedDay.start_date),
                            "EEEE, MMMM d, yyyy"
                          )}
                        </span>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="flex items-start gap-2"
                      >
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {t("checkInPrefix")}{" "}
                            {selectedDay.check_in_location
                              ? t("atLocation", {
                                  location: selectedDay.check_in_location,
                                })
                              : t("locationTBA")}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                        className="flex items-center gap-2 font-medium"
                      >
                        <Clock className="w-5 h-5" />
                        <span>{t("startsAt", { time: "8:00 AM" })}</span>
                      </motion.div>

                      {selectedDay.partner_stake_names &&
                        selectedDay.partner_stake_names.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            className="pt-2 border-t border-white/20"
                          >
                            <p className="text-sm font-medium mb-1">
                              {t("participatingCommunities")}
                            </p>
                            <p className="text-sm opacity-90">
                              {selectedDay.partner_stake_names
                                .slice(0, 2)
                                .join(", ")}
                              {selectedDay.partner_stake_names.length > 2 &&
                                " " +
                                  t("moreCount", {
                                    count:
                                      selectedDay.partner_stake_names.length -
                                      2,
                                  })}
                            </p>
                          </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      className="pt-4"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full font-semibold hover:text-white"
                        onClick={() => {
                          if (!selectedDay) return;
                          // Deep link to Days of Service page with selected day pre-selected
                          router.push(
                            `/days-of-service?dos=${selectedDay.id}#volunteer-form-section`
                          );
                        }}
                        disabled={selectedDay.is_locked}
                      >
                        {selectedDay.is_locked
                          ? t("registrationClosed")
                          : heroT("volunteer_cta")}
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center py-8"
                  >
                    <Calendar className="w-12 h-12 text-primary-foreground/60 mb-4" />
                    <h4 className="text-lg font-semibold mb-2">
                      {t("emptySelectServiceDay")}
                    </h4>
                    <p className="text-primary-foreground/80 text-sm">
                      {t("emptySelectServiceDayHelp")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Don't see your city here */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t("noCityLine")}{" "}
            <a
              href="/contact"
              className="text-primary hover:underline font-medium"
            >
              {t("contactUs")}
            </a>{" "}
            {t("noCityTail")}
          </p>
        </div>
      </div>
    </section>
  );
}
