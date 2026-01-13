import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import {
  getCachedCitySelectOptions,
  getCachedAllCitySelectOptions,
} from "@/lib/cities";
import { MainLayoutClient } from "@/layout/main-layout-client";
import { detectLocale, getMessages } from "@/i18n/getMessages";
import { I18nProvider } from "@/components/i18n-provider";
import { UserProvider } from "@/contexts/user-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyHometown Utah | Strengthening Neighborhoods Through Service",
  description:
    "Volunteer-driven neighborhood revitalization across Utah: home repairs, clean-ups, landscape renewal, resource center classes, and cooperative partnerships.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const visibleCities = await getCachedCitySelectOptions();
  const allCities = await getCachedAllCitySelectOptions();
  const locale = await detectLocale();
  const messages = await getMessages(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased">
        <I18nProvider locale={locale} messages={messages}>
          <UserProvider>
            <MainLayoutClient visibleCities={visibleCities} allCities={allCities}>
              {children}
            </MainLayoutClient>
          </UserProvider>
        </I18nProvider>
        <Toaster position="top-center" closeButton richColors theme="light" />
      </body>
    </html>
  );
}
