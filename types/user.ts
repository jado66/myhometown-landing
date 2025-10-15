import { City, Community } from "./admin";

export interface User {
  id: string;
  email: string;
  contact_number?: string;
  permissions?: UserPermissions;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  last_active_at?: string;
  communities?: string[];
  cities?: string[];
  // Extended fields for display
  cities_details?: City[];
  communities_details?: Community[];
  last_sign_in_at?: string;
}

export interface UserPermissions {
  texting?: boolean;
  dos_admin?: boolean;
  content_development?: boolean;
  missionary_volunteer_management?: boolean;
  classes_admin?: boolean;
  administrator?: boolean;
}

export interface UserFormData {
  id?: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number?: string;
  permissions: UserPermissions;
  cities: City[];
  communities: string[];
}

export const PERMISSION_OPTIONS = [
  {
    value: "texting" as const,
    label: "Texting",
    description:
      "Can send and manage text message campaigns for their assigned cities and communities.",
  },
  {
    value: "dos_admin" as const,
    label: "DOS Admin",
    description:
      "Can lock and unlock projects, view budgets, and bypass authentication requirements for DOS projects.",
  },
  {
    value: "content_development" as const,
    label: "Content Development",
    description:
      "Can create and edit content on the site for their assigned cities and communities.",
  },
  {
    value: "missionary_volunteer_management" as const,
    label: "Missionary & Volunteer Management",
    description:
      "Can manage missionary and volunteer hours, view reports, and manage related settings for their assigned cities and communities.",
  },
  {
    value: "classes_admin" as const,
    label: "Classes Admin",
    description:
      "Can manage classes, view reports, and manage related settings for their assigned cities and communities.",
  },
  {
    value: "administrator" as const,
    label: "Global Administrator",
    description:
      "This user will have full access to everything on the site as a Global Administrator.",
  },
] as const;
