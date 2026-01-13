"use client";

import { Users, Phone, Mail, MapPin, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
}

interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Community {
  id: string;
  name: string;
  city?: string;
}

interface GroupInfo {
  type: "contacts" | "users" | "communities";
  name: string;
  count: number;
  members?: Contact[] | User[] | Community[];
}

interface GroupInfoPopoverProps {
  group: GroupInfo;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return "N/A";
  const cleaned = phone.replace(/^\+1/, "").replace(/^\+/, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const getGroupIcon = (type: string) => {
  switch (type) {
    case "contacts":
      return <Users className="h-4 w-4" />;
    case "users":
      return <Users className="h-4 w-4" />;
    case "communities":
      return <MapPin className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getGroupColor = (type: string): string => {
  switch (type) {
    case "contacts":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "users":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "communities":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

const renderContactMember = (contact: Contact, index: number) => (
  <div key={index} className="space-y-1">
    <p className="font-medium text-sm">{contact.name}</p>
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {contact.phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span className="font-mono">{formatPhoneNumber(contact.phone)}</span>
        </div>
      )}
      {contact.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span>{contact.email}</span>
        </div>
      )}
      {contact.city && (
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          <span>{contact.city}</span>
        </div>
      )}
    </div>
  </div>
);

const renderUserMember = (user: User, index: number) => (
  <div key={index} className="space-y-1">
    <p className="font-medium text-sm">{user.name}</p>
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {user.phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span className="font-mono">{formatPhoneNumber(user.phone)}</span>
        </div>
      )}
      {user.email && (
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span>{user.email}</span>
        </div>
      )}
    </div>
  </div>
);

const renderCommunityMember = (community: Community, index: number) => (
  <div key={index} className="space-y-1">
    <p className="font-medium text-sm">{community.name}</p>
    {community.city && (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span>{community.city}</span>
      </div>
    )}
  </div>
);

export function GroupInfoPopover({
  group,
  variant = "outline",
  size = "sm",
  className,
}: GroupInfoPopoverProps) {
  const members = group.members || [];
  const displayLimit = 10;
  const hasMore = members.length > displayLimit;
  const displayMembers = members.slice(0, displayLimit);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
        >
          {getGroupIcon(group.type)}
          <span>{group.name}</span>
          <Badge variant="secondary" className="ml-1">
            {group.count}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[500px] overflow-y-auto" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-md", getGroupColor(group.type))}>
                {getGroupIcon(group.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{group.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {group.count} member{group.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Members List */}
          {displayMembers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Members
                </p>
                <div className="space-y-3">
                  {displayMembers.map((member: any, index: number) => {
                    if (group.type === "contacts") {
                      return renderContactMember(member as Contact, index);
                    }
                    if (group.type === "users") {
                      return renderUserMember(member as User, index);
                    }
                    if (group.type === "communities") {
                      return renderCommunityMember(member as Community, index);
                    }
                    return null;
                  })}
                </div>
                {hasMore && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    + {members.length - displayLimit} more member
                    {members.length - displayLimit !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {displayMembers.length === 0 && (
            <>
              <Separator />
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No members found</p>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
