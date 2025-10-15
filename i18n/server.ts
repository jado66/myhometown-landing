import { detectLocale, getMessages } from "./getMessages";
import { createTranslator } from "next-intl";

export async function getT(namespace?: string) {
  const locale = await detectLocale();
  const messages = await getMessages(locale);
  const t = createTranslator({ locale, messages, namespace });
  return { t, locale, messages };
}

export async function getNamespaceT(namespace: string) {
  const { t, locale, messages } = await getT(namespace);
  return { t, locale, messages };
}
