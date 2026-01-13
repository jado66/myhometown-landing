export type OwnerType = "user" | "community" | "city";

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone: string;
  owner_type: OwnerType;
  owner_id: string;
  groups: string[];
  visibility?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactFormData {
  id?: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone: string;
  owner_type: OwnerType;
  owner_id: string;
  groups: string[];
}

export interface Community {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
}

export interface User {
  id: string;
  isAdmin?: boolean;
}

export interface GroupsByOwner {
  user: string[];
  communities: Record<string, string[]>;
  cities: Record<string, string[]>;
}

export interface ContactsData {
  userContacts: Contact[];
  communityContacts: Record<string, Contact[]>;
  cityContacts: Record<string, Contact[]>;
}

export interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: ContactFormData) => void;
  contact?: Contact | null;
  userId: string;
  userCommunities?: Community[];
  userCities?: City[];
  groupsByOwner: GroupsByOwner;
  user: User;
  title?: string;
  formError?: string | null;
}

export interface ContactsTableProps {
  contacts: Contact[];
  groups: string[];
  ownerType: OwnerType;
  ownerId: string;
  tableName: string;
  userId: string;
  user: User;
  userCommunities?: Community[];
  userCities?: City[];
  onEdit: (contact: Contact) => void;
  onDelete: (contactIds: string[]) => void;
  onMove: (
    contactId: string,
    newOwnerType: OwnerType,
    newOwnerId: string
  ) => Promise<void>;
}
