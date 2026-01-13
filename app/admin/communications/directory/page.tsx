"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ContactsManagement } from "@/components/communications/contacts-management";
import { supabase } from "@/util/supabase";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Community, City } from "@/types/contacts";

export default function ContactsDirectoryPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch communities and cities based on user's access
  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      setError(null);

      try {
        const userCommunityIds = user.communities || [];
        const userCityIds = user.cities || [];

        // Fetch communities user has access to
        let fetchedCommunities: Community[] = [];
        if (userCommunityIds.length > 0) {
          const { data, error: commError } = await supabase
            .from("communities")
            .select("id, name")
            .in("id", userCommunityIds)
            .order("name");

          if (commError) {
            console.error("Error fetching communities:", commError);
          } else {
            fetchedCommunities = (data || []).map((c: any) => ({
              id: c.id,
              name: c.name,
            }));
          }
        }

        // Fetch cities user has access to
        let fetchedCities: City[] = [];
        if (userCityIds.length > 0) {
          const { data, error: cityError } = await supabase
            .from("cities")
            .select("id, name")
            .in("id", userCityIds)
            .order("name");

          if (cityError) {
            console.error("Error fetching cities:", cityError);
          } else {
            fetchedCities = (data || []).map((c: any) => ({
              id: c.id,
              name: c.name,
            }));
          }
        }

        setCommunities(fetchedCommunities);
        setCities(fetchedCities);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setDataLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  // Loading state
  if (userLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Alert className="max-w-md">
          <LogIn className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the contact directory.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Map user to the expected format for ContactsManagement
  const contactsUser = {
    id: user.id,
    isAdmin: user.permissions?.administrator === true,
  };

  return (
    <ContactsManagement
      user={contactsUser}
      userCommunities={communities}
      userCities={cities}
    />
  );
}
