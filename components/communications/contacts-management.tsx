"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  FileUp,
  FileDown,
  RefreshCw,
  Search,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContactDialog } from "./contact-dialog";
import { ContactsTable } from "./contacts-table";
import { ImportCsvHelpDialog } from "./import-csv-help-dialog";
import type {
  Contact,
  ContactFormData,
  User,
  Community,
  City,
  GroupsByOwner,
  ContactsData,
  OwnerType,
} from "@/types/contacts";
import {
  parseGroups,
  filterContacts,
  isDuplicateContact,
  formatPhoneNumber,
} from "@/lib/contacts-utils";
import { useUserContacts } from "@/hooks/use-user-contacts";
import { toast } from "sonner";

interface ContactsManagementProps {
  user: User;
  userCommunities?: Community[];
  userCities?: City[];
}

export function ContactsManagement({
  user,
  userCommunities = [],
  userCities = [],
}: ContactsManagementProps) {
  const userId = user.id;

  // Memoize the ID arrays to prevent infinite re-renders
  const communityIds = useMemo(
    () => userCommunities.map((c) => c.id),
    [userCommunities]
  );
  const cityIds = useMemo(() => userCities.map((c) => c.id), [userCities]);

  const {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    moveContact,
    refreshContacts,
  } = useUserContacts(userId, communityIds, cityIds);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [csvHelpOpen, setCsvHelpOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [groupsByOwner, setGroupsByOwner] = useState<GroupsByOwner>({
    user: [],
    communities: {},
    cities: {},
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactsToDelete, setContactsToDelete] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(["user"]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search contacts..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl/Cmd + N - Add new contact
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleAddContact();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Extract groups from contacts organized by owner
  useEffect(() => {
    if (!contacts) return;

    const userGroups = new Set<string>();
    const communityGroups: Record<string, Set<string>> = {};
    const cityGroups: Record<string, Set<string>> = {};

    // Initialize sets
    userCommunities.forEach((community) => {
      communityGroups[community.id] = new Set();
    });
    userCities.forEach((city) => {
      cityGroups[city.id] = new Set();
    });

    // Extract user groups
    contacts.userContacts?.forEach((contact) => {
      parseGroups(contact.groups).forEach((group) => userGroups.add(group));
    });

    // Extract community groups
    Object.entries(contacts.communityContacts || {}).forEach(
      ([communityId, contactList]) => {
        contactList.forEach((contact) => {
          parseGroups(contact.groups).forEach((group) =>
            communityGroups[communityId]?.add(group)
          );
        });
      }
    );

    // Extract city groups
    Object.entries(contacts.cityContacts || {}).forEach(
      ([cityId, contactList]) => {
        contactList.forEach((contact) => {
          parseGroups(contact.groups).forEach((group) =>
            cityGroups[cityId]?.add(group)
          );
        });
      }
    );

    setGroupsByOwner({
      user: Array.from(userGroups),
      communities: Object.fromEntries(
        Object.entries(communityGroups).map(([id, set]) => [
          id,
          Array.from(set),
        ])
      ),
      cities: Object.fromEntries(
        Object.entries(cityGroups).map(([id, set]) => [id, Array.from(set)])
      ),
    });
  }, [contacts, userCommunities, userCities]);

  const handleAddContact = () => {
    setEditingContact(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSaveContact = async (contactData: ContactFormData) => {
    try {
      if (editingContact) {
        const { error } = await updateContact(editingContact.id, contactData);
        if (error) {
          setFormError(error);
          toast.error(error);
          return;
        }
        toast.success("Contact updated successfully");
      } else {
        const { error } = await addContact(contactData);
        if (error) {
          setFormError(error);
          toast.error(error);
          return;
        }
        toast.success("Contact added successfully");
      }

      setDialogOpen(false);
      setEditingContact(null);
      setFormError(null);
      refreshContacts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDeleteContacts = (contactIds: string[]) => {
    setContactsToDelete(contactIds);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of contactsToDelete) {
        await deleteContact(id);
      }
      toast.success(`Deleted ${contactsToDelete.length} contact(s)`);
      refreshContacts();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete contacts";
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setContactsToDelete([]);
    }
  };

  const handleImportCsv = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info("Starting CSV import...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim());

        if (lines.length === 0) {
          toast.error("CSV file is empty");
          return;
        }

        const errors: string[] = [];
        const duplicates: string[] = [];
        let imported = 0;

        // Parse headers
        const rawHeaders = lines[0]
          .split(",")
          .map((h) => h.trim().toLowerCase());
        const headerMap = new Map<string, number>();

        rawHeaders.forEach((header, index) => {
          const normalized = header.replace(/[^a-z0-9]/g, "");
          if (
            [
              "firstname",
              "lastname",
              "middlename",
              "email",
              "phone",
              "groups",
            ].includes(normalized)
          ) {
            headerMap.set(normalized, index);
          }
        });

        // Check required headers
        if (
          !headerMap.has("firstname") ||
          !headerMap.has("lastname") ||
          !headerMap.has("phone")
        ) {
          toast.error("Missing required columns: First Name, Last Name, Phone");
          return;
        }

        // Get all existing contacts for duplicate checking
        const allContacts = [
          ...contacts.userContacts,
          ...Object.values(contacts.communityContacts).flat(),
          ...Object.values(contacts.cityContacts).flat(),
        ];

        // Process each line
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          const values = line.split(",").map((v) => v.trim());

          const contact: ContactFormData = {
            first_name: values[headerMap.get("firstname")!] || "",
            last_name: values[headerMap.get("lastname")!] || "",
            middle_name: headerMap.has("middlename")
              ? values[headerMap.get("middlename")!]
              : "",
            email: headerMap.has("email")
              ? values[headerMap.get("email")!]
              : "",
            phone: formatPhoneNumber(values[headerMap.get("phone")!] || ""),
            owner_type: "user",
            owner_id: userId,
            groups: headerMap.has("groups")
              ? values[headerMap.get("groups")!]?.split(";").filter(Boolean) ||
                []
              : [],
          };

          // Validate
          if (!contact.first_name || !contact.last_name || !contact.phone) {
            errors.push(`Line ${i + 1}: Missing required fields`);
            continue;
          }

          // Check duplicates
          if (isDuplicateContact(contact, allContacts)) {
            duplicates.push(`Line ${i + 1}: Duplicate phone number`);
            continue;
          }

          // Add contact
          const { error } = await addContact(contact);
          if (error) {
            errors.push(`Line ${i + 1}: ${error}`);
          } else {
            imported++;
          }
        }

        // Show results
        let message = `Imported ${imported} contacts`;
        if (duplicates.length > 0) {
          message += `, skipped ${duplicates.length} duplicates`;
        }
        if (errors.length > 0) {
          message += `, ${errors.length} errors`;
          toast.warning(message);
        } else {
          toast.success(message);
        }

        if (imported > 0) {
          refreshContacts();
        }
      } catch (err) {
        toast.error("Failed to import CSV");
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  const handleExportCsv = () => {
    const allContacts = [
      ...contacts.userContacts,
      ...Object.values(contacts.communityContacts).flat(),
      ...Object.values(contacts.cityContacts).flat(),
    ];

    const headers = [
      "First Name",
      "Middle Name",
      "Last Name",
      "Email",
      "Phone",
      "Groups",
    ];
    const rows = allContacts.map((contact) => [
      contact.first_name || "",
      contact.middle_name || "",
      contact.last_name || "",
      contact.email || "",
      contact.phone || "",
      parseGroups(contact.groups).join(";"),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `contacts-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Contacts exported successfully");
  };

  const getGroupsForOwner = (ownerType: OwnerType, ownerId: string) => {
    if (ownerType === "user") return groupsByOwner.user;
    if (ownerType === "community")
      return groupsByOwner.communities[ownerId] || [];
    if (ownerType === "city") return groupsByOwner.cities[ownerId] || [];
    return [];
  };

  if (!userId) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view and manage contacts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Directory</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCsvHelpOpen(true)}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={refreshContacts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleAddContact}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {Array.from(new Set([
              ...groupsByOwner.user,
              ...Object.values(groupsByOwner.communities).flat(),
              ...Object.values(groupsByOwner.cities).flat(),
            ])).sort().map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Results Count */}
      {(searchQuery || selectedGroup !== "all") && (
        <div className="text-sm text-muted-foreground">
          {(() => {
            const allContacts = [
              ...contacts.userContacts,
              ...Object.values(contacts.communityContacts).flat(),
              ...Object.values(contacts.cityContacts).flat(),
            ];
            const filtered = allContacts.filter(contact => {
              const matchesSearch = searchQuery ? 
                filterContacts([contact], searchQuery).length > 0 : true;
              const matchesGroup = selectedGroup !== "all" ? 
                parseGroups(contact.groups).includes(selectedGroup) : true;
              return matchesSearch && matchesGroup;
            });
            return `Showing ${filtered.length} of ${allContacts.length} contacts`;
          })()}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(8)].map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <>
          {/* Contacts Sections */}
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="space-y-4"
          >
        {/* User Contacts */}
        {(() => {
          const filtered = contacts.userContacts.filter(contact => {
            const matchesSearch = filterContacts([contact], searchQuery).length > 0;
            const matchesGroup = selectedGroup !== "all" ? 
              parseGroups(contact.groups).includes(selectedGroup) : true;
            return matchesSearch && matchesGroup;
          });
          if (filtered.length === 0) return null;
          return (
            <AccordionItem value="user" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {user.isAdmin ? "Personal Contacts" : "Unassigned Contacts"}
                  </span>
                  <Badge variant="secondary">
                    {filtered.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-5 overflow-visible">
              {!user.isAdmin && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You cannot send texts to unassigned contacts. Please assign
                    them to a city or community to enable texting.
                  </AlertDescription>
                </Alert>
              )}
              <ContactsTable
                contacts={filtered}
                groups={groupsByOwner.user}
                ownerType="user"
                ownerId={userId}
                tableName={
                  user.isAdmin ? "Personal Contacts" : "Unassigned Contacts"
                }
                userId={userId}
                user={user}
                userCommunities={userCommunities}
                userCities={userCities}
                onEdit={handleEditContact}
                onDelete={handleDeleteContacts}
                onMove={moveContact}
              />
              </AccordionContent>
            </AccordionItem>
          );
        })()}

        {/* Community Contacts */}
        {userCommunities.map((community) => {
          const communityContacts =
            contacts.communityContacts?.[community.id] || [];
          const filtered = communityContacts.filter(contact => {
            const matchesSearch = filterContacts([contact], searchQuery).length > 0;
            const matchesGroup = selectedGroup !== "all" ? 
              parseGroups(contact.groups).includes(selectedGroup) : true;
            return matchesSearch && matchesGroup;
          });
          if (filtered.length === 0) return null;

          return (
            <AccordionItem
              key={community.id}
              value={`community-${community.id}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {community.name} Contacts
                  </span>
                  <Badge variant="secondary">{filtered.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-5 overflow-visible">
                <ContactsTable
                  contacts={filtered}
                  groups={getGroupsForOwner("community", community.id)}
                  ownerType="community"
                  ownerId={community.id}
                  tableName={community.name}
                  userId={userId}
                  user={user}
                  userCommunities={userCommunities}
                  userCities={userCities}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContacts}
                  onMove={moveContact}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}

        {/* City Contacts */}
        {userCities.map((city) => {
          const cityContacts = contacts.cityContacts?.[city.id] || [];
          const filtered = cityContacts.filter(contact => {
            const matchesSearch = filterContacts([contact], searchQuery).length > 0;
            const matchesGroup = selectedGroup !== "all" ? 
              parseGroups(contact.groups).includes(selectedGroup) : true;
            return matchesSearch && matchesGroup;
          });
          if (filtered.length === 0) return null;

          return (
            <AccordionItem
              key={city.id}
              value={`city-${city.id}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{city.name} Contacts</span>
                  <Badge variant="secondary">{filtered.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-5 overflow-visible">
                <ContactsTable
                  contacts={filtered}
                  groups={getGroupsForOwner("city", city.id)}
                  ownerType="city"
                  ownerId={city.id}
                  tableName={city.name}
                  userId={userId}
                  user={user}
                  userCommunities={userCommunities}
                  userCities={userCities}
                  onEdit={handleEditContact}
                  onDelete={handleDeleteContacts}
                  onMove={moveContact}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Empty State */}
      {(() => {
        const allContacts = [
          ...contacts.userContacts,
          ...Object.values(contacts.communityContacts).flat(),
          ...Object.values(contacts.cityContacts).flat(),
        ];
        const hasContacts = allContacts.length > 0;
        const hasFilters = searchQuery || selectedGroup !== "all";
        
        const filtered = allContacts.filter(contact => {
          const matchesSearch = searchQuery ? 
            filterContacts([contact], searchQuery).length > 0 : true;
          const matchesGroup = selectedGroup !== "all" ? 
            parseGroups(contact.groups).includes(selectedGroup) : true;
          return matchesSearch && matchesGroup;
        });
        
        if (filtered.length > 0) return null;
        
        return (
          <div className="text-center py-12">
            {hasContacts ? (
              <>
                <h3 className="text-lg font-semibold mb-2">
                  No contacts match your filters
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery && `No results for "${searchQuery}"`}
                  {searchQuery && selectedGroup !== "all" && " in "}
                  {selectedGroup !== "all" && `group "${selectedGroup}"`}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedGroup("all");
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first contact or importing from CSV
                </p>
                <Button onClick={handleAddContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact
                </Button>
              </>
            )}
          </div>
        );
      })()}
        </>
      )}

      {/* Dialogs */}
      <ContactDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingContact(null);
          setFormError(null);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        userId={userId}
        userCommunities={userCommunities}
        userCities={userCities}
        groupsByOwner={groupsByOwner}
        user={user}
        title={editingContact ? "Edit Contact" : "Add Contact"}
        formError={formError}
      />

      <ImportCsvHelpDialog
        open={csvHelpOpen}
        onClose={() => setCsvHelpOpen(false)}
        onImport={handleImportCsv}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contactsToDelete.length}{" "}
              contact(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContactsToDelete([])}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
