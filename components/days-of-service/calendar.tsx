"use client";

import { Calendar } from "@/components/ui/calendar";
import type { DayOfService } from "@/types/days-of-service";
import { useMemo } from "react";

interface DayOfServiceCalendarProps {
  daysOfService: DayOfService[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

export function DayOfServiceCalendar({
  daysOfService,
  selectedDate,
  onSelectDate,
}: DayOfServiceCalendarProps) {
  const serviceDates = useMemo(() => {
    const dates = new Set<string>();
    daysOfService.forEach((dos) => {
      const start = new Date(dos.start_date);
      const end = new Date(dos.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.add(d.toISOString().split("T")[0]);
      }
    });
    return dates;
  }, [daysOfService]);

interface ServiceDayModifier {
    (date: Date): boolean;
}

interface CalendarModifiers {
    serviceDay: ServiceDayModifier;
}

interface ServiceDayStyle {
    fontWeight: string;
    backgroundColor: string;
    color: string;
}

interface CalendarModifierStyles {
    serviceDay: ServiceDayStyle;
}

return (
    <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        className="rounded-md border"
        modifiers={{
            serviceDay: (date: Date): boolean => {
                const dateStr = date.toISOString().split("T")[0];
                return serviceDates.has(dateStr);
            },
        } satisfies CalendarModifiers}
        modifiersStyles={{
            serviceDay: {
                fontWeight: "bold",
                backgroundColor: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
            } satisfies ServiceDayStyle,
        } satisfies CalendarModifierStyles}
        disabled={(date: Date): boolean => {
            return date < new Date(new Date().setHours(0, 0, 0, 0));
        }}
    />
);
}
