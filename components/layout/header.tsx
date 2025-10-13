"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";
import { MyHometownLogo } from "../logo/my-hometown";
import { CitySelectOption } from "@/lib/cities";

interface HeaderProps {
  onMobileMenuOpen: () => void;
  cities: CitySelectOption[];
}

export function Header({ onMobileMenuOpen, cities }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1b75bc] shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <MyHometownLogo type="header-full" size={36} />
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuOpen}
            className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white font-semibold text-base hover:text-white/80 hover:bg-white/10 transition-colors"
                >
                  Our Cities
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
                  Volunteer
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link
                    href="/volunteer"
                    className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                  >
                    Volunteer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/days-of-service"
                    className="text-gray-900 font-medium hover:bg-gray-100 cursor-pointer"
                  >
                    Days of Service
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="classes"
              className="text-white font-semibold text-base hover:text-white/80 transition-colors"
            >
              Find Classes
            </Link>

            <Link
              href="/what-we-do"
              className="text-white font-semibold text-base hover:text-white/80 transition-colors"
            >
              What We Do
            </Link>

            <Link
              href="/login"
              className="text-white font-semibold text-base hover:text-white/80 transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
