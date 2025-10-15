import { getRequestConfig } from "next-intl/server";

// Provide a minimal request config so next-intl can resolve the locale.
// Messages are injected separately via our custom RootLayout provider.
export default getRequestConfig(async () => {
  // Fallback to 'en'; real detection/cookie logic lives in our own pipeline.
  const locale = "en";
  return {
    locale,
    messages: {},
  };
});
