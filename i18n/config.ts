export const defaultLocale = "en";
export const locales = ["en", "es", "pt"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
