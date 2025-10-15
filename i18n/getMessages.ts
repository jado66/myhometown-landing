import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import fs from "node:fs/promises";
import path from "node:path";

// Basic Accept-Language parsing without negotiator (lightweight)
function detectFromAcceptLanguage(
  accept: string | undefined,
  supported: readonly string[]
): string | undefined {
  if (!accept) return undefined;
  const parts = accept.split(",").map((s) => {
    const [tag, qPart] = s.trim().split(";");
    const q = qPart?.split("=")[1];
    return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const p of parts) {
    const base = p.tag.split("-")[0];
    if (supported.includes(p.tag)) return p.tag;
    if (supported.includes(base)) return base;
  }
  return undefined;
}

export async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const saved = cookieStore.get("locale")?.value;
  if (saved && isLocale(saved)) return saved;

  const hdrs = await headers();
  const accept = hdrs.get("accept-language") || undefined;
  const detected = detectFromAcceptLanguage(accept, ["en", "es"]);
  if (detected && isLocale(detected)) return detected;
  return defaultLocale;
}

export async function getMessages(locale: Locale) {
  const file = path.join(process.cwd(), "messages", `${locale}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}
