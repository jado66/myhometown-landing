"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, User, LogOut, Settings } from "lucide-react";
import { MyHometownLogo } from "../logo/my-hometown";
import { useTranslations } from "next-intl";
import { CitySelectOption } from "@/lib/cities";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useCurrentUser } from "@/hooks/use-current-user";
import { supabase } from "@/util/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMobileMenuOpen: () => void;
  cities: CitySelectOption[];
}

export function Header({ onMobileMenuOpen, cities }: HeaderProps) {
  const t = useTranslations("header");
  const router = useRouter();
  const { user, isLoading, isImpersonating } = useCurrentUser();

  const handleLogout = async () => {
    try {
      // Clear impersonation data
      window.localStorage.removeItem("impersonatedUser");

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // Adjust header position when impersonation banner is showing
  const headerTop = isImpersonating ? "top-10" : "top-0";

  return (
    <header
      className={`fixed ${headerTop} left-0 right-0 z-50 bg-[#1b75bc] shadow-md transition-all`}
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <MyHometownLogo type="header-full" size={36} />
          </Link>

          {/* Mobile controls: language + menu */}
          <div className="flex items-center gap-1 md:hidden">
            <LanguageSwitcher />
            <Button
              type="button"
              variant="ghost"
              aria-label="Open menu"
              onClick={onMobileMenuOpen}
              className="text-white hover:text-white/80 hover:bg-white/10 p-2 h-9 w-9 flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white font-semibold text-base hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  {t("cities")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border shadow-lg">
                {cities
                  .filter((city) => city.visibility !== false)
                  .map((city) => {
                    const slug = city.name.toLowerCase().replace(/\s+/g, "-");

                    return (
                      <DropdownMenuItem key={city.id} asChild>
                        <Link
                          href={`/utah/${slug}`}
                          className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                        >
                          {city.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white font-semibold text-base hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  {t("volunteer")}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href="/volunteer"
                    className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                  >
                    {t("volunteer_menu")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/days-of-service"
                    className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                  >
                    {t("days_of_service")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="classes"
              className="text-white font-semibold text-base hover:text-white/80 transition-colors"
            >
              {t("classes")}
            </Link>

            <Link
              href="/what-we-do"
              className="text-white font-semibold text-base hover:text-white/80 transition-colors"
            >
              {t("what_we_do")}
            </Link>

            {/* Auth: Show user menu if logged in, login link if not */}
            {!isLoading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white font-semibold text-base hover:text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user.first_name || "Account"}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="bg-white border shadow-lg"
                  align="end"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 font-medium hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/login"
                className="text-white font-semibold text-base hover:text-white/80 transition-colors"
              >
                {t("login")}
              </Link>
            )}

            {/* {process.env.NEXT_PUBLIC_ENVIRONMENT === "development" && ( */}
            <LanguageSwitcher />
            {/* )} */}
          </nav>
        </div>
      </div>
    </header>
  );
}
