"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageComposer } from "./message-composer";
import { RecipientSelector } from "./recipient-selector";
import { RecipientsList } from "./recipients-list";
import { ReviewAndSend } from "./review-and-send";
import { ProgressTracker } from "./progress-tracker";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUserContacts } from "@/hooks/use-user-contacts";
import { getFullName, parseGroups } from "@/lib/contacts-utils";
import type { Contact, ContactsData } from "@/types/contacts";

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

interface MediaFile {
  file: File;
  preview: string;
}

interface MessageResult {
  phone: string;
  status:
    | "sent"
    | "delivered"
    | "failed"
    | "undelivered"
    | "pending"
    | "queued";
  sid?: string;
  error?: string;
  isTestNumber?: boolean;
}

interface MessageSummary {
  total: number;
  successful: number;
  failed: number;
  results: MessageResult[];
}

interface ApiResponse {
  success: boolean;
  error?: string;
  summary: MessageSummary;
}

interface ProgressState {
  total: number;
  sent: number;
  failed: number;
  error?: string;
}

export function BulkMMSMessaging() {
  const { toast } = useToast();
  const currentUser = useCurrentUser();

  // Wait for user to load
  if (!currentUser?.user || currentUser.isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Loading user data...
          </p>
        </CardContent>
      </Card>
    );
  }

  const user = currentUser.user;
  const userId = user.id;
  const communityIds = user.communities || [];
  const cityIds = user.cities || [];

  return (
    <BulkMMSMessagingContent
      user={user}
      userId={userId}
      communityIds={communityIds}
      cityIds={cityIds}
    />
  );
}

