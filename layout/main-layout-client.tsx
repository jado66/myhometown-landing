"use client";

import type React from "react";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { CitySelectOption } from "@/lib/cities";
import { useCurrentUser } from "@/hooks/use-current-user";

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
  const { isImpersonating } = useCurrentUser();
  const pathname = usePathname();

  // Hide main footer in admin section (admin has its own footer)
  const isAdminSection = pathname?.startsWith("/admin");

  // Adjust main content padding when impersonation banner is showing
  const mainPadding = isImpersonating ? "pt-[104px]" : "pt-16";

  return (
    <div className="h-screen bg-white flex flex-col">
      <ImpersonationBanner />
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
        <main className={mainPadding}>{children}</main>
        {!isAdminSection && (
          <Footer cities={visibleCities} allCities={allCities} />
        )}
      </ScrollArea>
    </div>
  );
}
