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
import { ChevronDown, X } from "lucide-react";
import MyHometownLogo from "../logo/my-hometown";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const cities = [
  { name: "Layton", slug: "layton" },
  { name: "Ogden", slug: "ogden" },
  { name: "Orem", slug: "orem" },
  { name: "Provo", slug: "provo" },
  { name: "Salt Lake City", slug: "salt-lake-city" },
  { name: "Santaquin", slug: "santaquin" },
  { name: "West Valley City", slug: "west-valley-city" },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="top"
        className="bg-[#1b75bc] p-0 border-0"
        hideCloseButton
      >
        <SheetHeader className="p-0 m-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
                  aria-label="Close menu"
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
                Our Cities
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="flex flex-col ml-4 mt-2 space-y-1">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/utah/${city.slug}`}
                      onClick={onClose}
                      className="text-white/90 font-medium hover:text-white hover:bg-white/10 rounded-md px-3 py-2 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Link
            href="#classes"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            Find Classes
          </Link>

          <Link
            href="/what-we-do"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            What We Do
          </Link>

          <Link
            href="/login"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 hover:bg-white/10 rounded-lg px-4 py-3 transition-colors"
          >
            Login
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