function BulkMMSMessagingContent({
  user,
  userId,
  communityIds,
  cityIds,
}: {
  user: any;
  userId: string;
  communityIds: string[];
  cityIds: string[];
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  console.log("BulkMMSMessaging - userId:", userId);
  console.log("BulkMMSMessaging - communityIds:", communityIds);
  console.log("BulkMMSMessaging - cityIds:", cityIds);

  // Load contacts using the hook
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

  console.log("BulkMMSMessaging - contacts loaded:", contacts);
  console.log("BulkMMSMessaging - loading:", loading);
  console.log("BulkMMSMessaging - error:", error);

  // Message state
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);

  // Recipient state
  const [selectedRecipients, setSelectedRecipients] = useState<
    RecipientOption[]
  >([]);

  // Send state
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "completed" | "error"
  >("idle");
  const [progress, setProgress] = useState<ProgressState>({
    total: 0,
    sent: 0,
    failed: 0,
  });
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  // Get pre-selected contacts from sessionStorage
  const preselectedContactIds = useMemo(() => {
    if (typeof window === "undefined") return [];

    const stored = sessionStorage.getItem("selectedContactIds");
    if (stored) {
      sessionStorage.removeItem("selectedContactIds"); // Clean up after reading
      return JSON.parse(stored);
    }
    return [];
  }, []);

  // Stepper state - start at step 2 if contacts are pre-selected
  const [currentStep, setCurrentStep] = useState(() => {
    return preselectedContactIds.length > 0 ? 2 : 1;
  });
  const totalSteps = 3;

  // Convert contacts to RecipientOptions
  const allContacts = useMemo<RecipientOption[]>(() => {
    const options: RecipientOption[] = [];

    // Add user's personal contacts
    if (contacts.userContacts) {
      contacts.userContacts.forEach((contact) => {
        options.push({
          value: `user-${contact.id}`,
          label: `${getFullName(contact)} (${contact.phone})`,
          contactId: contact.id,
          firstName: contact.first_name,
          lastName: contact.last_name,
          phone: contact.phone,
          email: contact.email,
          groups: parseGroups(contact.groups),
          ownerType: "user",
          ownerId: contact.owner_id,
        });
      });
    }

    // Add community contacts
    if (contacts.communityContacts) {
      Object.entries(contacts.communityContacts).forEach(
        ([communityId, communityContactsList]) => {
          communityContactsList.forEach((contact) => {
            options.push({
              value: `community-${communityId}-${contact.id}`,
              label: `${getFullName(contact)} (${contact.phone})`,
              contactId: contact.id,
              firstName: contact.first_name,
              lastName: contact.last_name,
              phone: contact.phone,
              email: contact.email,
              groups: parseGroups(contact.groups),
              ownerType: "community",
              ownerId: communityId,
            });
          });
        }
      );
    }

    // Add city contacts
    if (contacts.cityContacts) {
      Object.entries(contacts.cityContacts).forEach(
        ([cityId, cityContactsList]) => {
          cityContactsList.forEach((contact) => {
            options.push({
              value: `city-${cityId}-${contact.id}`,
              label: `${getFullName(contact)} (${contact.phone})`,
              contactId: contact.id,
              firstName: contact.first_name,
              lastName: contact.last_name,
              phone: contact.phone,
              email: contact.email,
              groups: parseGroups(contact.groups),
              ownerType: "city",
              ownerId: cityId,
            });
          });
        }
      );
    }

    return options;
  }, [contacts]);

  // Extract unique groups from all contacts
  const groups = useMemo<RecipientOption[]>(() => {
    const groupSet = new Set<string>();

    allContacts.forEach((contact) => {
      if (contact.groups) {
        contact.groups.forEach((group) => groupSet.add(group));
      }
    });

    return Array.from(groupSet).map((group) => ({
      value: `group-${group}`,
      label: group,
      originalValue: group,
    }));
  }, [allContacts]);

  // Auto-select contacts from URL params
  useEffect(() => {
    if (
      preselectedContactIds.length > 0 &&
      allContacts.length > 0 &&
      selectedRecipients.length === 0
    ) {
      const preselected = allContacts.filter((contact) =>
        preselectedContactIds.includes(contact.contactId || "")
      );

      if (preselected.length > 0) {
        setSelectedRecipients(preselected);
        toast({
          title: "Recipients Selected",
          description: `${preselected.length} contact${
            preselected.length !== 1 ? "s" : ""
          } pre-selected from your contacts`,
        });
      }
    }
  }, [preselectedContactIds, allContacts, selectedRecipients.length]);

  // Calculate recipient count (handles group expansion)
  const recipientCount = useMemo(() => {
    const phoneSet = new Set<string>();

    selectedRecipients.forEach((recipient) => {
      if (recipient.value.startsWith("group-")) {
        // If it's a group, add all contacts from that group
        const groupName = recipient.originalValue || recipient.label;
        allContacts.forEach((contact) => {
          if (contact.groups?.includes(groupName) && contact.phone) {
            phoneSet.add(contact.phone);
          }
        });
      } else if (recipient.phone) {
        // Individual contact
        phoneSet.add(recipient.phone);
      }
    });

    return phoneSet.size;
  }, [selectedRecipients, allContacts]);

  // Handle recipient selection
  const handleRecipientChange = useCallback((recipients: RecipientOption[]) => {
    setSelectedRecipients(recipients);
  }, []);

  // Handle media changes
  const handleMediaAdd = (files: MediaFile[]) => {
    setMedia((prev) => [...prev, ...files]);
  };

  const handleMediaRemove = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle CSV import
  const handleImport = (importedContacts: any[]) => {
    // Convert imported contacts to RecipientOptions
    const newRecipients: RecipientOption[] = importedContacts.map((c, idx) => ({
      value: `imported-${idx}-${c.phone}`,
      label: `${c.name} (${c.phone})`,
      phone: c.phone,
      firstName: c.name,
    }));

    setSelectedRecipients((prev) => [...prev, ...newRecipients]);

    toast({
      title: "Success",
      description: `Imported ${importedContacts.length} contact${
        importedContacts.length !== 1 ? "s" : ""
      }`,
    });
  };

  // Handle send
  const handleSend = async (scheduledTime?: Date) => {
    if (recipientCount === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSendStatus("sending");
    setProgress({
      total: recipientCount,
      sent: 0,
      failed: 0,
    });

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("message", message);
      formData.append("recipients", JSON.stringify(selectedRecipients));

      if (scheduledTime) {
        formData.append("scheduledTime", scheduledTime.toISOString());
      }

      // Add media files
      media.forEach((item, index) => {
        formData.append(`media_${index}`, item.file);
      });

      // Send to API
      const response = await fetch("/api/admin/texting/send", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSendStatus("completed");
        setApiResponse(data);

        toast({
          title: "Success",
          description: scheduledTime
            ? "Messages scheduled successfully"
            : `Sent to ${data.summary?.successful || 0} recipient${
                data.summary?.successful !== 1 ? "s" : ""
              }`,
        });

        // Reset form
        setMessage("");
        setMedia([]);
        setSelectedRecipients([]);
      } else {
        throw new Error(data.error || "Failed to send messages");
      }
    } catch (error: any) {
      console.error("Send error:", error);
      setSendStatus("error");
      setProgress((prev) => ({
        ...prev,
        error: error.message || "Failed to send messages",
      }));

      toast({
        title: "Error",
        description: error.message || "Failed to send messages",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSendStatus("idle");
    setProgress({ total: 0, sent: 0, failed: 0 });
    setApiResponse(null);
    setCurrentStep(1);
    setMessage("");
    setMedia([]);
    setSelectedRecipients([]);
  };

  const canProceedToStep2 = selectedRecipients.length > 0;
  const canProceedToStep3 = message.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 1
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 1
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Select Recipients
              </span>
            </div>

            {/* Divider */}
            <div
              className={`h-[2px] flex-1 ${
                currentStep > 1 ? "bg-primary" : "bg-muted"
              }`}
            />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 2
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 2
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Compose Message
              </span>
            </div>

            {/* Divider */}
            <div
              className={`h-[2px] flex-1 ${
                currentStep > 2 ? "bg-primary" : "bg-muted"
              }`}
            />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 3
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                3
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === 3
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Review & Send
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <RecipientSelector
            selectedRecipients={selectedRecipients}
            onRecipientChange={handleRecipientChange}
            allContacts={allContacts}
            groups={groups}
            user={user!}
            contacts={contacts}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              disabled
            >
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2}
            >
              Next: Compose Message
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <MessageComposer
            message={message}
            onMessageChange={setMessage}
            media={media}
            onMediaAdd={handleMediaAdd}
            onMediaRemove={handleMediaRemove}
            disabled={sendStatus === "sending"}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceedToStep3}
            >
              Next: Review & Send
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <ReviewAndSend
            recipients={selectedRecipients.map((r) => ({
              id: r.contactId || r.value,
              name: r.label,
              phone: r.phone || "",
            }))}
            message={message}
            media={media}
            recipientCount={recipientCount}
            onSend={handleSend}
            sending={sendStatus === "sending"}
            disabled={sendStatus === "sending"}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              disabled={sendStatus === "sending"}
            >
              Back
            </Button>
            <div className="text-sm text-muted-foreground">Ready to send</div>
          </div>
        </div>
      )}

      {/* Progress Tracker */}
      <ProgressTracker
        sendStatus={sendStatus}
        progress={progress}
        onReset={handleReset}
        apiResponse={apiResponse}
      />
    </div>
  );
}
