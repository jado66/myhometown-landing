"use client";

import type React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useTransition } from "react";
import { MyHometownLogo } from "../logo/my-hometown";
import { subscribeToNewsletter } from "@/app/actions/subscribe-to-newsletter";
import { toast } from "sonner";
import { CitySelectOption } from "@/lib/cities";

interface FooterProps {
  cities: CitySelectOption[];
  allCities: CitySelectOption[];
}

export function Footer({ cities, allCities }: FooterProps) {
  const [email, setEmail] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!selectedCity) {
      toast.error("Please select a city.");
      return;
    }

    startTransition(async () => {
      const result = await subscribeToNewsletter(email, selectedCity);

      if (result.success) {
        toast.success(result.message);
        setEmail("");
        // Keep the city selection for user convenience
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h3 className="text-2xl font-bold mb-3">Stay Connected</h3>
          <p className="text-gray-600 mb-6">
            Get updates on upcoming service projects and community events in
            your area.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="space-y-3 max-w-lg mx-auto"
          >
            {/* City Selection Label */}
            <div className="text-left">
              <label className="text-sm font-medium text-gray-700">
                Select Your City
              </label>
            </div>

            {/* Inline City Selection, Email Input and Submit */}
            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48" disabled={isPending}>
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {allCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
                className="flex-1"
              />

              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#318d43] hover:bg-[#246340] text-white disabled:opacity-50"
              >
                {isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <MyHometownLogo type="dark-full" size={36} className="mb-4" />
            <p className="text-sm text-gray-600">
              Strengthening neighborhoods through service and community
              partnerships.
            </p>
          </div>

          {/* Our Cities */}
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">Our Cities</h4>
            <div className="flex gap-8 text-sm">
              <div className="flex flex-col gap-y-2">
                {(() => {
                  // First sort all cities: available first, then coming soon
                  const sortedCities = allCities.sort((a, b) => {
                    const aComingSoon = a.visibility === false;
                    const bComingSoon = b.visibility === false;

                    if (aComingSoon && !bComingSoon) return 1;
                    if (!aComingSoon && bComingSoon) return -1;
                    return 0; // Keep original order within each group
                  });

                  const midPoint = Math.ceil(sortedCities.length / 2);
                  const firstColumn = sortedCities.slice(0, midPoint);

                  return firstColumn.map((city) => {
                    const slug = city.name.toLowerCase().replace(/\s+/g, "-");
                    const isComingSoon = city.visibility === false;

                    return (
                      <div key={city.id} className="flex items-center gap-2">
                        <Link
                          href={isComingSoon ? "#" : `/utah/${slug}`}
                          className={`text-gray-600 hover:text-[#318d43] transition-colors ${
                            isComingSoon ? "cursor-default opacity-75" : ""
                          }`}
                          onClick={
                            isComingSoon ? (e) => e.preventDefault() : undefined
                          }
                        >
                          {city.name}
                          {isComingSoon && (
                            <span className="ml-.5 text-xs">
                              {" "}
                              - Coming Soon
                            </span>
                          )}
                        </Link>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex flex-col gap-y-2">
                {(() => {
                  // First sort all cities: available first, then coming soon
                  const sortedCities = allCities.sort((a, b) => {
                    const aComingSoon = a.visibility === false;
                    const bComingSoon = b.visibility === false;

                    if (aComingSoon && !bComingSoon) return 1;
                    if (!aComingSoon && bComingSoon) return -1;
                    return 0; // Keep original order within each group
                  });

                  const midPoint = Math.ceil(sortedCities.length / 2);
                  const secondColumn = sortedCities.slice(midPoint);

                  return secondColumn.map((city) => {
                    const slug = city.name.toLowerCase().replace(/\s+/g, "-");
                    const isComingSoon = city.visibility === false;

                    return (
                      <div key={city.id} className="flex items-center gap-2">
                        <Link
                          href={isComingSoon ? "#" : `/utah/${slug}`}
                          className={`text-gray-600 hover:text-[#318d43] transition-colors ${
                            isComingSoon ? "cursor-default opacity-75" : ""
                          }`}
                          onClick={
                            isComingSoon ? (e) => e.preventDefault() : undefined
                          }
                        >
                          {city.name}
                          {isComingSoon && (
                            <span className="ml-.5 text-xs">
                              {" "}
                              - Coming Soon
                            </span>
                          )}
                        </Link>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/what-we-do"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  What We Do
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-do"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  Find Classes
                </Link>
              </li>
              <li>
                <Link
                  href="/volunteer"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  Volunteer
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  Days of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="mailto:volunteer@myhometownut.com"
                  className="hover:text-[#318d43] transition-colors"
                >
                  volunteer@myhometownut.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="hover:text-[#318d43] transition-colors"
                >
                  (123) 456-7890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>
            Copyright © 2023 - {new Date().getFullYear()} myHometown Utah. All
            rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-[#318d43] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#318d43] transition-colors"
            >
              Terms of Service
            </Link>
            <a
              href="https://www.platinumprogramming.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#318d43] transition-colors"
            >
              Powered by Platinum Programming
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
