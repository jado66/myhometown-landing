import { HeroSection } from "@/components/landing/hero-section";
import { CRCFinderSection } from "@/components/landing/crc-finder-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import { Container } from "@/layout/container";
import { DaysOfServiceSection } from "@/components/landing/days-of-service";

export default function HomePage() {
  return (
    <Container>
      <HeroSection />

      <CRCFinderSection />
      <StatsSection />
      {/* <PopularClassesSection /> */}
      <FeaturesSection />
      <DaysOfServiceSection />
      <CTASection />
    </Container>
  );
}
