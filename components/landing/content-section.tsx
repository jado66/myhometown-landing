import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ContentSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Revitalizing Neighborhoods Through Service
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                My Hometown is a community service effort launched around 2020
                to strengthen neighborhoods through cooperative partnerships.
                Working with local governments, faith-based organizations,
                businesses, non-profits, and residents, we coordinate volunteer
                projects from April to October.
              </p>
              <p>
                Our program provides service project listings including
                clean-ups, yard work, and home repairs, along with volunteer
                sign-ups and neighborhood-focused tools.
              </p>
              <p>
                We also offer resources like classes at community resource
                centers, helping improve living conditions, expand access to
                services, and foster connected, welcoming communities across
                Utah.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-6 bg-[#318d43] hover:bg-[#246340] text-white"
            >
              <Link href="/what-we-do">Learn More</Link>
            </Button>
          </div>

          {/* Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/iStock-1164938630.jpg"
              alt="Volunteers working together in the community"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
