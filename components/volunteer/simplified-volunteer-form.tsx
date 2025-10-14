"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { supabase } from "@/util/supabase";
import { submitVolunteerSignup } from "@/app/actions/volunteer-signup";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  streetAddress: string;
  addressCity: string;
  addressState: string;
  zipCode: string;
  volunteeringCityId: string;
}

const STEPS = [
  { title: "Personal Info" },
  { title: "Address" },
  { title: "Review" },
];

export function VolunteerSignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    streetAddress: "",
    addressCity: "",
    addressState: "",
    zipCode: "",
    volunteeringCityId: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Load cities from DB
  useEffect(() => {
    const loadCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id,name")
        .order("name", { ascending: true });
      if (!error && data) {
        setCities(data as any);
      }
    };
    loadCities();
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.volunteeringCityId)
        newErrors.volunteeringCityId = "Please select a city";
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Invalid email format";
      if (!formData.contactNumber.trim())
        newErrors.contactNumber = "Contact number is required";
    }

    if (step === 2) {
      if (!formData.streetAddress.trim())
        newErrors.streetAddress = "Street address is required";
      if (!formData.addressCity.trim())
        newErrors.addressCity = "City is required";
      if (!formData.addressState) newErrors.addressState = "State is required";
      if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
      else if (!/^\d{5}$/.test(formData.zipCode))
        newErrors.zipCode = "Zip code must be 5 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Block all form submissions - navigation and final submit must use explicit buttons
  };

  const handleFinalSubmit = async () => {
    // Only called by the Submit button on the final step
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitVolunteerSignup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      contactNumber: formData.contactNumber,
      streetAddress: formData.streetAddress,
      addressCity: formData.addressCity,
      addressState: formData.addressState,
      zipCode: formData.zipCode,
      volunteeringCityId: formData.volunteeringCityId,
    });
    setIsSubmitting(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.message);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      streetAddress: "",
      addressCity: "",
      addressState: "",
      zipCode: "",
      volunteeringCityId: "",
    });
    setErrors({});
    setSubmitError(null);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300 delay-100">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-foreground text-balance">
            Thank You for Signing Up!
          </h3>
          <p className="text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto text-lg">
            We've received your volunteer application and will be in touch soon
            with next steps.
          </p>
        </div>
        <div className="pt-4">
          <Button
            onClick={resetForm}
            variant="outline"
            className="gap-2 bg-transparent hover:text-white"
          >
            Submit Another Application
          </Button>
        </div>
      </div>
    );
  }

  const stepIcons = [
    <User key="user" />,
    <MapPin key="map" />,
    <CheckCircle2 key="check" />,
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          stepIcons={stepIcons}
        />
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // Prevent implicit submit via Enter
            e.preventDefault();
            // Advance to next step (validation first) if not on final step
            if (currentStep < STEPS.length) {
              if (validateStep(currentStep)) {
                setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
              }
            }
            // If on final step, require explicit button click (do nothing)
          }
        }}
        className="space-y-8"
      >
        {/* Step 1: Volunteer City + Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Volunteer City & Personal Information
              </h3>
              <div className="space-y-2">
                <Label
                  htmlFor="volunteeringCityId"
                  className="text-sm font-medium"
                >
                  Select Your City *
                </Label>
                <Select
                  value={formData.volunteeringCityId}
                  onValueChange={(value) =>
                    updateFormData("volunteeringCityId", value)
                  }
                >
                  <SelectTrigger
                    className={`transition-all ${
                      errors.volunteeringCityId
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  >
                    <SelectValue placeholder="Choose a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.length === 0 && (
                      <SelectItem disabled value="loading">
                        Loading...
                      </SelectItem>
                    )}
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.volunteeringCityId && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.volunteeringCityId}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData("firstName", e.target.value)
                    }
                    placeholder="John"
                    className={`transition-all ${
                      errors.firstName
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData("lastName", e.target.value)}
                    placeholder="Doe"
                    className={`transition-all ${
                      errors.lastName
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="john.doe@example.com"
                    className={`transition-all ${
                      errors.email
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contactNumber"
                    className="text-sm font-medium"
                  >
                    Contact Number *
                  </Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      updateFormData("contactNumber", e.target.value)
                    }
                    placeholder="(555) 123-4567"
                    className={`transition-all ${
                      errors.contactNumber
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.contactNumber && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.contactNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Address Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-sm font-medium">
                  Street Address *
                </Label>
                <Input
                  id="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    updateFormData("streetAddress", e.target.value)
                  }
                  placeholder="123 Main Street"
                  className={`transition-all ${
                    errors.streetAddress
                      ? "border-destructive ring-destructive/20 ring-2"
                      : "focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.streetAddress && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" /> {errors.streetAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="addressCity" className="text-sm font-medium">
                    City *
                  </Label>
                  <Input
                    id="addressCity"
                    value={formData.addressCity}
                    onChange={(e) =>
                      updateFormData("addressCity", e.target.value)
                    }
                    placeholder="Salt Lake City"
                    className={`transition-all ${
                      errors.addressCity
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.addressCity && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.addressCity}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressState" className="text-sm font-medium">
                    State *
                  </Label>
                  <Select
                    value={formData.addressState}
                    onValueChange={(value) =>
                      updateFormData("addressState", value)
                    }
                  >
                    <SelectTrigger
                      className={`transition-all ${
                        errors.addressState
                          ? "border-destructive ring-destructive/20 ring-2"
                          : "focus:ring-2 focus:ring-primary/20"
                      }`}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UT">Utah</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="CO">Colorado</SelectItem>
                      <SelectItem value="ID">Idaho</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="WY">Wyoming</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.addressState && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.addressState}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    Zip Code *
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData("zipCode", e.target.value)}
                    placeholder="84101"
                    maxLength={5}
                    className={`transition-all ${
                      errors.zipCode
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                  Review Your Information
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Please review your information before submitting. You can go
                back to make changes if needed.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Name:
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Email:
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Contact Number:
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.contactNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Address & Location
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Address:
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.streetAddress}, {formData.addressCity},{" "}
                      {formData.addressState} {formData.zipCode}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Volunteering For:
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.volunteeringCityId
                        ? cities.find(
                            (c) => c.id === formData.volunteeringCityId
                          )?.name || "Selected City"
                        : "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-5 border border-border">
              <p className="text-sm text-muted-foreground text-center text-pretty leading-relaxed">
                By submitting this form, you agree to be contacted about
                volunteer opportunities.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 h-11 disabled:opacity-50 transition-all hover:bg-muted bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground font-medium">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center text-white gap-2 px-6 h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex text-white items-center gap-2 px-8 h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 " />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
        {submitError && (
          <div className="mt-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {submitError}
          </div>
        )}
      </form>
    </div>
  );
}
