"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  Trash2,
  KeyRound,
  Mail,
  Info,
  Shield,
  Crown,
  Pencil,
  HandHeart,
  Hammer,
  School,
  MessageSquareText,
  MapPin,
  Building2,
  MoreVertical,
  Lock,
  ShieldEllipsis,
  Settings2,
} from "lucide-react";
import { type UserFormData, PERMISSION_OPTIONS } from "@/types/user";
import type { City, Community } from "@/types/admin";
import { toast } from "sonner";
import type { User } from "@/types/user"; // Import User type
// Removed react-input-mask due to React 19 findDOMNode deprecation; using custom formatter instead

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  // Require exactly 10 digits for contact number (stored digits-only)
  contact_number: z
    .string()
    .regex(/^[0-9]{10}$/i, "Contact number must be exactly 10 digits"),
  notes: z.string().optional(),
  city: z.string().optional(),
  communities: z.array(z.string()).optional(),
  permissions: z.object({
    texting: z.boolean().optional(),
    dos_admin: z.boolean().optional(),
    content_development: z.boolean().optional(),
    missionary_volunteer_management: z.boolean().optional(),
    classes_admin: z.boolean().optional(),
    administrator: z.boolean().optional(),
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<{ success: boolean }>;
  onDelete?: (user: User) => void;
  onPasswordReset?: (user: User) => Promise<{ success: boolean }>;
  onResendInvitation?: (user: User) => Promise<{ success: boolean }>;
  initialData?: User | null;
  loading?: boolean;
  allUsers?: User[];
}

const PERMISSION_ICONS = {
  administrator: Crown,
  texting: MessageSquareText,
  dos_admin: Hammer,
  content_development: Pencil,
  missionary_volunteer_management: HandHeart,
  classes_admin: School,
} as const;

export function UserFormDialog({
  open,
  onClose,
  onSubmit,
  onDelete,
  onPasswordReset,
  onResendInvitation,
  initialData,
  loading = false,
  allUsers = [],
}: UserFormDialogProps) {
  const isNewUser = !initialData?.id;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [cities, setCities] = React.useState<City[]>([]);
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("basic");

  // Extract unique notes from all users for suggestions
  const allNoteSuggestions = React.useMemo(() => {
    const notesSet = new Set<string>();
    allUsers.forEach((user) => {
      if (user.notes && user.notes.trim()) {
        // Split by comma to get individual note items
        user.notes.split(",").forEach((note) => {
          const trimmed = note.trim();
          if (trimmed) notesSet.add(trimmed);
        });
      }
    });
    return Array.from(notesSet).sort((a, b) => a.localeCompare(b));
  }, [allUsers]);

  // Fetch cities and communities
  React.useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [citiesRes, communitiesRes] = await Promise.all([
          fetch("/api/admin/cities"),
          fetch("/api/admin/communities"),
        ]);

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData);
        }

        if (communitiesRes.ok) {
          const communitiesData = await communitiesRes.json();
          setCommunities(communitiesData);
        }
      } catch (error) {
        console.error("Error fetching cities/communities:", error);
        toast.error("Failed to load cities and communities");
      } finally {
        setLoadingData(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      // Normalize any existing formatted number to digits-only
      contact_number: initialData?.contact_number
        ? initialData.contact_number.replace(/\D/g, "")
        : "",
      notes: initialData?.notes || "",
      city: initialData?.cities?.[0] || "",
      communities: initialData?.communities || [],
      permissions: {
        texting: initialData?.permissions?.texting || false,
        dos_admin: initialData?.permissions?.dos_admin || false,
        content_development:
          initialData?.permissions?.content_development || false,
        missionary_volunteer_management:
          initialData?.permissions?.missionary_volunteer_management || false,
        classes_admin: initialData?.permissions?.classes_admin || false,
        administrator: initialData?.permissions?.administrator || false,
      },
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          email: initialData.email || "",
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          contact_number: initialData.contact_number
            ? initialData.contact_number.replace(/\D/g, "")
            : "",
          notes: initialData.notes || "",
          city: initialData.cities?.[0] || "",
          communities: initialData.communities || [],
          permissions: {
            texting: initialData.permissions?.texting || false,
            dos_admin: initialData.permissions?.dos_admin || false,
            content_development:
              initialData.permissions?.content_development || false,
            missionary_volunteer_management:
              initialData.permissions?.missionary_volunteer_management || false,
            classes_admin: initialData.permissions?.classes_admin || false,
            administrator: initialData.permissions?.administrator || false,
          },
        });
      } else {
        // Reset to blank form for new user
        form.reset({
          email: "",
          first_name: "",
          last_name: "",
          contact_number: "",
          notes: "",
          city: "",
          communities: [],
          permissions: {
            texting: false,
            dos_admin: false,
            content_development: false,
            missionary_volunteer_management: false,
            classes_admin: false,
            administrator: false,
          },
        });
      }
    }
  }, [initialData, open, form]);

  // Watch for administrator permission changes
  const isAdministrator = form.watch("permissions.administrator");
  React.useEffect(() => {
    // Clear city and communities when user becomes global admin
    if (isAdministrator) {
      form.setValue("city", "");
      form.setValue("communities", []);
    }
  }, [isAdministrator, form]);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Get city details for the selected city
      const selectedCity =
        values.city && values.city !== ""
          ? cities.find((city) => city.id === values.city)
          : undefined;
      const selectedCities = selectedCity ? [selectedCity] : [];

      // Values.contact_number already digits-only; ensure max 10 digits
      const cleanedContactNumber = values.contact_number
        ? values.contact_number.slice(0, 10)
        : undefined;

      const formData: UserFormData = {
        ...values,
        id: initialData?.id,
        cities: selectedCities,
        communities: values.communities || [],
        contact_number: cleanedContactNumber, // overwrite with cleaned digits-only value
      };

      const result = await onSubmit(formData);
      if (result.success) {
        toast.success(isNewUser ? "User created" : "User updated");
        onClose();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!initialData || !onPasswordReset) return;
    const result = await onPasswordReset(initialData);
    if (result.success) {
      toast.success("Password reset sent");
    }
  };

  const handleResendInvite = async () => {
    if (!initialData || !onResendInvitation) return;
    const result = await onResendInvitation(initialData);
    if (result.success) {
      toast.success("Invitation sent");
    }
  };

  const handleSelectAllPermissions = () => {
    const allPermissions = PERMISSION_OPTIONS.reduce((acc, option) => {
      acc[option.value] = true;
      return acc;
    }, {} as Record<string, boolean>);

    form.setValue("permissions", allPermissions as any);
    toast.success(
      "All permissions granted, including Global Administrator access."
    );
  };

  const selectedPermissions = PERMISSION_OPTIONS.filter((option) =>
    form.watch(`permissions.${option.value}`)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isNewUser ? "Add New User" : "Edit User"}
              </DialogTitle>
              <DialogDescription>
                {isNewUser
                  ? "Create a new user account"
                  : `Manage ${initialData?.first_name}'s account`}
              </DialogDescription>
            </div>
            {!isNewUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || isSubmitting}
                    className="ml-auto hover:text-white"
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white">
                  {onPasswordReset && (
                    <DropdownMenuItem
                      onClick={handlePasswordReset}
                      className="focus:text-white"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </DropdownMenuItem>
                  )}
                  {onResendInvitation && (
                    <DropdownMenuItem
                      onClick={handleResendInvite}
                      className="focus:text-white"
                      disabled
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Invitation
                    </DropdownMenuItem>
                  )}
                  {(onPasswordReset || onResendInvitation) && onDelete && (
                    <DropdownMenuSeparator />
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => initialData && onDelete(initialData)}
                      className="text-destructive focus:text-white"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="basic"
                  className="gap-2 hover:text-primary hover:font-semibold"
                >
                  <Lock className="h-4 w-4 " />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="access"
                  className="gap-2 hover:text-primary hover:font-semibold"
                >
                  <MapPin className="h-4 w-4" />
                  Access
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className="gap-2 hover:text-primary hover:font-semibold"
                >
                  <Shield className="h-4 w-4" />
                  Permissions
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="basic" className="space-y-4 mt-0">
                  {!isNewUser && initialData?.last_sign_in_at && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Last login:{" "}
                        {new Date(initialData.last_sign_in_at).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user@example.com"
                            {...field}
                            disabled={!isNewUser}
                          />
                        </FormControl>
                        {!isNewUser && (
                          <FormDescription>
                            Email cannot be changed after creation
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contact_number"
                    render={({ field }) => {
                      // Format digits-only value for display with mask
                      const formatPhone = (raw: string) => {
                        const digits = raw.replace(/\D/g, "").slice(0, 10);
                        if (digits.length === 10) {
                          return `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 6) {
                          return `${digits.slice(0, 3)}-${digits.slice(
                            3,
                            6
                          )}-${digits.slice(6)}`;
                        } else if (digits.length > 3) {
                          return `${digits.slice(0, 3)}-${digits.slice(3)}`;
                        }
                        return digits;
                      };

                      const handleChange = (
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const digits = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        field.onChange(digits);
                      };

                      return (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="555-123-4567"
                              value={formatPhone(field.value || "")}
                              onChange={handleChange}
                              onBlur={field.onBlur}
                              inputMode="tel"
                              autoComplete="tel"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Enter 10-digit phone number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => {
                      const currentValue = field.value || "";

                      // Get the text after the last comma (or full text if no comma)
                      const lastCommaIndex = currentValue.lastIndexOf(",");
                      const searchText =
                        lastCommaIndex >= 0
                          ? currentValue
                              .substring(lastCommaIndex + 1)
                              .trim()
                              .toLowerCase()
                          : currentValue.trim().toLowerCase();

                      // Filter suggestions based on current search text (starts with)
                      const filteredSuggestions =
                        searchText.length > 0
                          ? allNoteSuggestions.filter((note) =>
                              note.toLowerCase().startsWith(searchText)
                            )
                          : [];

                      const handleSelectSuggestion = (suggestion: string) => {
                        let newValue: string;
                        if (lastCommaIndex >= 0) {
                          // Replace text after last comma with suggestion
                          newValue =
                            currentValue.substring(0, lastCommaIndex + 1) +
                            " " +
                            suggestion;
                        } else {
                          // Replace entire value with suggestion
                          newValue = suggestion;
                        }
                        field.onChange(newValue);
                      };

                      return (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <textarea
                              placeholder="Add any additional notes about this user..."
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          {filteredSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {filteredSuggestions
                                .slice(0, 8)
                                .map((suggestion) => (
                                  <Button
                                    key={suggestion}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs hover:text-white"
                                    onClick={() =>
                                      handleSelectSuggestion(suggestion)
                                    }
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                            </div>
                          )}
                          <FormDescription>
                            Optional notes for internal reference
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </TabsContent>

                <TabsContent value="access" className="space-y-4 mt-0">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Access Scope</h3>
                    <p className="text-sm text-muted-foreground">
                      {form.watch("permissions.administrator")
                        ? "Global Administrators have access to all cities and communities"
                        : "Select which cities and communities this user can manage"}
                    </p>
                  </div>

                  {!form.watch("permissions.administrator") ? (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <div className="flex gap-2">
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || ""}
                                disabled={
                                  loadingData || loading || isSubmitting
                                }
                              >
                                <FormControl>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="No city selected (click to select)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id}>
                                      {city.name}, {city.state}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {field.value && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => field.onChange("")}
                                  disabled={
                                    loadingData || loading || isSubmitting
                                  }
                                  title="Clear city selection"
                                >
                                  ✕
                                </Button>
                              )}
                            </div>
                            <FormDescription className="text-primary">
                              The city this user can manage (optional)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <hr className="my-2" />

                      <FormField
                        control={form.control}
                        name="communities"
                        render={({ field }) => {
                          const selectedCity = form.watch("city");
                          const filteredCommunities = selectedCity
                            ? communities.filter(
                                (community) =>
                                  community.city_id === selectedCity
                              )
                            : communities;

                          const communityOptions = filteredCommunities
                            .map((community) => {
                              const city = cities.find(
                                (c) => c.id === community.city_id
                              );
                              return {
                                label: community.name,
                                value: community.id,
                                group: city
                                  ? `${city.name}, ${city.state}`
                                  : undefined,
                              };
                            })
                            .sort((a, b) => {
                              // Sort by city (group) first, then by community name
                              const groupA = a.group || "";
                              const groupB = b.group || "";
                              if (groupA !== groupB) {
                                return groupA.localeCompare(groupB);
                              }
                              return a.label.localeCompare(b.label);
                            });

                          return (
                            <FormItem>
                              <FormLabel>Communities</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={communityOptions}
                                  selected={field.value || []}
                                  onChange={field.onChange}
                                  placeholder="Select communities..."
                                  emptyMessage={
                                    selectedCity
                                      ? "No communities in selected city."
                                      : "No communities available."
                                  }
                                  disabled={
                                    loadingData || loading || isSubmitting
                                  }
                                />
                              </FormControl>
                              <FormDescription className="text-primary">
                                Communities this user can manage
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  ) : (
                    <Alert>
                      <Building2 className="h-4 w-4" />
                      <AlertDescription>
                        As a Global Administrator, this user has unrestricted
                        access to all cities and communities.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">
                        Feature Permissions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Grant access to specific features
                      </p>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="permissions.administrator"
                    render={({ field }) => {
                      const Icon = PERMISSION_ICONS.administrator;
                      const option = PERMISSION_OPTIONS.find(
                        (opt) => opt.value === "administrator"
                      );

                      const handleToggle = () => {
                        const newValue = !field.value;
                        field.onChange(newValue);

                        if (newValue) {
                          PERMISSION_OPTIONS.filter(
                            (opt) => opt.value !== "administrator"
                          ).forEach((opt) => {
                            form.setValue(`permissions.${opt.value}`, false);
                          });
                        }
                      };

                      return (
                        <div
                          className={`relative rounded-lg border-2 p-4 transition-all cursor-pointer ${
                            field.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          }`}
                          onClick={handleToggle}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`rounded-md p-2 ${
                                field.value
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <FormLabel className="text-base font-semibold cursor-pointer">
                                  {option?.label}
                                </FormLabel>
                                {field.value && (
                                  <Badge variant="default">Active</Badge>
                                )}
                              </div>
                              {option?.description && (
                                <FormDescription className="text-sm">
                                  {option.description}
                                </FormDescription>
                              )}
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="mt-1"
                                />
                              </FormControl>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />

                  {!form.watch("permissions.administrator") && (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Feature Permissions
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PERMISSION_OPTIONS.filter(
                          (opt) => opt.value !== "administrator"
                        ).map((option) => {
                          const Icon =
                            PERMISSION_ICONS[
                              option.value as keyof typeof PERMISSION_ICONS
                            ];
                          return (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name={`permissions.${option.value}`}
                              render={({ field }) => {
                                const handleToggle = () => {
                                  field.onChange(!field.value);
                                };

                                return (
                                  <div
                                    className={`relative rounded-lg border p-3 transition-all cursor-pointer ${
                                      field.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50 hover:bg-accent/50"
                                    }`}
                                    onClick={handleToggle}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`rounded-md p-1.5 ${
                                          field.value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}
                                      >
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <FormLabel className="text-sm font-medium cursor-pointer leading-tight">
                                          {option.label}
                                        </FormLabel>
                                        {option.description && (
                                          <FormDescription className="text-xs mt-0.5 line-clamp-2">
                                            {option.description}
                                          </FormDescription>
                                        )}
                                      </div>
                                      <div onClick={(e) => e.stopPropagation()}>
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="mt-0.5"
                                          />
                                        </FormControl>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            />
                          );
                        })}
                      </div>
                    </>
                  )}
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading || isSubmitting}
                className="hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isNewUser ? "Create User" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
