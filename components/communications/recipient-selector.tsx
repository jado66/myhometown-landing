"use client";

import { useMemo, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Building2, MapPin, Search, X, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Contact, Community, City, ContactsData } from "@/types/contacts";
import type { User } from "@/types/user";

interface RecipientOption {
  value: string;
  label: string;
  contactId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  groups?: string[];
  ownerType?: string;
  ownerId?: string;
  originalValue?: string;
}

interface RecipientSelectorProps {
  selectedRecipients: RecipientOption[];
  onRecipientChange: (recipients: RecipientOption[]) => void;
  allContacts: RecipientOption[];
  groups: RecipientOption[];
  user: User;
  contacts: ContactsData;
}

export function RecipientSelector({
  selectedRecipients,
  onRecipientChange,
  allContacts,
  groups,
  user,
  contacts,
}: RecipientSelectorProps) {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [individualContacts, setIndividualContacts] = useState<Set<string>>(
    new Set()
  );
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Build audience options (groups to select from)
  const audienceOptions = useMemo(() => {
    const options: Array<{
      id: string;
      label: string;
      icon: any;
      count: number;
      contacts: RecipientOption[];
    }> = [];

    // Personal Contacts
    if (contacts.userContacts?.length > 0) {
      const personalContacts = allContacts.filter(
        (c) => c.ownerType === "user"
      );
      if (personalContacts.length > 0) {
        options.push({
          id: "personal",
          label: "Personal Contacts",
          icon: Users,
          count: personalContacts.length,
          contacts: personalContacts,
        });
      }
    }

    // Communities
    if (contacts.communityContacts) {
      Object.entries(contacts.communityContacts).forEach(
        ([communityId, contactsList]) => {
          if (contactsList.length > 0) {
            const communityContacts = allContacts.filter(
              (c) => c.ownerType === "community" && c.ownerId === communityId
            );
            if (communityContacts.length > 0) {
              const name =
                user?.communities_details?.find(
                  (c: { id: string; name: string }) => c.id === communityId
                )?.name || "Community";
              options.push({
                id: `community-${communityId}`,
                label: name,
                icon: Building2,
                count: communityContacts.length,
                contacts: communityContacts,
              });
            }
          }
        }
      );
    }

    // Cities
    if (contacts.cityContacts) {
      Object.entries(contacts.cityContacts).forEach(
        ([cityId, contactsList]) => {
          if (contactsList.length > 0) {
            const cityContacts = allContacts.filter(
              (c) => c.ownerType === "city" && c.ownerId === cityId
            );
            if (cityContacts.length > 0) {
              const name =
                user?.cities_details?.find(
                  (c: { id: string; name: string }) => c.id === cityId
                )?.name || "City";
              options.push({
                id: `city-${cityId}`,
                label: name,
                icon: MapPin,
                count: cityContacts.length,
                contacts: cityContacts,
              });
            }
          }
        }
      );
    }

    return options;
  }, [allContacts, contacts, user]);

  // Calculate final recipients
  const finalRecipients = useMemo(() => {
    const recipients: RecipientOption[] = [];
    const phoneSet = new Set<string>();

    // Add all contacts from selected groups
    selectedGroups.forEach((groupId) => {
      const audience = audienceOptions.find((a) => a.id === groupId);
      if (audience) {
        audience.contacts.forEach((contact) => {
          if (contact.phone && !phoneSet.has(contact.phone)) {
            phoneSet.add(contact.phone);
            recipients.push(contact);
          }
        });
      }
    });

    // Add individual contacts
    individualContacts.forEach((contactId) => {
      const contact = allContacts.find(
        (c) => (c.contactId || c.value) === contactId
      );
      if (contact && contact.phone && !phoneSet.has(contact.phone)) {
        phoneSet.add(contact.phone);
        recipients.push(contact);
      }
    });

    return recipients;
  }, [selectedGroups, individualContacts, audienceOptions, allContacts]);

  // Sync with parent
  useEffect(() => {
    onRecipientChange(finalRecipients);
  }, [finalRecipients, onRecipientChange]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const addIndividualContact = (contactId: string) => {
    setIndividualContacts((prev) => new Set([...prev, contactId]));
    setAddContactOpen(false);
    setSearchQuery("");
  };

  const removeIndividualContact = (contactId: string) => {
    setIndividualContacts((prev) => {
      const next = new Set(prev);
      next.delete(contactId);
      return next;
    });
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allContacts
      .filter(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query)
      )
      .slice(0, 20); // Limit results
  }, [searchQuery, allContacts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Recipients</CardTitle>
        <CardDescription>
          Choose contact groups or add individual contacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audience/Group Selection */}
        <div className="space-y-3">
          <Label>Contact Groups</Label>
          <div className="space-y-2">
            {audienceOptions.map((audience) => {
              const Icon = audience.icon;
              const isSelected = selectedGroups.has(audience.id);

              return (
                <div
                  key={audience.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => toggleGroup(audience.id)}
                >
                  <Checkbox checked={isSelected} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{audience.label}</span>
                  <Badge variant="secondary">{audience.count}</Badge>
                </div>
              );
            })}
            {audienceOptions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No contact groups available
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Individual Contacts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Additional Contacts</Label>
            <Popover open={addContactOpen} onOpenChange={setAddContactOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>No contacts found.</CommandEmpty>
                    <CommandGroup>
                      {searchResults.map((contact) => (
                        <CommandItem
                          key={contact.contactId || contact.value}
                          onSelect={() =>
                            addIndividualContact(
                              contact.contactId || contact.value
                            )
                          }
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {contact.phone}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {individualContacts.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.from(individualContacts).map((contactId) => {
                const contact = allContacts.find(
                  (c) => (c.contactId || c.value) === contactId
                );
                if (!contact) return null;

                return (
                  <Badge key={contactId} variant="secondary" className="gap-2">
                    {contact.firstName} {contact.lastName}
                    <button
                      onClick={() => removeIndividualContact(contactId)}
                      className="hover:bg-destructive/20 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Summary */}
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Recipients</span>
            <Badge variant="default" className="text-base">
              {finalRecipients.length}
            </Badge>
          </div>
          {selectedGroups.size > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedGroups.size} group{selectedGroups.size !== 1 ? "s" : ""}{" "}
              selected
              {individualContacts.size > 0 &&
                ` + ${individualContacts.size} individual`}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
