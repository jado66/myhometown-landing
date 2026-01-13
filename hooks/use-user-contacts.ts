"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/util/supabase";
import type {
  Contact,
  ContactFormData,
  ContactsData,
  OwnerType,
} from "@/types/contacts";
import { parseGroups } from "@/lib/contacts-utils";

export interface UseUserContactsReturn {
  contacts: ContactsData;
  loading: boolean;
  error: string | null;
  addContact: (
    contact: ContactFormData
  ) => Promise<{ data?: Contact; error?: string }>;
  updateContact: (
    id: string,
    contact: ContactFormData
  ) => Promise<{ data?: Contact; error?: string }>;
  deleteContact: (id: string) => Promise<void>;
  moveContact: (
    id: string,
    ownerType: OwnerType,
    ownerId: string
  ) => Promise<void>;
  refreshContacts: () => void;
}

export function useUserContacts(
  userId: string,
  communityIds: string[],
  cityIds: string[]
): UseUserContactsReturn {
  const [contacts, setContacts] = useState<ContactsData>({
    userContacts: [],
    communityContacts: {},
    cityContacts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable string keys from arrays to prevent infinite loops
  const communityIdsKey = useMemo(() => communityIds.join(","), [communityIds]);
  const cityIdsKey = useMemo(() => cityIds.join(","), [cityIds]);

  // Transform database row to Contact type
  const transformContact = useCallback(
    (row: any): Contact => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      middle_name: row.middle_name || "",
      email: row.email || "",
      phone: row.phone || "",
      owner_type: row.owner_type as OwnerType,
      owner_id: row.owner_id,
      groups: parseGroups(row.groups),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }),
    []
  );

  // Fetch all contacts for the user
  const fetchContacts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build queries for all owner types
      const queries = [];

      // User's personal contacts
      queries.push(
        supabase
          .from("contacts")
          .select("*")
          .eq("owner_type", "user")
          .eq("owner_id", userId)
          .order("last_name", { ascending: true })
      );

      // Community contacts
      if (communityIds.length > 0) {
        queries.push(
          supabase
            .from("contacts")
            .select("*")
            .eq("owner_type", "community")
            .in("owner_id", communityIds)
            .order("last_name", { ascending: true })
        );
      }

      // City contacts
      if (cityIds.length > 0) {
        queries.push(
          supabase
            .from("contacts")
            .select("*")
            .eq("owner_type", "city")
            .in("owner_id", cityIds)
            .order("last_name", { ascending: true })
        );
      }

      const results = await Promise.all(queries);

      // Check for errors
      for (const result of results) {
        if (result.error) {
          throw new Error(result.error.message);
        }
      }

      // Process user contacts
      const userContacts = (results[0].data || []).map(transformContact);

      // Process community contacts (grouped by community ID)
      const communityContacts: Record<string, Contact[]> = {};
      communityIds.forEach((id) => {
        communityContacts[id] = [];
      });

      if (communityIds.length > 0 && results[1]?.data) {
        results[1].data.forEach((row: any) => {
          const contact = transformContact(row);
          if (communityContacts[contact.owner_id]) {
            communityContacts[contact.owner_id].push(contact);
          }
        });
      }

      // Process city contacts (grouped by city ID)
      const cityContacts: Record<string, Contact[]> = {};
      cityIds.forEach((id) => {
        cityContacts[id] = [];
      });

      const cityResultIndex = communityIds.length > 0 ? 2 : 1;
      if (cityIds.length > 0 && results[cityResultIndex]?.data) {
        results[cityResultIndex].data.forEach((row: any) => {
          const contact = transformContact(row);
          if (cityContacts[contact.owner_id]) {
            cityContacts[contact.owner_id].push(contact);
          }
        });
      }

      setContacts({
        userContacts,
        communityContacts,
        cityContacts,
      });
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    communityIdsKey,
    cityIdsKey,
    communityIds,
    cityIds,
    transformContact,
  ]);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add a new contact
  const addContact = async (
    contactData: ContactFormData
  ): Promise<{ data?: Contact; error?: string }> => {
    try {
      // Prepare data for insertion
      const insertData = {
        first_name: contactData.first_name.trim(),
        last_name: contactData.last_name.trim(),
        middle_name: contactData.middle_name?.trim() || null,
        email: contactData.email?.trim() || null,
        phone: contactData.phone.trim(),
        owner_type: contactData.owner_type,
        owner_id: contactData.owner_id,
        groups: JSON.stringify(contactData.groups || []),
      };

      const { data, error } = await supabase
        .from("contacts")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // Check for duplicate phone number
        if (error.code === "23505") {
          return { error: "A contact with this phone number already exists" };
        }
        return { error: error.message };
      }

      const newContact = transformContact(data);
      return { data: newContact };
    } catch (err) {
      console.error("Error adding contact:", err);
      return {
        error: err instanceof Error ? err.message : "Failed to add contact",
      };
    }
  };

  // Update an existing contact
  const updateContact = async (
    id: string,
    contactData: ContactFormData
  ): Promise<{ data?: Contact; error?: string }> => {
    try {
      const updateData = {
        first_name: contactData.first_name.trim(),
        last_name: contactData.last_name.trim(),
        middle_name: contactData.middle_name?.trim() || null,
        email: contactData.email?.trim() || null,
        phone: contactData.phone.trim(),
        owner_type: contactData.owner_type,
        owner_id: contactData.owner_id,
        groups: JSON.stringify(contactData.groups || []),
      };

      const { data, error } = await supabase
        .from("contacts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          return { error: "A contact with this phone number already exists" };
        }
        return { error: error.message };
      }

      const updatedContact = transformContact(data);
      return { data: updatedContact };
    } catch (err) {
      console.error("Error updating contact:", err);
      return {
        error: err instanceof Error ? err.message : "Failed to update contact",
      };
    }
  };

  // Delete a contact
  const deleteContact = async (id: string): Promise<void> => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  };

  // Move a contact to a different owner
  const moveContact = async (
    id: string,
    ownerType: OwnerType,
    ownerId: string
  ): Promise<void> => {
    const { error } = await supabase
      .from("contacts")
      .update({ owner_type: ownerType, owner_id: ownerId })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  };

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    moveContact,
    refreshContacts: fetchContacts,
  };
}
