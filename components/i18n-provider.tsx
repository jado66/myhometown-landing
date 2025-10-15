"use client";
import { ReactNode, useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

interface Props {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, any>;
}

export function I18nProvider({ children, locale, messages }: Props) {
  // Because we are not localizing URLs, we still can watch pathname if needed for future
  const pathname = usePathname();
  useEffect(() => {
    // Potential future side-effects (analytics) when route changes
  }, [pathname]);
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      now={new Date()}
      timeZone="America/Denver"
      formats={{
        dateTime: {
          short: {
            day: "numeric",
            month: "short",
            year: "numeric",
          },
        },
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
