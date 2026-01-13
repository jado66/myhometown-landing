"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/util/supabase";
import type { User, UserPermissions } from "@/types/user";

interface CurrentUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  permissions: UserPermissions;
  cities?: string[];
  communities?: string[];
  is_missionary?: boolean;
  missionary_id?: string;
  missionary_data?: {
    phone?: string;
    city_id?: string;
    community_id?: string;
  };
}

interface UserContextValue {
  user: CurrentUser | null;
  authUser: any | null;
  isLoading: boolean;
  error: string | null;
  isImpersonating: boolean;
  impersonateUser: (userId: string, email: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const IMPERSONATION_KEY = "impersonatedUser";

function getImpersonatedUser(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(IMPERSONATION_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const fetchUserById = useCallback(async (userId: string, email: string) => {
    try {
      // First, try to fetch from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          "id, email, first_name, last_name, permissions, cities, communities"
        )
        .eq("id", userId)
        .single();

      if (!userError && userData) {
        return {
          id: userData.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          permissions: userData.permissions || {},
          cities: userData.cities,
          communities: userData.communities,
          is_missionary: false,
        };
      }

      // If not found in users table, check missionaries table
      const { data: missionaryData, error: missionaryError } = await supabase
        .from("missionaries")
        .select(
          "id, email, first_name, last_name, phone, phone_number, phoneNumber, mobile, mobile_number, city_id, community_id"
        )
        .eq("email", email)
        .single();

      if (!missionaryError && missionaryData) {
        // Found in missionaries table
        const phone =
          (missionaryData as any).phone ||
          (missionaryData as any).phone_number ||
          (missionaryData as any).phoneNumber ||
          (missionaryData as any).mobile ||
          (missionaryData as any).mobile_number;

        return {
          id: userId,
          email: missionaryData.email,
          first_name: missionaryData.first_name,
          last_name: missionaryData.last_name,
          permissions: {}, // Missionaries don't have admin permissions
          is_missionary: true,
          missionary_id: missionaryData.id,
          missionary_data: {
            phone,
            city_id: (missionaryData as any).city_id,
            community_id: (missionaryData as any).community_id,
          },
        };
      }

      // Not found in either table, return basic user object
      console.warn("User not found in users or missionaries table");
      return {
        id: userId,
        email: email,
        permissions: {},
      };
    } catch (err) {
      console.error("Error fetching user by ID:", err);
      return null;
    }
  }, []);

  const initializeUser = useCallback(
    async (sessionUser: any | null) => {
      try {
        setIsLoading(true);
        setError(null);

        // Check for impersonated user first
        const impersonatedUser = getImpersonatedUser();

        if (impersonatedUser) {
          setIsImpersonating(true);
          const userData = await fetchUserById(
            impersonatedUser.id,
            impersonatedUser.email
          );
          setUser(userData);
        } else if (sessionUser) {
          setIsImpersonating(false);
          const userData = await fetchUserById(
            sessionUser.id,
            sessionUser.email || ""
          );
          setUser(userData);
        } else {
          // No authenticated or impersonated user
          setUser(null);
          setIsImpersonating(false);
        }
      } catch (err) {
        console.error("Error initializing user:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserById]
  );

  const impersonateUser = useCallback(
    async (userId: string, email: string) => {
      setIsLoading(true);
      try {
        const userData = await fetchUserById(userId, email);

        if (userData) {
          // Store impersonation data in localStorage
          window.localStorage.setItem(
            IMPERSONATION_KEY,
            JSON.stringify({ id: userId, email })
          );
          setIsImpersonating(true);
          setUser(userData);

          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new CustomEvent("impersonation-changed"));
        }
      } catch (err) {
        console.error("Error impersonating user:", err);
        setError(
          err instanceof Error ? err.message : "Failed to impersonate user"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchUserById]
  );

  const stopImpersonation = useCallback(async () => {
    setIsLoading(true);
    window.localStorage.removeItem(IMPERSONATION_KEY);
    setIsImpersonating(false);

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent("impersonation-changed"));

    if (authUser) {
      await initializeUser(authUser);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [authUser, initializeUser]);

  useEffect(() => {
    // Set up Supabase auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const sessionUser = session?.user ?? null;
      setAuthUser(sessionUser);

      if (event === "SIGNED_OUT") {
        setUser(null);
        window.localStorage.removeItem(IMPERSONATION_KEY);
        setIsImpersonating(false);
        setIsLoading(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setAuthUser(sessionUser);
      initializeUser(sessionUser);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initializeUser]);

  // Listen for storage events to sync impersonation state across tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === IMPERSONATION_KEY) {
        // Re-initialize user when impersonation state changes
        initializeUser(authUser);
      }
    };

    // Also listen for custom events for same-tab updates
    const handleImpersonationChange = () => {
      initializeUser(authUser);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("impersonation-changed", handleImpersonationChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "impersonation-changed",
        handleImpersonationChange
      );
    };
  }, [authUser, initializeUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        isLoading,
        error,
        isImpersonating,
        impersonateUser,
        stopImpersonation,
        refetch: () => initializeUser(authUser),
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Helper function to check if user has a specific permission
export function hasPermission(
  user: CurrentUser | null,
  permission: keyof UserPermissions
): boolean {
  if (!user) return false;
  // Administrators have all permissions
  if (user.permissions.administrator) return true;
  return user.permissions[permission] === true;
}

// Helper function to check if user has any of the specified permissions
export function hasAnyPermission(
  user: CurrentUser | null,
  permissions: (keyof UserPermissions)[]
): boolean {
  if (!user) return false;
  if (user.permissions.administrator) return true;
  return permissions.some((p) => user.permissions[p] === true);
}
