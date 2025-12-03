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
  notes?: string;
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
  notes?: string;
  permissions: UserPermissions;
  cities: City[];
  communities: string[];
}

export const PERMISSION_OPTIONS = [
  {
    value: "texting" as const,
    label: "Texting",
    description:
      "Send and manage text message campaigns for cities and communities.",
  },
  {
    value: "dos_admin" as const,
    label: "Days of Service",
    description:
      "View and manage days of service. Track projects and volunteers.",
  },
  {
    value: "content_development" as const,
    label: "Content Management",
    description: "Manage city and community pages, create and manage classes.",
  },
  {
    value: "missionary_volunteer_management" as const,
    label: "Missionary & Volunteer Management",
    description:
      "Manage your missionaries. Add, remove, or edit missionary information.",
  },
  {
    value: "classes_admin" as const,
    label: "Classes & Rolls",
    description:
      "View your classes and rolls. Take attendance and manage your classes.",
  },
  {
    value: "administrator" as const,
    label: "Global Administrator",
    description:
      "This user will have full access to everything on the site as a Global Administrator.",
  },
] as const;
