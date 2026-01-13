"use client";

import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Phone,
  Mail,
  Copy,
  ChevronUp,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Contact, ContactsTableProps } from "@/types/contacts";
import { getFullName, parseGroups, sortContacts } from "@/lib/contacts-utils";
import { toast } from "sonner";

type SortField = "last_name" | "phone" | "email" | "groups";

const SORT_STORAGE_KEY = "contacts-table-sort";

interface SortPreference {
  field: SortField;
  order: "asc" | "desc";
}

export function ContactsTable({
  contacts,
  groups,
  ownerType,
  ownerId,
  tableName,
  userId,
  user,
  userCommunities = [],
  userCities = [],
  onEdit,
  onDelete,
  onMove,
}: ContactsTableProps) {
  const router = useRouter();
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(
    new Set()
  );

  // Initialize sort state from localStorage
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SORT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as SortPreference;
          return parsed.field;
        }
      } catch {}
    }
    return "last_name";
  });

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SORT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as SortPreference;
          return parsed.order;
        }
      } catch {}
    }
    return "asc";
  });

  // Save sort preferences to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const preference: SortPreference = {
          field: sortField,
          order: sortOrder,
        };
        localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(preference));
      } catch {}
    }
  }, [sortField, sortOrder]);

  const sortedContacts = sortContacts(contacts, sortField, sortOrder);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleMove = async (
    newOwnerType: "user" | "community" | "city",
    newOwnerId: string
  ) => {
    const contactIds = Array.from(selectedContacts);

    for (const contactId of contactIds) {
      await onMove(contactId, newOwnerType, newOwnerId);
    }

    setSelectedContacts(new Set());
    toast.success(`Moved ${contactIds.length} contact(s)`);
  };

  const handleDeleteSelected = () => {
    const contactIds = Array.from(selectedContacts);
    onDelete(contactIds);
    setSelectedContacts(new Set());
  };

  const handleSendText = () => {
    const contactIds = Array.from(selectedContacts);
    // Store selected contact IDs in sessionStorage for the send page
    sessionStorage.setItem('selectedContactIds', JSON.stringify(contactIds));
    router.push('/admin/communications/send-texts');
  };

  const copyToClipboard = (text: string, type: string) => {
    const cleanText = type === "phone" ? text.replace(/\D/g, "") : text;
    navigator.clipboard.writeText(cleanText);
    toast.success(`Copied ${type} to clipboard`);
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground text-muted-foreground transition-colors"
    >
      {label}
      {sortField === field &&
        (sortOrder === "asc" ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        ))}
    </button>
  );

  return (
    <div className="space-y-4">
      {selectedContacts.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedContacts.size} selected:
          </span>

          {tableName !== "Personal Contacts" &&
            tableName !== "Unassigned Contacts" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMove("user", userId)}
              >
                Move to {user.isAdmin ? "Personal" : "Unassigned"}
              </Button>
            )}

          {userCommunities
            .filter((community) => community.name !== tableName)
            .map((community) => (
              <Button
                key={community.id}
                variant="outline"
                size="sm"
                onClick={() => handleMove("community", community.id)}
              >
                Move to {community.name}
              </Button>
            ))}

          {userCities
            .filter((city) => city.name !== tableName)
            .map((city) => (
              <Button
                key={city.id}
                variant="outline"
                size="sm"
                onClick={() => handleMove("city", city.id)}
              >
                Move to {city.name}
              </Button>
            ))}

          <Button
            variant="default"
            size="sm"
            onClick={handleSendText}
            className="ml-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Text
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    contacts.length > 0 &&
                    selectedContacts.size === contacts.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <SortButton field="last_name" label="Name" />
              </TableHead>
              <TableHead>
                <SortButton field="phone" label="Phone" />
              </TableHead>
              <TableHead>
                <SortButton field="email" label="Email" />
              </TableHead>
              <TableHead>
                <SortButton field="groups" label="Groups" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              sortedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.has(contact.id)}
                      onCheckedChange={(checked) =>
                        handleSelectContact(contact.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getFullName(contact)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="hidden xl:inline">{contact.phone}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="xl:hidden h-8 w-8 p-0"
                              onClick={() =>
                                copyToClipboard(contact.phone, "phone")
                              }
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{contact.phone}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden xl:flex h-8 w-8 p-0"
                        onClick={() => copyToClipboard(contact.phone, "phone")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <div className="flex items-center gap-2">
                        <span className="hidden xl:inline truncate max-w-[200px]">
                          {contact.email}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="xl:hidden h-8 w-8 p-0"
                                onClick={() =>
                                  copyToClipboard(contact.email!, "email")
                                }
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{contact.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden xl:flex h-8 w-8 p-0"
                          onClick={() =>
                            copyToClipboard(contact.email!, "email")
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseGroups(contact.groups).map((group) => (
                        <Badge
                          key={group}
                          variant="secondary"
                          className="text-xs"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete([contact.id])}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow className="bg-muted/50 font-semibold">
              <TableCell colSpan={2}>Total:</TableCell>
              <TableCell>{contacts.length}</TableCell>
              <TableCell colSpan={3}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
