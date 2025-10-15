import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getNamespaceT } from "@/i18n/server";

export async function HeroSection() {
  const { t } = await getNamespaceT("home.hero");

  return (
    <section className="relative">
      {/* Video Background - Smaller height */}
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/834c2c3b-38ae-4e87-9a1d-8b4f9ced2d1c-Banner+2+MHT+3440X1000+w+text.m4v"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Content - Now below the video */}
      <div className="bg-white px-4 py-12 md:py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance">
            {t("title_part1")}{" "}
            <span style={{ color: "#318d43" }}>myHometown</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-pretty">
            {t("subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#318d43] hover:bg-[#246340] text-white text-lg px-8 py-6"
            >
              <Link href="/volunteer">{t("volunteer_cta")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-[#318d43] text-[#318d43] hover:bg-[#318d43] hover:text-white text-lg px-8 py-6"
            >
              <Link href="/classes">{t("classes_cta")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
