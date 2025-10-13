"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CitySelectOption } from "@/lib/cities";

interface CitySelectProps {
  cities: CitySelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CitySelect({
  cities,
  value,
  onValueChange,
  placeholder = "Choose a city",
  includeAllOption = true,
  disabled = false,
  className,
}: CitySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {includeAllOption && <SelectItem value="all">All Cities</SelectItem>}
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.id}>
            {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CitySelectByName({
  cities,
  value,
  onValueChange,
  placeholder = "Choose a city",
  includeAllOption = true,
  disabled = false,
  className,
}: Omit<CitySelectProps, "value" | "onValueChange"> & {
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {includeAllOption && <SelectItem value="all">All Cities</SelectItem>}
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.name}>
            {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
