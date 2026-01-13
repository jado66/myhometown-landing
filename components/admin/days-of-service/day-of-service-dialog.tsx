"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DayOfService } from "@/types/days-of-service";

interface Community {
  id: string;
  name: string;
  city_id: string;
}

interface City {
  id: string;
  name: string;
  state: string;
}

interface DayOfServiceDialogProps {
  open: boolean;
  onClose: (shouldRefresh?: boolean) => void;
  initialData?: DayOfService | null;
}

export default function DayOfServiceDialog({
  open,
  onClose,
  initialData,
}: DayOfServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    end_date: new Date(),
    check_in_location: "",
    city_id: "",
    community_id: "",
  });
  const [cities, setCities] = useState<City[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCitiesAndCommunities();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        end_date: new Date(initialData.end_date),
        check_in_location: initialData.check_in_location || "",
        city_id: initialData.city_id,
        community_id: initialData.community_id,
      });
    } else {
      setFormData({
        name: "",
        end_date: new Date(),
        check_in_location: "",
        city_id: "",
        community_id: "",
      });
    }
  }, [initialData, open]);

  useEffect(() => {
    if (formData.city_id) {
      const filtered = communities.filter(
        (c) => c.city_id === formData.city_id
      );
      setFilteredCommunities(filtered);
      // Reset community if it doesn't belong to selected city
      if (
        formData.community_id &&
        !filtered.some((c) => c.id === formData.community_id)
      ) {
        setFormData((prev) => ({ ...prev, community_id: "" }));
      }
    } else {
      setFilteredCommunities([]);
    }
  }, [formData.city_id, communities, formData.community_id]);

  const fetchCitiesAndCommunities = async () => {
    setIsLoadingData(true);
    try {
      const [citiesRes, communitiesRes] = await Promise.all([
        fetch("/api/admin/cities"),
        fetch("/api/admin/communities"),
      ]);

      if (!citiesRes.ok || !communitiesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const citiesData = await citiesRes.json();
      const communitiesData = await communitiesRes.json();

      setCities(citiesData);
      setCommunities(communitiesData);
    } catch (error) {
      console.error("Error fetching cities and communities:", error);
      toast({
        title: "Error",
        description: "Failed to load cities and communities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city_id || !formData.community_id) {
      toast({
        title: "Validation Error",
        description: "Please select both a city and community",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const startDate = new Date(formData.end_date);
      startDate.setMonth(startDate.getMonth() - 6);

      const payload = {
        name: formData.name || null,
        start_date: startDate.toISOString().split("T")[0],
        end_date: formData.end_date.toISOString().split("T")[0],
        check_in_location: formData.check_in_location || null,
        city_id: formData.city_id,
        community_id: formData.community_id,
      };

      const url = initialData
        ? `/api/days-of-service/${initialData.id}`
        : "/api/days-of-service";

      const response = await fetch(url, {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save day of service");
      }

      toast({
        title: "Success",
        description: `Day of service ${
          initialData ? "updated" : "created"
        } successfully`,
      });

      onClose(true);
    } catch (error) {
      console.error("Error saving day of service:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save day of service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCity = cities.find((c) => c.id === formData.city_id);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Day of Service" : "New Day of Service"}
            </DialogTitle>
            <DialogDescription>
              {initialData
                ? "Update the details for this day of service"
                : "Create a new day of service for your community"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, city_id: value })
                }
                disabled={isLoadingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="community">Community *</Label>
              <Select
                value={formData.community_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, community_id: value })
                }
                disabled={isLoadingData || !formData.city_id}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      formData.city_id
                        ? "Select a community"
                        : "First select a city"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredCommunities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Event Name (Optional)
                {selectedCity && (
                  <span className="text-muted-foreground text-xs ml-2">
                    Will be prefixed with &quot;{selectedCity.name}&quot;
                  </span>
                )}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Spring Day of Service"
              />
            </div>

            <div className="grid gap-2">
              <Label>Service Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? (
                      format(formData.end_date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, end_date: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Check-in Location (Optional)
              </Label>
              <Input
                id="location"
                value={formData.check_in_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    check_in_location: e.target.value,
                  })
                }
                placeholder="e.g., Community Center Parking Lot"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingData}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"} Day
              of Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
