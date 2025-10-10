import { VolunteerForm } from "@/components/volunteer/volunteer-form";
import Container from "@/layout/container";
import { MainLayout } from "@/layout/main-layout";
import { Heart, Users, Home } from "lucide-react";

export default function VolunteerPage() {
  return (
    <MainLayout>
      <Container>
        <div className="min-h-screen bg-background">
          {/* Hero Section */}
          <section className="bg-primary text-primary-foreground py-16 px-4 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Join the myHometown Movement
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 mb-6 text-pretty leading-relaxed">
                Become part of a community dedicated to strengthening Utah
                neighborhoods through service, partnership, and action.
              </p>
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Make an Impact</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">Build Community</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">
                    Strengthen Neighborhoods
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-3 text-foreground">
                  Volunteer Registration
                </h2>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  Complete the form below to join our volunteer network. We'll
                  match you with opportunities that fit your interests and
                  availability.
                </p>
              </div>
              <VolunteerForm />
            </div>
          </section>
        </div>
      </Container>
    </MainLayout>
  );
}
