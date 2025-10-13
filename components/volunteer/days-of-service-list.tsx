"use client";

import { useState, useEffect } from "react";
import { DayOfService } from "@/types/days-of-service";
import {
  getDaysOfServiceByCity,
  getAllDaysOfService,
} from "@/lib/days-of-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

interface DaysOfServiceListProps {
  cityId?: string;
  className?: string;
}

export function DaysOfServiceList({
  cityId,
  className,
}: DaysOfServiceListProps) {
  const [daysOfService, setDaysOfService] = useState<DayOfService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDaysOfService() {
      setLoading(true);
      setError(null);

      try {
        let data: DayOfService[];
        if (cityId && cityId !== "all") {
          data = await getDaysOfServiceByCity(cityId);
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
  }, [cityId]);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (isSameDay(start, end)) {
      return format(start, "MMMM d, yyyy");
    } else {
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="mb-4">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (daysOfService.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {cityId && cityId !== "all"
            ? "No upcoming days of service in this city"
            : "No upcoming days of service found"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Check back later for new opportunities!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6">
        {daysOfService.map((day) => (
          <Card
            key={day.id}
            className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {day.name || `Day of Service - ${day.short_id}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(day.start_date, day.end_date)}</span>
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
                  {isSameDay(parseISO(day.start_date), parseISO(day.end_date))
                    ? "Single day event"
                    : "Multi-day event"}
                </span>
              </div>

              {day.partner_stakes && day.partner_stakes.length > 0 && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Partner Stakes:
                    </p>
                    <p className="text-sm">{day.partner_stakes.join(", ")}</p>
                  </div>
                </div>
              )}

              {day.partner_wards && day.partner_wards.length > 0 && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Partner Wards:
                    </p>
                    <p className="text-sm">{day.partner_wards.join(", ")}</p>
                  </div>
                </div>
              )}

              {day.is_locked && (
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                  Registration Closed
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
