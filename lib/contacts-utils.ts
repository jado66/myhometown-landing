import { Contact, ContactFormData } from "@/types/contacts";

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Format as +X (XXX) XXX-XXXX if 11 digits
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(
      4,
      7
    )}-${cleaned.slice(7)}`;
  }

  // Return as-is if not standard length
  return phone;
}

export function getFullName(contact: Contact | ContactFormData): string {
  const parts = [
    contact.first_name?.trim() || "",
    contact.middle_name?.trim() || "",
    contact.last_name?.trim() || "",
  ];
  return parts.filter(Boolean).join(" ");
}

export function parseGroups(groups: any): string[] {
  if (!groups) return [];
  if (Array.isArray(groups)) return groups.filter(Boolean);

  if (typeof groups === "string") {
    try {
      const parsed = JSON.parse(groups);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return [];
    }
  }

  return [];
}

export function isDuplicateContact(
  newContact: ContactFormData,
  existingContacts: Contact[] | ContactFormData[]
): boolean {
  const newPhone = newContact.phone.replace(/\D/g, "");

  return existingContacts.some((contact) => {
    const existingPhone = contact.phone.replace(/\D/g, "");
    return existingPhone === newPhone;
  });
}

export function validateContact(contact: ContactFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!contact.first_name?.trim()) {
    errors.first_name = "First name is required";
  }

  if (!contact.last_name?.trim()) {
    errors.last_name = "Last name is required";
  }

  if (!contact.phone?.trim()) {
    errors.phone = "Phone number is required";
  } else {
    const cleaned = contact.phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
    }
  }

  if (contact.email && contact.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.email = "Invalid email format";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sortContacts(
  contacts: Contact[],
  orderBy: keyof Contact,
  order: "asc" | "desc"
): Contact[] {
  return [...contacts].sort((a, b) => {
    let aVal = a[orderBy];
    let bVal = b[orderBy];

    // Special handling for name sorting
    if (orderBy === "last_name") {
      aVal = getFullName(a);
      bVal = getFullName(b);
    }

    // Handle groups (array)
    if (orderBy === "groups") {
      aVal = parseGroups(a.groups).join(", ");
      bVal = parseGroups(b.groups).join(", ");
    }

    if (aVal === undefined || aVal === null) aVal = "";
    if (bVal === undefined || bVal === null) bVal = "";

    const comparison = String(aVal).localeCompare(String(bVal));
    return order === "asc" ? comparison : -comparison;
  });
}

export function filterContacts(contacts: Contact[], query: string): Contact[] {
  if (!query.trim()) return contacts;

  const lowerQuery = query.toLowerCase();

  return contacts.filter((contact) => {
    const searchableFields = [
      contact.first_name,
      contact.middle_name,
      contact.last_name,
      contact.email,
      contact.phone,
      ...parseGroups(contact.groups),
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(lowerQuery)
    );
  });
}
