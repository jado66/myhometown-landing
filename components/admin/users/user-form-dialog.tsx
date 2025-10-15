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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { type User, type UserFormData, PERMISSION_OPTIONS } from "@/types/user";
import { toast } from "sonner";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  contact_number: z.string().optional(),
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
}: UserFormDialogProps) {
  const isNewUser = !initialData?.id;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: initialData?.email || "",
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      contact_number: initialData?.contact_number || "",
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
    if (open && initialData) {
      form.reset({
        email: initialData.email || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        contact_number: initialData.contact_number || "",
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
    }
  }, [initialData]);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      const formData: UserFormData = {
        ...values,
        id: initialData?.id,
        cities: initialData?.cities_details || [],
        communities: initialData?.communities || [],
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
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewUser ? "Add New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isNewUser
              ? "Create a new user account with permissions and access."
              : "Update user information, permissions, and access."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <FormLabel className="text-base">Permissions</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Grant access to specific features and areas
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPermissions}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Grant All
                </Button>
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

                    // If enabling global admin, clear all other permissions
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
                        or
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
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                {!isNewUser && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => initialData && onDelete(initialData)}
                    disabled={loading || isSubmitting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                {!isNewUser && onPasswordReset && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePasswordReset}
                    disabled={loading || isSubmitting}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </Button>
                )}
                {!isNewUser && onResendInvitation && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendInvite}
                    disabled={loading || isSubmitting}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Invite
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isNewUser ? "Create User" : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
