import { useState, useEffect } from "react";
import type { DatabaseClass } from "@/lib/classes";

interface UseClassesOptions {
  communityId?: string;
  categoryId?: string;
  autoFetch?: boolean;
}

interface UseClassesResult {
  classes: DatabaseClass[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useClasses(options: UseClassesOptions = {}): UseClassesResult {
  const { communityId, categoryId, autoFetch = true } = options;
  const [classes, setClasses] = useState<DatabaseClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (communityId) {
        searchParams.append("communityId", communityId);
      }
      if (categoryId) {
        searchParams.append("categoryId", categoryId);
      }

      const response = await fetch(`/api/classes?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch classes";
      setError(errorMessage);
      console.error("Error fetching classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchClasses();
    }
  }, [communityId, categoryId, autoFetch]);

  return {
    classes,
    loading,
    error,
    refetch: fetchClasses,
  };
}
