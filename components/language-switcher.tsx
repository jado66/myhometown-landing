"use client";
import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

// Since we do not localize URLs, we only change a cookie then refresh path.
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLocale(next: string) {
    if (next === locale) return;
    // Set cookie client-side; server will pick it up next request.
    document.cookie = `locale=${next}; path=/; max-age=31536000`; // 1 year
    startTransition(() => {
      // Trigger a soft refresh.
      router.refresh();
    });
  }

  const langs: { code: string; label: string }[] = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
  ];

  const current = langs.find((l) => l.code === locale) || langs[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          aria-label="Select language"
          disabled={pending}
          variant="ghost"
          className="text-white font-semibold text-base hover:text-white/80 hover:bg-white/10 transition-colors"
        >
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] bg-white border shadow-lg"
      >
        {langs.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`text-gray-900 font-medium cursor-pointer hover:bg-gray-100 ${
              locale === l.code ? "bg-gray-100" : ""
            }`}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
