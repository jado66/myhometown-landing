"use server";

import { supabaseServer } from "@/util/supabase-server";

export interface VolunteerSignupPayload {
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

export interface VolunteerSignupResult {
  success: boolean;
  message: string;
  error?: string;
  duplicate?: boolean;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function submitVolunteerSignup(
  payload: VolunteerSignupPayload
): Promise<VolunteerSignupResult> {
  try {
    // Basic validation (server-side defense in depth)
    if (!payload.firstName?.trim())
      return { success: false, message: "First name required" };
    if (!payload.lastName?.trim())
      return { success: false, message: "Last name required" };
    if (!payload.email?.trim() || !validateEmail(payload.email))
      return { success: false, message: "Valid email required" };
    if (!payload.volunteeringCityId)
      return { success: false, message: "Volunteer city required" };

    // Optional: Ensure volunteer city exists
    const { data: cityCheck, error: cityError } = await supabaseServer
      .from("cities")
      .select("id")
      .eq("id", payload.volunteeringCityId)
      .maybeSingle();
    if (cityError) {
      return {
        success: false,
        message: "Unable to validate city",
        error: cityError.message,
      };
    }
    if (!cityCheck) {
      return { success: false, message: "Selected city not found" };
    }

    // Insert (will fail on duplicate email due to unique constraint)
    const { error: insertError } = await supabaseServer
      .from("volunteer_signups")
      .insert({
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        contact_number: payload.contactNumber || null,
        street_address: payload.streetAddress || null,
        address_city: payload.addressCity || null,
        address_state: payload.addressState || null,
        zip_code: payload.zipCode || null,
        volunteering_city_id: payload.volunteeringCityId,
      });

    if (insertError) {
      // Unique violation
      if ((insertError as any).code === "23505") {
        return {
          success: false,
          message: "An application with this email already exists.",
          error: insertError.message,
          duplicate: true,
        };
      }
      return {
        success: false,
        message: "Failed to submit application.",
        error: insertError.message,
      };
    }

    return {
      success: true,
      message: "Application submitted successfully!",
    };
  } catch (e: any) {
    return {
      success: false,
      message: "Unexpected server error.",
      error: e?.message || "Unknown error",
    };
  }
}
