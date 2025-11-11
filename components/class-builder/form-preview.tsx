"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { FormField } from "@/types/classes";

type FormPreviewProps = {
  fields: FormField[];
};

const MOCK_DATA: Record<string, string> = {
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com",
  phone: "(555) 123-4567",
  addressLine1: "123 Main Street",
  addressLine2: "Apt 4B",
  city: "San Francisco",
  state: "California",
  zipCode: "94102",
  country: "United States",
  middleName: "Michael",
  emergencyContactName: "Jane Smith",
  emergencyContactPhone: "(555) 987-6543",
  education: "Bachelor's Degree in Computer Science",
  occupation: "Software Engineer",
  company: "Tech Solutions Inc.",
  languages: "English, Spanish",
  additionalCourses: "Advanced Web Development, Machine Learning",
  referral: "I found you through a Google search",
  accessibilityNeeds: "None",
  specialRequirements: "I prefer morning classes",
  goals: "I want to improve my programming skills and learn new frameworks",
  guardianFirstName: "Robert",
  guardianLastName: "Smith",
  guardianEmail: "robert.smith@example.com",
  guardianPhone: "(555) 456-7890",
  miscTextField1: "Sample text",
  miscTextField2: "Additional information",
  miscTextArea1: "This is a longer text area with multiple lines of content",
  miscTextArea2: "More detailed information goes here",
};

export function FormPreview({ fields }: FormPreviewProps) {
  const renderField = (field: FormField) => {
    const mockValue = MOCK_DATA[field.id] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              type={field.type}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              defaultValue={mockValue}
            />
          </div>
        );

      case "address":
        return (
          <div key={field.id} className="space-y-4">
            <Label className="text-base font-semibold">
              Address
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <div className="space-y-3 pl-2">
              <div className="space-y-2">
                <Label className="text-sm">Address Line 1</Label>
                <Input
                  defaultValue={MOCK_DATA.addressLine1}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Address Line 2</Label>
                <Input
                  defaultValue={MOCK_DATA.addressLine2}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">City</Label>
                  <Input defaultValue={MOCK_DATA.city} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">State/Province</Label>
                  <Input defaultValue={MOCK_DATA.state} placeholder="State" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">ZIP/Postal Code</Label>
                  <Input
                    defaultValue={MOCK_DATA.zipCode}
                    placeholder="ZIP code"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Country</Label>
                  <Input
                    defaultValue={MOCK_DATA.country}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Textarea
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={4}
              defaultValue={mockValue}
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select defaultValue={field.options?.[0]}>
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox id={field.id} defaultChecked />
            <Label htmlFor={field.id} className="font-normal">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
          </div>
        );

      case "header":
        return (
          <h3 key={field.id} className="text-xl font-semibold mt-6 mb-2">
            {field.content || field.label}
          </h3>
        );

      case "staticText":
        return (
          <p key={field.id} className="text-sm text-muted-foreground">
            {field.content || field.label}
          </p>
        );

      case "divider":
        return <Separator key={field.id} className="my-6" />;

      case "bannerImage":
        return field.url ? (
          <div
            key={field.id}
            className="w-full aspect-video bg-muted rounded-lg overflow-hidden mb-6"
          >
            <img
              src={field.url || "/placeholder.svg"}
              alt={field.label}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            key={field.id}
            className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center mb-6"
          >
            <p className="text-sm text-muted-foreground">
              Banner image placeholder
            </p>
          </div>
        );

      case "externalLink":
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            {field.url ? (
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href={field.url} target="_blank" rel="noopener noreferrer">
                  View Link
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">No link provided</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              placeholder={`${field.type} field (custom type)`}
              defaultValue={mockValue}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background border rounded-lg">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Class Signup Form</h2>
        {fields.length === 0 ? (
          <p className="text-muted-foreground">
            No fields added yet. Add fields to see them here.
          </p>
        ) : (
          fields.map(renderField)
        )}
        {fields.length > 0 && (
          <Button className="w-full mt-6" size="lg">
            Submit Registration
          </Button>
        )}
      </div>
    </div>
  );
}
