"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type {
  ContactDialogProps,
  ContactFormData,
  OwnerType,
} from "@/types/contacts";
import { validateContact } from "@/lib/contacts-utils";

export function ContactDialog({
  open,
  onClose,
  onSave,
  contact = null,
  userId,
  userCommunities = [],
  userCities = [],
  groupsByOwner,
  user,
  title = "Add Contact",
  formError = null,
}: ContactDialogProps) {
  const initialFormState: ContactFormData = {
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    owner_type: "user",
    owner_id: userId,
    groups: [],
  };

  const [formData, setFormData] = useState<ContactFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [newGroupInput, setNewGroupInput] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Update form when contact or dialog open state changes
  useEffect(() => {
    if (open) {
      if (contact) {
        setFormData({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          middle_name: contact.middle_name || "",
          email: contact.email || "",
          phone: contact.phone,
          owner_type: contact.owner_type,
          owner_id: contact.owner_id,
          groups: Array.isArray(contact.groups) ? contact.groups : [],
        });
        updateAvailableGroups(contact.owner_type, contact.owner_id);
      } else {
        setFormData(initialFormState);
        updateAvailableGroups("user", userId);
      }
      setErrors({});
      setNewGroupInput("");
      setHasChanges(false);
    }
  }, [open, contact, userId]);

  // Update available groups when owner changes
  useEffect(() => {
    if (open) {
      updateAvailableGroups(formData.owner_type, formData.owner_id);
    }
  }, [formData.owner_type, formData.owner_id, groupsByOwner, open]);

  const updateAvailableGroups = (ownerType: OwnerType, ownerId: string) => {
    let groups: string[] = [];

    if (ownerType === "user") {
      groups = groupsByOwner.user || [];
    } else if (ownerType === "community") {
      groups = groupsByOwner.communities?.[ownerId] || [];
    } else if (ownerType === "city") {
      groups = groupsByOwner.cities?.[ownerId] || [];
    }

    setAvailableGroups(groups);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Real-time validation
    if (value.trim()) {
      const tempData = { ...formData, [field]: value };
      const validation = validateContact(tempData);
      
      if (validation.errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: validation.errors[field] }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } else if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleOwnerTypeChange = (value: OwnerType) => {
    let defaultOwnerId = userId;

    if (value === "community" && userCommunities.length > 0) {
      defaultOwnerId = userCommunities[0].id;
    } else if (value === "city" && userCities.length > 0) {
      defaultOwnerId = userCities[0].id;
    }

    setFormData((prev) => ({
      ...prev,
      owner_type: value,
      owner_id: defaultOwnerId,
      groups: [], // Reset groups when owner changes
    }));
    setHasChanges(true);
  };

  const handleOwnerIdChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      owner_id: value,
      groups: [], // Reset groups when owner ID changes
    }));
    setHasChanges(true);
  };

  const handleAddGroup = (group: string) => {
    const trimmedGroup = group.trim();
    if (!trimmedGroup) return;

    if (!formData.groups.includes(trimmedGroup)) {
      setFormData((prev) => ({
        ...prev,
        groups: [...prev.groups, trimmedGroup],
      }));
      setHasChanges(true);
    }
    setNewGroupInput("");
  };

  const handleRemoveGroup = (groupToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g !== groupToRemove),
    }));
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Are you sure you want to close?")) {
        return;
      }
    }
    onClose();
  };

  const handleSave = () => {
    const validation = validateContact(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(formData);
  };

  const getOwnerDisplayName = () => {
    if (formData.owner_type === "user") {
      return user.isAdmin ? "Personal Contacts" : "Unassigned Contacts";
    } else if (formData.owner_type === "community") {
      const community = userCommunities.find((c) => c.id === formData.owner_id);
      return community ? `${community.name} Community` : "Community";
    } else if (formData.owner_type === "city") {
      const city = userCities.find((c) => c.id === formData.owner_id);
      return city ? `${city.name} City` : "City";
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {contact ? "Update contact information" : "Add a new contact to your directory"}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          {/* Name fields */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className={errors.first_name ? "border-red-500" : ""}
                autoFocus
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Middle Name</Label>
              <Input
                id="middle_name"
                value={formData.middle_name}
                onChange={(e) => handleChange("middle_name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Contact information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
                placeholder="(123) 456-7890"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
                placeholder="contact@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Owner selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner_type">Owner Type</Label>
              <Select
                value={formData.owner_type}
                onValueChange={handleOwnerTypeChange}
              >
                <SelectTrigger id="owner_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {user.isAdmin ? "Personal" : "Unassigned"}
                  </SelectItem>
                  {userCommunities.length > 0 && (
                    <SelectItem value="community">Community</SelectItem>
                  )}
                  {userCities.length > 0 && (
                    <SelectItem value="city">City</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {formData.owner_type !== "user" && (
              <div className="space-y-2">
                <Label htmlFor="owner_id">Owner</Label>
                <Select
                  value={formData.owner_id}
                  onValueChange={handleOwnerIdChange}
                >
                  <SelectTrigger id="owner_id">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.owner_type === "community" &&
                      userCommunities.map((community) => (
                        <SelectItem key={community.id} value={community.id}>
                          {community.name} Community
                        </SelectItem>
                      ))}
                    {formData.owner_type === "city" &&
                      userCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name} City
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Groups selection */}
          <div className="space-y-2">
            <Label htmlFor="groups">Groups for {getOwnerDisplayName()}</Label>
            <div className="flex gap-2">
              <Select onValueChange={handleAddGroup} value="">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select existing group" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups
                    .filter((g) => !formData.groups.includes(g))
                    .map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  {availableGroups.filter((g) => !formData.groups.includes(g))
                    .length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No available groups
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Input
                id="new-group"
                placeholder="Create new group"
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGroup(newGroupInput);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleAddGroup(newGroupInput)}
              >
                Add
              </Button>
            </div>

            {formData.groups.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.groups.map((group) => (
                  <Badge key={group} variant="secondary">
                    {group}
                    <button
                      type="button"
                      onClick={() => handleRemoveGroup(group)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
