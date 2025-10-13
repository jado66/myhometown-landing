"use client";

import type React from "react";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CitySelectOption } from "@/lib/cities";

interface MainLayoutClientProps {
  children: React.ReactNode;
  visibleCities: CitySelectOption[];
  allCities: CitySelectOption[];
}

export function MainLayoutClient({
  children,
  visibleCities,
  allCities,
}: MainLayoutClientProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header
        cities={allCities}
        onMobileMenuOpen={() => setMobileNavOpen(true)}
      />
      <MobileNav
        cities={allCities}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <ScrollArea className="flex-1">
        <main className="pt-16">{children}</main>
        <Footer cities={visibleCities} allCities={allCities} />
      </ScrollArea>
    </div>
  );
}
