"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

const cities = [
  { name: "Layton", slug: "layton" },
  { name: "Ogden", slug: "ogden" },
  { name: "Orem", slug: "orem" },
  { name: "Provo", slug: "provo" },
  { name: "Salt Lake City", slug: "salt-lake-city" },
  { name: "Santaquin", slug: "santaquin" },
  { name: "West Valley City", slug: "west-valley-city" },
]

export function MobileNav({ open, onClose }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="top" className="bg-[#1b75bc]">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="cities" className="border-none">
              <AccordionTrigger className="text-white font-semibold text-lg hover:no-underline hover:text-white/80">
                Our Cities
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 pl-4">
                  {cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/utah/${city.slug}`}
                      onClick={onClose}
                      className="text-white/90 font-medium hover:text-white py-2"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Link href="#classes" onClick={onClose} className="text-white font-semibold text-lg hover:text-white/80 py-2">
            Find Classes
          </Link>

          <Link
            href="/what-we-do"
            onClick={onClose}
            className="text-white font-semibold text-lg hover:text-white/80 py-2"
          >
            What We Do
          </Link>

          <Link href="/login" onClick={onClose} className="text-white font-semibold text-lg hover:text-white/80 py-2">
            Login
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
