import type React from "react";

import {
  getCachedCitySelectOptions,
  getCachedAllCitySelectOptions,
} from "@/lib/cities";
import { MainLayoutClient } from "./main-layout-client";

interface MainLayoutProps {
  children: React.ReactNode;
}

export async function MainLayout({ children }: MainLayoutProps) {
  const visibleCities = await getCachedCitySelectOptions();
  const allCities = await getCachedAllCitySelectOptions();

  return (
    <MainLayoutClient visibleCities={visibleCities} allCities={allCities}>
      {children}
    </MainLayoutClient>
  );
}
