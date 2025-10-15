import { HeroSection } from "@/components/landing/hero-section";
import { CRCFinderSection } from "@/components/landing/crc-finder-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { Container } from "@/layout/container";
import { DaysOfServiceSection } from "@/components/landing/days-of-service";
import { fetchCRCsServer } from "@/lib/crcs";

export default async function HomePage() {
  const crcs = await fetchCRCsServer();

  return (
    <Container>
      <HeroSection />

      <CRCFinderSection crcs={crcs} />
      <StatsSection />
      {/* <PopularClassesSection /> */}
      <FeaturesSection />
      <DaysOfServiceSection />
      <CTASection />
    </Container>
  );
}
