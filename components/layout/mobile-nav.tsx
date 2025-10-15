"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X } from "lucide-react";
import { MyHometownLogo } from "../logo/my-hometown";
import { CitySelectOption } from "@/lib/cities";
import { useTranslations } from "next-intl";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  cities: CitySelectOption[];
}

export function MobileNav({ open, onClose, cities }: MobileNavProps) {
  const headerT = useTranslations("header");
  const navT = useTranslations("nav");
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="top"
        className="bg-[#1b75bc] p-0 border-0"
        hideCloseButton
      >
        <SheetHeader className="p-0 m-0">
          <SheetTitle className="sr-only">{navT("menuTitle")}</SheetTitle>
          {/* Header matching the main header */}
          <div className="bg-[#1b75bc] ">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <Link href="/" onClick={onClose} className="flex items-center">
                  <MyHometownLogo type="header-full" size={36} />
                </Link>

                {/* Close button in same position as menu button */}
                <button
                  onClick={onClose}
                  className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
                  aria-label={navT("closeMenu")}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </SheetHeader>
        <nav className="flex flex-col space-y-1 px-6 pb-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="cities" className="border-none">
              <AccordionTrigger className="text-white font-semibold text-lg hover:no-underline hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors [&[data-state=open]]:bg-white/10">
                {headerT("cities")}
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="flex flex-col ml-4 mt-2 space-y-1">
                  {cities
                    .filter((city) => city.visibility !== false)
                    .map((city) => {
                      const slug = city.name.toLowerCase().replace(/\s+/g, "-");

                      return (
                        <Link
                          key={city.id}
                          href={`/utah/${slug}`}
                          onClick={onClose}
                          className="text-white/90 font-medium hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
                        >
                          {city.name}
                        </Link>
                      );
                    })}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="volunteer" className="border-none">
              <AccordionTrigger className="text-white font-semibold text-lg hover:no-underline hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors [&[data-state=open]]:bg-white/10">
                {headerT("volunteer")}
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="flex flex-col ml-4 mt-2 space-y-1">
                  <Link
                    href="/volunteer"
                    onClick={onClose}
                    className="text-white/90 font-medium hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
                  >
                    {headerT("volunteer_menu")}
                  </Link>
                  <Link
                    href="/days-of-service"
                    onClick={onClose}
                    className="text-white/90 font-medium hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
                  >
                    {headerT("days_of_service")}
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Link
            href="classes"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            {headerT("classes")}
          </Link>

          <Link
            href="/what-we-do"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            {headerT("what_we_do")}
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            {headerT("login")}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
