import { Button } from "@/components/ui/button";
import Link from "next/link";
import PatternBackground from "../ui/pattern-background";
import { getNamespaceT } from "@/i18n/server";

export async function CTASection() {
  const { t } = await getNamespaceT("home.cta");
  return (
    <section className="">
      <PatternBackground
        patternSize={55}
        opacity={1}
        color="#2c863eff"
        backgroundColor="#257936ff"
        className="h-full  py-16 md:py-24 text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            {t("heading")}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-pretty font-bold">
            {t("body")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#318d43] hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Link href="/volunteer">{t("button")}</Link>
            </Button>
          </div>
        </div>
      </PatternBackground>
    </section>
  );
}
