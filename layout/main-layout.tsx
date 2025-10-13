import type React from "react";

import { getCitySelectOptions, getAllCitySelectOptions } from "@/lib/cities";
import { MainLayoutClient } from "./main-layout-client";

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const visibleCities = await getCitySelectOptions();
  const allCities = await getAllCitySelectOptions();

  return (
    <MainLayoutClient visibleCities={visibleCities} allCities={allCities}>
      {children}
    </MainLayoutClient>
  );
}
