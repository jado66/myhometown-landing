"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

interface GroupedRecipients {
  groupName: string;
  contacts: RecipientContact[];
  totalContacts: number;
}

interface RecipientContact extends RecipientOption {
  sourceGroup: string;
  sourceType: "group" | "individual";
  occurrenceIndex: number;
  isDuplicate: boolean;
}

interface RecipientsListProps {
  selectedRecipients: RecipientOption[];
  contacts: RecipientOption[];
  onSectionChange?: (
    selectedSections: Map<number, number>,
    filteredRecipients: RecipientContact[]
  ) => void;
}

const SECTION_SIZE = 80;
const DISPLAY_LIMIT = 8;

const isGroupRecipient = (recipient: RecipientOption): boolean =>
  recipient?.value?.startsWith("group:");

const getGroupMembers = (
  groupName: string,
  allContacts: RecipientOption[]
): RecipientContact[] => {
  return allContacts
    .filter(
      (contact) =>
        contact.groups &&
        Array.isArray(contact.groups) &&
        contact.groups.includes(groupName)
    )
    .map(contact => ({
      ...contact,
      sourceGroup: groupName,
      sourceType: "group" as const,
      occurrenceIndex: 0,
      isDuplicate: false,
    }));
};

export function RecipientsList({
  selectedRecipients,
  contacts,
  onSectionChange,
}: RecipientsListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  const [selectedSections, setSelectedSections] = useState<Map<number, number>>(
    new Map()
  );

  const toggleGroupExpansion = (groupIndex: number) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupIndex)) {
      newExpandedGroups.delete(groupIndex);
    } else {
      newExpandedGroups.add(groupIndex);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const handleSectionSelect = (groupIndex: number, sectionNumber: number) => {
    const newSelectedSections = new Map(selectedSections);
    newSelectedSections.set(groupIndex, sectionNumber);
    setSelectedSections(newSelectedSections);
  };

  const processRecipients = (): {
    groupRecipients: GroupedRecipients[];
    individualRecipients: GroupedRecipients[];
  } => {
    if (!Array.isArray(selectedRecipients)) {
      return { groupRecipients: [], individualRecipients: [] };
    }

    const phoneNumberTracker = new Map<string, number>();

    // Process group recipients
    const groupRecipients = selectedRecipients
      .filter(isGroupRecipient)
      .map((recipient) => {
        if (!recipient.value || !recipient.originalValue) return null;

        const groupName = recipient.originalValue;
        const groupContacts = getGroupMembers(groupName, contacts);

        const processedContacts: RecipientContact[] = groupContacts.map((contact) => {
          const phone = contact.value;
          if (!phoneNumberTracker.has(phone)) {
            phoneNumberTracker.set(phone, 0);
          }

          const occurrenceIndex = phoneNumberTracker.get(phone)!;
          phoneNumberTracker.set(phone, occurrenceIndex + 1);

          return {
            ...contact,
            sourceGroup: groupName,
            sourceType: "group" as const,
            occurrenceIndex,
            isDuplicate: occurrenceIndex > 0,
          };
        });

        return {
          groupName,
          contacts: processedContacts,
          totalContacts: processedContacts.length,
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);

    // Process individual recipients
    const individualRecipients = selectedRecipients
      .filter((r) => r?.value && !isGroupRecipient(r))
      .map((recipient) => {
        const phone = recipient.value;
        if (!phoneNumberTracker.has(phone)) {
          phoneNumberTracker.set(phone, 0);
        }

        const occurrenceIndex = phoneNumberTracker.get(phone)!;
        phoneNumberTracker.set(phone, occurrenceIndex + 1);

        return {
          ...recipient,
          sourceGroup: "Individual Contacts",
          sourceType: "individual" as const,
          occurrenceIndex,
          isDuplicate: occurrenceIndex > 0,
        };
      });

    return {
      groupRecipients,
      individualRecipients:
        individualRecipients.length > 0
          ? [
              {
                groupName: "Individual Contacts",
                contacts: individualRecipients,
                totalContacts: individualRecipients.length,
              },
            ]
          : [],
    };
  };

  const { groupRecipients, individualRecipients } = processRecipients();
  const allRecipients = [...groupRecipients, ...individualRecipients];

  // Calculate total recipients considering sections
  const getTotalRecipientsCount = (): number => {
    return allRecipients.reduce((total, group, index) => {
      const selectedSection = selectedSections.get(index) || 1;
      const sectionStartIndex = (selectedSection - 1) * SECTION_SIZE;
      const sectionEndIndex = sectionStartIndex + SECTION_SIZE;
      const sectionContacts = group.contacts.slice(
        sectionStartIndex,
        sectionEndIndex
      );
      return total + sectionContacts.length;
    }, 0);
  };

  const getFilteredRecipientsForSending = (): RecipientContact[] => {
    return allRecipients.flatMap((group, groupIndex) => {
      const selectedSection = selectedSections.get(groupIndex) || 1;
      const sectionStartIndex = (selectedSection - 1) * SECTION_SIZE;
      const sectionEndIndex = sectionStartIndex + SECTION_SIZE;
      return group.contacts.slice(sectionStartIndex, sectionEndIndex);
    });
  };

  // Notify parent of filtered recipients whenever sections change
  useEffect(() => {
    if (onSectionChange) {
      const filteredRecipients = getFilteredRecipientsForSending();
      onSectionChange(selectedSections, filteredRecipients);
    }
  }, [selectedSections, selectedRecipients, contacts]);

  const totalRecipients = getTotalRecipientsCount();
  const hasLargeGroups = allRecipients.some(
    (group) => group.totalContacts > SECTION_SIZE
  );

  const renderContactItem = (contact: RecipientContact, index: number) => (
    <div
      key={`${contact.value}-${index}`}
      className={cn(
        "py-2 px-3 hover:bg-muted/50 rounded-md transition-colors",
        contact.isDuplicate && "opacity-60"
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm",
            contact.isDuplicate && "line-through text-muted-foreground"
          )}
        >
          {contact.label}
        </span>
        {contact.isDuplicate && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Duplicate
          </Badge>
        )}
      </div>
    </div>
  );

  const renderSectionButtons = (groupIndex: number, totalContacts: number) => {
    const numSections = Math.ceil(totalContacts / SECTION_SIZE);
    const selectedSection = selectedSections.get(groupIndex) || 1;

    if (numSections <= 1) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: numSections }, (_, i) => {
          const sectionNumber = i + 1;
          const startIndex = i * SECTION_SIZE;
          const endIndex = Math.min(startIndex + SECTION_SIZE, totalContacts);
          const contactCount = endIndex - startIndex;

          return (
            <Button
              key={sectionNumber}
              variant={selectedSection === sectionNumber ? "default" : "outline"}
              size="sm"
              onClick={() => handleSectionSelect(groupIndex, sectionNumber)}
            >
              Section {sectionNumber} ({contactCount})
            </Button>
          );
        })}
      </div>
    );
  };

  const renderContactList = (
    contacts: RecipientContact[],
    groupIndex: number
  ) => {
    const selectedSection = selectedSections.get(groupIndex) || 1;
    const sectionStartIndex = (selectedSection - 1) * SECTION_SIZE;
    const sectionEndIndex = sectionStartIndex + SECTION_SIZE;
    const sectionContacts = contacts.slice(sectionStartIndex, sectionEndIndex);

    const isExpanded = expandedGroups.has(groupIndex);
    const initialContacts = sectionContacts.slice(0, DISPLAY_LIMIT);
    const remainingContacts = sectionContacts.slice(DISPLAY_LIMIT);
    const shouldShowExpand = sectionContacts.length > DISPLAY_LIMIT;

    return (
      <div className="space-y-1">
        {initialContacts.map((contact, index) => renderContactItem(contact, index))}

        {shouldShowExpand && (
          <Collapsible open={isExpanded} onOpenChange={() => toggleGroupExpansion(groupIndex)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-primary hover:text-primary/80"
              >
                {isExpanded ? (
                  <>
                    Show less
                    <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show {remainingContacts.length} more...
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {remainingContacts.map((contact, index) =>
                renderContactItem(contact, index + DISPLAY_LIMIT)
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  };

  if (allRecipients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No recipients selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasLargeGroups && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold">Large Group Detected</p>
            <p className="text-sm mt-1">
              Some groups have more than {SECTION_SIZE} recipients. Use the
              section buttons below to send to smaller batches for better
              delivery success.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
        {allRecipients.map((group, index) => (
          <div key={`group-${index}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">
                {group.groupName}{" "}
                <span className="text-muted-foreground">
                  ({group.totalContacts} total)
                </span>
              </h3>
            </div>

            {renderSectionButtons(index, group.totalContacts)}
            {renderContactList(group.contacts, index)}

            {index < allRecipients.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-sm text-muted-foreground">
          Total recipients for sending: <strong>{totalRecipients}</strong>
        </p>
      </div>
    </div>
  );
}
