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
import { useState, useMemo } from "react";
import MyHometownLogo from "../logo/my-hometown";
import { crcs } from "@/data/crcs";

export function Footer() {
  const [email, setEmail] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  const cities = useMemo(() => {
    const uniqueCities = Array.from(
      new Set(crcs.map((crc) => crc.city))
    ).sort();
    return uniqueCities;
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Newsletter signup:", {
      email,
      city: selectedCity === "all" ? "All Cities" : selectedCity,
    });
    setEmail("");
    // Keep the city selection for user convenience
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
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
                className="flex-1"
              />

              <Button
                type="submit"
                className="bg-[#318d43] hover:bg-[#246340] text-white"
              >
                Subscribe
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <MyHometownLogo type="dark-full" size={36} className="mb-4" />
            <p className="text-sm text-gray-600">
              Strengthening neighborhoods through service and community
              partnerships.
            </p>
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
                  href="/projects"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  Service Projects
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
                  href="/about"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Cities */}
          <div>
            <h4 className="font-semibold mb-4">Our Cities</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Link
                href="/utah/layton"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Layton
              </Link>
              <Link
                href="/utah/ogden"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Ogden
              </Link>
              <Link
                href="/utah/orem"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Orem
              </Link>
              <Link
                href="/utah/provo"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Provo
              </Link>
              <Link
                href="/utah/salt-lake-city"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Salt Lake City
              </Link>
              <Link
                href="/utah/santaquin"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
              >
                Santaquin
              </Link>
              <Link
                href="/utah/west-valley-city"
                className="text-gray-600 hover:text-[#318d43] transition-colors col-span-2"
              >
                West Valley City
              </Link>
            </div>
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
            {/* Social Media */}
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
                aria-label="Twitter"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-[#318d43] transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
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
