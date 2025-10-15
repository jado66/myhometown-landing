"use client";

import type React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
  Calendar,
  Shield,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { Stepper } from "@/components/ui/stepper";

interface FormData {
  // Step 1: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  // Step 2: Availability & Interests
  daysAvailable: string[];
  timePreference: string;
  hoursPerWeek: string;
  interests: string[];
  skills: string;
  languages: string;

  // Step 3: Background & References
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  previousVolunteerExperience: string;
  hearAboutUs: string;
  backgroundCheckConsent: boolean;
  references: string;

  // Step 4: Additional
  motivation: string;
  specialAccommodations: string;
}

// Titles will be translated at render time
const STEPS = [
  { title: "steps.personalInfo" },
  { title: "steps.availability" },
  { title: "steps.background" },
  { title: "steps.review" },
];

export function VolunteerForm() {
  const t = useTranslations("volunteerForm");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    daysAvailable: [],
    timePreference: "",
    hoursPerWeek: "",
    interests: [],
    skills: "",
    languages: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    previousVolunteerExperience: "",
    hearAboutUs: "",
    backgroundCheckConsent: false,
    references: "",
    motivation: "",
    specialAccommodations: "",
  });

  const updateFormData = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleArrayValue = (field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = t("errors.firstNameRequired");
      if (!formData.lastName.trim())
        newErrors.lastName = t("errors.lastNameRequired");
      if (!formData.email.trim()) newErrors.email = t("errors.emailRequired");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = t("errors.emailInvalid");
      if (!formData.phone.trim()) newErrors.phone = t("errors.phoneRequired");
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = t("errors.dateOfBirthRequired");
      if (!formData.streetAddress.trim())
        newErrors.streetAddress = t("errors.streetRequired");
      if (!formData.city.trim()) newErrors.city = t("errors.cityRequired");
      if (!formData.state) newErrors.state = t("errors.stateRequired");
      if (!formData.zipCode.trim()) newErrors.zipCode = t("errors.zipRequired");
      else if (!/^\d{5}$/.test(formData.zipCode))
        newErrors.zipCode = t("errors.zipInvalid");
    }

    if (step === 2) {
      if (formData.daysAvailable.length === 0)
        newErrors.daysAvailable = t("errors.daysRequired");
      if (!formData.timePreference)
        newErrors.timePreference = t("errors.timePreferenceRequired");
      if (!formData.hoursPerWeek)
        newErrors.hoursPerWeek = t("errors.hoursPerWeekRequired");
      if (formData.interests.length === 0)
        newErrors.interests = t("errors.interestsRequired");
    }

    if (step === 3) {
      if (!formData.emergencyContactName.trim())
        newErrors.emergencyContactName = t("errors.emergencyNameRequired");
      if (!formData.emergencyContactPhone.trim())
        newErrors.emergencyContactPhone = t("errors.emergencyPhoneRequired");
      if (!formData.emergencyContactRelationship.trim())
        newErrors.emergencyContactRelationship = t(
          "errors.emergencyRelationshipRequired"
        );
      if (!formData.hearAboutUs)
        newErrors.hearAboutUs = t("errors.hearAboutUsRequired");
      if (!formData.backgroundCheckConsent)
        newErrors.backgroundCheckConsent = t(
          "errors.backgroundConsentRequired"
        );
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
    // Simulate form submission (replace with server action when ready)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      daysAvailable: [],
      timePreference: "",
      hoursPerWeek: "",
      interests: [],
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      hearAboutUs: "",
      backgroundCheckConsent: false,
      references: "",
      motivation: "",
      specialAccommodations: "",
      skills: "",
      languages: "",
      previousVolunteerExperience: "",
    });
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300 delay-100">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-foreground text-balance">
            {t("success.title")}
          </h3>
          <p className="text-muted-foreground text-pretty leading-relaxed max-w-md mx-auto text-lg">
            {t("success.body")}
          </p>
        </div>
        <div className="pt-4">
          <Button onClick={resetForm} variant="outline" className="gap-2">
            {t("actions.submitAnother")}
          </Button>
        </div>
      </div>
    );
  }

  const stepIcons = [
    <User key="user" />,
    <Calendar key="calendar" />,
    <Shield key="shield" />,
    <FileCheck key="check" />,
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
            e.preventDefault();
            if (currentStep < STEPS.length) {
              if (validateStep(currentStep)) {
                setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
              }
            }
            // On review step, do nothing; user must click the Submit button.
          }
        }}
        className="space-y-8"
      >
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t("sections.basicInformation")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    {t("fields.firstName.label")} *
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
                    {t("fields.lastName.label")} *
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
            </div>

            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground">
                {t("sections.contactDetails")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("fields.email.label")} *
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
                  <Label htmlFor="phone" className="text-sm font-medium">
                    {t("fields.phone.label")} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`transition-all ${
                      errors.phone
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  {t("fields.dateOfBirth.label")} *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    updateFormData("dateOfBirth", e.target.value)
                  }
                  className={`transition-all ${
                    errors.dateOfBirth
                      ? "border-destructive ring-destructive/20 ring-2"
                      : "focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" /> {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground">
                {t("sections.address")}
              </h3>
              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-sm font-medium">
                  {t("fields.streetAddress.label")} *
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
                  <Label htmlFor="city" className="text-sm font-medium">
                    {t("fields.city.label")} *
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    placeholder="Salt Lake City"
                    className={`transition-all ${
                      errors.city
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.city}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium">
                    {t("fields.state.label")} *
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) => updateFormData("state", value)}
                  >
                    <SelectTrigger
                      className={`transition-all ${
                        errors.state
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
                  {errors.state && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.state}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    {t("fields.zipCode.label")} *
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

        {/* Step 2: Availability & Interests */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t("sections.schedule")}
              </h3>
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  {t("fields.daysAvailable.label")} *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <label
                      key={day}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                        formData.daysAvailable.includes(day)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Checkbox
                        id={day}
                        checked={formData.daysAvailable.includes(day)}
                        onCheckedChange={() =>
                          toggleArrayValue("daysAvailable", day)
                        }
                      />
                      <span className="text-sm font-medium">
                        {t(`weekdays.${day.toLowerCase()}.short`)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.daysAvailable && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" /> {errors.daysAvailable}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="timePreference"
                    className="text-sm font-medium"
                  >
                    {t("fields.timePreference.label")} *
                  </Label>
                  <Select
                    value={formData.timePreference}
                    onValueChange={(value) =>
                      updateFormData("timePreference", value)
                    }
                  >
                    <SelectTrigger
                      className={`transition-all ${
                        errors.timePreference
                          ? "border-destructive ring-destructive/20 ring-2"
                          : "focus:ring-2 focus:ring-primary/20"
                      }`}
                    >
                      <SelectValue
                        placeholder={t("fields.timePreference.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">
                        {t("fields.timePreference.options.morning")}
                      </SelectItem>
                      <SelectItem value="afternoon">
                        {t("fields.timePreference.options.afternoon")}
                      </SelectItem>
                      <SelectItem value="evening">
                        {t("fields.timePreference.options.evening")}
                      </SelectItem>
                      <SelectItem value="flexible">
                        {t("fields.timePreference.options.flexible")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.timePreference && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" />{" "}
                      {errors.timePreference}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursPerWeek" className="text-sm font-medium">
                    {t("fields.hoursPerWeek.label")} *
                  </Label>
                  <Select
                    value={formData.hoursPerWeek}
                    onValueChange={(value) =>
                      updateFormData("hoursPerWeek", value)
                    }
                  >
                    <SelectTrigger
                      className={`transition-all ${
                        errors.hoursPerWeek
                          ? "border-destructive ring-destructive/20 ring-2"
                          : "focus:ring-2 focus:ring-primary/20"
                      }`}
                    >
                      <SelectValue
                        placeholder={t("fields.hoursPerWeek.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">
                        {t("fields.hoursPerWeek.options.1_3")}
                      </SelectItem>
                      <SelectItem value="4-6">
                        {t("fields.hoursPerWeek.options.4_6")}
                      </SelectItem>
                      <SelectItem value="7-10">
                        {t("fields.hoursPerWeek.options.7_10")}
                      </SelectItem>
                      <SelectItem value="10+">
                        {t("fields.hoursPerWeek.options.10_plus")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.hoursPerWeek && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" /> {errors.hoursPerWeek}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground">
                {t("sections.interests")}
              </h3>
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  {t("fields.interests.label")}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "communityEvents",
                    "neighborhoodProjects",
                    "supportServices",
                    "youthPrograms",
                    "seniorServices",
                    "environmentalProjects",
                    "educationTutoring",
                    "foodDistribution",
                    "virtualOpportunities",
                    "administrativeSupport",
                  ].map((interest) => (
                    <label
                      key={interest}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                        formData.interests.includes(t(`interests.${interest}`))
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(
                          t(`interests.${interest}`)
                        )}
                        onCheckedChange={() =>
                          toggleArrayValue(
                            "interests",
                            t(`interests.${interest}`)
                          )
                        }
                      />
                      <span className="text-sm font-medium leading-tight">
                        {t(`interests.${interest}`)}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" /> {errors.interests}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium">
                  {t("fields.skills.label")}
                </Label>
                <Textarea
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => updateFormData("skills", e.target.value)}
                  placeholder={t("fields.skills.placeholder")}
                  rows={3}
                  className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages" className="text-sm font-medium">
                  {t("fields.languages.label")}
                </Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => updateFormData("languages", e.target.value)}
                  placeholder={t("fields.languages.placeholder")}
                  className="focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Background & References */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {t("sections.emergencyContact")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactName"
                    className="text-sm font-medium"
                  >
                    {t("fields.emergencyContactName.label")} *
                  </Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      updateFormData("emergencyContactName", e.target.value)
                    }
                    placeholder="Jane Doe"
                    className={`transition-all ${
                      errors.emergencyContactName
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.emergencyContactName && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" />{" "}
                      {errors.emergencyContactName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="emergencyContactPhone"
                    className="text-sm font-medium"
                  >
                    {t("fields.emergencyContactPhone.label")} *
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      updateFormData("emergencyContactPhone", e.target.value)
                    }
                    placeholder="(555) 987-6543"
                    className={`transition-all ${
                      errors.emergencyContactPhone
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="w-3 h-3" />{" "}
                      {errors.emergencyContactPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="emergencyContactRelationship"
                  className="text-sm font-medium"
                >
                  {t("fields.emergencyContactRelationship.label")} *
                </Label>
                <Input
                  id="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) =>
                    updateFormData(
                      "emergencyContactRelationship",
                      e.target.value
                    )
                  }
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className={`transition-all ${
                    errors.emergencyContactRelationship
                      ? "border-destructive ring-destructive/20 ring-2"
                      : "focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                {errors.emergencyContactRelationship && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.emergencyContactRelationship}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6 p-6 bg-muted/30 rounded-lg border border-border/50">
              <h3 className="text-lg font-semibold text-foreground">
                {t("sections.additionalInformation")}
              </h3>
              <div className="space-y-2">
                <Label
                  htmlFor="previousVolunteerExperience"
                  className="text-sm font-medium"
                >
                  {t("fields.previousVolunteerExperience.label")}
                </Label>
                <Textarea
                  id="previousVolunteerExperience"
                  value={formData.previousVolunteerExperience}
                  onChange={(e) =>
                    updateFormData(
                      "previousVolunteerExperience",
                      e.target.value
                    )
                  }
                  placeholder={t(
                    "fields.previousVolunteerExperience.placeholder"
                  )}
                  rows={3}
                  className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="references" className="text-sm font-medium">
                  {t("fields.references.label")}
                </Label>
                <Textarea
                  id="references"
                  value={formData.references}
                  onChange={(e) => updateFormData("references", e.target.value)}
                  placeholder={t("fields.references.placeholder")}
                  rows={3}
                  className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hearAboutUs" className="text-sm font-medium">
                  {t("fields.hearAboutUs.label")} *
                </Label>
                <Select
                  value={formData.hearAboutUs}
                  onValueChange={(value) =>
                    updateFormData("hearAboutUs", value)
                  }
                >
                  <SelectTrigger
                    className={`transition-all ${
                      errors.hearAboutUs
                        ? "border-destructive ring-destructive/20 ring-2"
                        : "focus:ring-2 focus:ring-primary/20"
                    }`}
                  >
                    <SelectValue
                      placeholder={t("fields.hearAboutUs.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">
                      {t("fields.hearAboutUs.options.socialMedia")}
                    </SelectItem>
                    <SelectItem value="friend">
                      {t("fields.hearAboutUs.options.friend")}
                    </SelectItem>
                    <SelectItem value="community-event">
                      {t("fields.hearAboutUs.options.communityEvent")}
                    </SelectItem>
                    <SelectItem value="website">
                      {t("fields.hearAboutUs.options.website")}
                    </SelectItem>
                    <SelectItem value="news">
                      {t("fields.hearAboutUs.options.news")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("fields.hearAboutUs.options.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.hearAboutUs && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" /> {errors.hearAboutUs}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <label
                  className={`flex items-start gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.backgroundCheckConsent
                      ? "border-primary bg-primary/5"
                      : errors.backgroundCheckConsent
                      ? "border-destructive bg-destructive/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    id="backgroundCheckConsent"
                    checked={formData.backgroundCheckConsent}
                    onCheckedChange={(checked) =>
                      updateFormData("backgroundCheckConsent", checked)
                    }
                    className="mt-1"
                  />
                  <div className="space-y-2">
                    <div className="text-sm font-semibold leading-none">
                      {t("fields.backgroundCheckConsent.label")} *
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("fields.backgroundCheckConsent.body")}
                    </p>
                  </div>
                </label>
                {errors.backgroundCheckConsent && (
                  <p className="text-sm text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.backgroundCheckConsent}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation" className="text-sm font-medium">
                  {t("fields.motivation.label")}
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => updateFormData("motivation", e.target.value)}
                  placeholder={t("fields.motivation.placeholder")}
                  rows={3}
                  className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="specialAccommodations"
                  className="text-sm font-medium"
                >
                  {t("fields.specialAccommodations.label")}
                </Label>
                <Textarea
                  id="specialAccommodations"
                  value={formData.specialAccommodations}
                  onChange={(e) =>
                    updateFormData("specialAccommodations", e.target.value)
                  }
                  placeholder={t("fields.specialAccommodations.placeholder")}
                  rows={2}
                  className="resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-6 border-2 border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <FileCheck className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                  {t("review.title")}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {t("review.intro")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("review.sections.personalInformation")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.name")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.firstName} {formData.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.email")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.phone")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.dateOfBirth")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.dateOfBirth}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.address")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.streetAddress}, {formData.city},{" "}
                      {formData.state} {formData.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("review.sections.availability")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.daysAvailable")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.daysAvailable.join(", ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.timePreference")}
                    </span>
                    <p className="font-semibold text-foreground mt-1 capitalize">
                      {formData.timePreference}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.hoursPerWeek")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.hoursPerWeek}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.interests")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.interests.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-6 border-2 border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("review.sections.emergencyContact")}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.emergencyName")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.emergencyContactName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.emergencyPhone")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.emergencyContactPhone}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-medium">
                      {t("review.labels.emergencyRelationship")}
                    </span>
                    <p className="font-semibold text-foreground mt-1">
                      {formData.emergencyContactRelationship}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-5 border border-border">
              <p className="text-sm text-muted-foreground text-center text-pretty leading-relaxed">
                {t("review.disclaimer")}
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
            {t("actions.back")}
          </Button>

          <div className="text-sm text-muted-foreground font-medium">
            {t("progress.stepIndicator", {
              current: currentStep,
              total: STEPS.length,
            })}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {t("actions.next")}
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 h-11 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t("actions.submitting")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t("actions.submit")}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
