import { MainLayout } from "@/layout/main-layout";
import { HeroSection } from "@/components/landing/hero-section";
import { CRCFinderSection } from "@/components/landing/crc-finder-section";
import { StatsSection } from "@/components/landing/stats-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CTASection } from "@/components/landing/cta-section";
import Container from "@/layout/container";
import PatternBackground from "@/components/ui/pattern-background";
import { PopularClassesSection } from "@/components/landing/popular-classes-section";

export default function HomePage() {
  return (
    <MainLayout>
      <Container>
        <HeroSection />

        <CRCFinderSection />
        <StatsSection />
        {/* <PopularClassesSection /> */}
        <FeaturesSection />
        <CTASection />
      </Container>
    </MainLayout>
  );
}
