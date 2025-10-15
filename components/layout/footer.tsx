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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("footer");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error(t("errors.invalidEmail"));
      return;
    }

    if (!selectedCity) {
      toast.error(t("errors.noCity"));
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
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h3 className="text-2xl font-bold mb-3">{t("stayConnected")}</h3>
          <p className="text-gray-600 mb-6">{t("intro")}</p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="space-y-3 max-w-lg mx-auto"
          >
            <div className="text-left">
              <label className="text-sm font-medium text-gray-700">
                {t("selectYourCity")}
              </label>
            </div>
            <div className="flex gap-3">
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-48" disabled={isPending}>
                  <SelectValue placeholder={t("cityPlaceholder")} />
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
                placeholder={t("emailPlaceholder")}
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
                {isPending ? t("subscribing") : t("subscribe")}
              </Button>
            </div>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div className="md:col-span-1">
            <MyHometownLogo type="dark-full" size={36} className="mb-4" />
            <p className="text-sm text-gray-600">{t("about")}</p>
          </div>
          <div className="md:col-span-2">
            <h4 className="font-semibold mb-4">{t("ourCities")}</h4>
            <div className="flex gap-8 text-sm">
              {["first", "second"].map((col) => {
                const sorted = [...allCities].sort((a, b) => {
                  const aComing = a.visibility === false;
                  const bComing = b.visibility === false;
                  if (aComing && !bComing) return 1;
                  if (!aComing && bComing) return -1;
                  return 0;
                });
                const mid = Math.ceil(sorted.length / 2);
                const slice =
                  col === "first" ? sorted.slice(0, mid) : sorted.slice(mid);
                return (
                  <div key={col} className="flex flex-col gap-y-2">
                    {slice.map((city) => {
                      const slug = city.name.toLowerCase().replace(/\s+/g, "-");
                      const coming = city.visibility === false;
                      return (
                        <div key={city.id} className="flex items-center gap-2">
                          <Link
                            href={coming ? "#" : `/utah/${slug}`}
                            className={`text-gray-600 hover:text-[#318d43] transition-colors ${
                              coming ? "cursor-default opacity-75" : ""
                            }`}
                            onClick={
                              coming ? (e) => e.preventDefault() : undefined
                            }
                          >
                            {city.name}
                            {coming && (
                              <span className="ml-.5 text-xs">
                                {" "}
                                - {t("comingSoon")}
                              </span>
                            )}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/what-we-do"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  {t("links.whatWeDo")}
                </Link>
              </li>
              <li>
                <Link
                  href="/what-we-do"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  {t("links.findClasses")}
                </Link>
              </li>
              <li>
                <Link
                  href="/volunteer"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  {t("links.volunteer")}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-gray-600 hover:text-[#318d43] transition-colors"
                >
                  {t("links.daysOfService")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("contact")}</h4>
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
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-[#318d43] transition-colors"
            >
              {t("links.privacy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#318d43] transition-colors"
            >
              {t("links.terms")}
            </Link>
            <a
              href="https://www.platinumprogramming.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#318d43] transition-colors"
            >
              {t("links.poweredBy")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
