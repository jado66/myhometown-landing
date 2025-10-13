"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/util/supabase-server";

export type NewsletterSubscriptionResult = {
  success: boolean;
  message: string;
  error?: string;
};

export async function subscribeToNewsletter(
  email: string,
  citySelection: string
): Promise<NewsletterSubscriptionResult> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        success: false,
        message: "Please provide a valid email address.",
      };
    }

    // Validate city selection
    if (!citySelection) {
      return {
        success: false,
        message: "Please select a city.",
      };
    }

    // Get city name for the selected city
    const { data: cityData, error: cityError } = await supabaseServer
      .from("cities")
      .select("name")
      .eq("id", citySelection)
      .single();

    if (cityError || !cityData) {
      return {
        success: false,
        message: "Invalid city selection. Please try again.",
      };
    }

    const cityId = citySelection;
    const cityName = cityData.name;
    const subscribedToAll = false;

    // Check if this email + city combination already exists
    const { data: existingSubscription, error: checkError } =
      await supabaseServer
        .from("newsletter_subscriptions")
        .select("id, is_active")
        .eq("email", email)
        .eq("city_id", cityId)
        .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      console.error("Error checking existing subscription:", checkError);
      return {
        success: false,
        message: "An error occurred. Please try again.",
        error: checkError.message,
      };
    }

    // If subscription exists and is active, inform the user
    if (existingSubscription && existingSubscription.is_active) {
      return {
        success: false,
        message: `You're already subscribed to updates for ${cityName}.`,
      };
    }

    // If subscription exists but is inactive, reactivate it
    if (existingSubscription && !existingSubscription.is_active) {
      const { error: updateError } = await supabaseServer
        .from("newsletter_subscriptions")
        .update({ is_active: true })
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error("Error reactivating subscription:", updateError);
        return {
          success: false,
          message: "An error occurred. Please try again.",
          error: updateError.message,
        };
      }

      return {
        success: true,
        message: `Welcome back! You've been resubscribed to ${cityName} updates.`,
      };
    }

    // Create new subscription
    const { error: insertError } = await supabaseServer
      .from("newsletter_subscriptions")
      .insert({
        email,
        city_id: cityId,
        city_name: cityName,
        subscribed_to_all: subscribedToAll,
        is_active: true,
      });

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return {
        success: false,
        message: "An error occurred. Please try again.",
        error: insertError.message,
      };
    }

    // Revalidate the page to ensure any subscription counts are updated
    revalidatePath("/");

    return {
      success: true,
      message: `Successfully subscribed to ${cityName} updates! Check your email for confirmation.`,
    };
  } catch (error) {
    console.error("Unexpected error in subscribeToNewsletter:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
