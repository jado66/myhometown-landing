"use client";

import { VolunteerForm } from "@/components/volunteer/volunteer-form";
import {
  Heart,
  Users,
  Home,
  Clock,
  MapPin,
  Award,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/layout/container";
import PatternBackground from "@/components/ui/pattern-background";
import { useEffect, useRef, useState } from "react";

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div ref={ref} className="text-5xl font-bold">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

export default function VolunteerPage() {
  return (
    <Container>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <PatternBackground
          patternSize={55}
          opacity={1}
          color="#2c863eff"
          backgroundColor="#257936ff"
          id="volunteer-hero"
        >
          <section className="relative text-white py-20 px-4 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
                  Join the myHometown Initiative
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 text-pretty leading-relaxed max-w-3xl mx-auto">
                  Become part of a community dedicated to strengthening Utah
                  neighborhoods through service, partnership, and action.
                </p>

                <div className="grid grid-cols-3  gap-8 mt-16 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Heart className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      Make an Impact
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Users className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      Build Community
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center backdrop-blur-sm">
                      <Home className="w-8 h-8" />
                    </div>
                    <span className="text-base font-medium">
                      Strengthen Neighborhoods
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
              <ChevronDown className="w-6 h-6 text-primary-foreground/60" />
            </div>
          </section>
        </PatternBackground>

        {/* What You'll Do Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-foreground text-balance">
                  What You'll Do as a Volunteer
                </h2>
                <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-3xl mx-auto">
                  Choose from a variety of meaningful opportunities that fit
                  your schedule and interests
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Community Events
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Help organize and run neighborhood gatherings, festivals,
                      and community celebrations
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Home className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Neighborhood Projects
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Participate in beautification projects, park cleanups, and
                      community improvement initiatives
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Heart className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Support Services
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Assist neighbors in need with tasks like yard work, meal
                      delivery, or companionship
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <MapPin className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Local Outreach
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Connect with residents, share resources, and help build
                      stronger neighborhood networks
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Award className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Youth Programs
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Mentor young people, lead activities, and help create
                      positive experiences for kids
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Clock className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      Flexible Opportunities
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      One-time events, ongoing commitments, or virtual
                      volunteering - choose what works for you
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Statistics */}

        <section className="py-16 px-4  bg-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2">
                  <AnimatedNumber value={500} suffix="+" />
                  <div className="text-lg font-bold text-muted-foreground">
                    Active Volunteers
                  </div>
                </div>
                <div className="space-y-2">
                  <AnimatedNumber value={10000} suffix="+" />
                  <div className="text-lg font-bold text-muted-foreground">
                    Hours Served
                  </div>
                </div>
                <div className="space-y-2">
                  <AnimatedNumber value={50} suffix="+" />
                  <div className="text-lg font-bold text-muted-foreground">
                    Neighborhoods Helped
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="volunteer-form" className="py-20 px-4 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center">
                <h2 className="text-4xl font-bold mb-4 text-foreground text-balance">
                  Ready to Make a Difference?
                </h2>
                <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                  Complete the form below to join our volunteer network. We'll
                  match you with opportunities that fit your interests and
                  availability.
                </p>
              </div>
              <Card className="border-2">
                <CardContent className="p-8">
                  <VolunteerForm />
                </CardContent>
              </Card>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p className="text-pretty leading-relaxed">
                  After signing up, you'll receive a welcome email with next
                  steps and information about upcoming volunteer opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}

        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-balance">
                  Hear from Our Volunteers
                </h2>
                <p className="text-lg font-bold text-pretty leading-relaxed">
                  Real stories from people making a difference in their
                  communities
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex flex-col items-center text-center mb-6">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwgu1A5zgPSvfE83nurkuzNEoXs9DMNr8Ww&s"
                        alt="Sarah Martinez"
                        className="w-24 h-24 rounded-full object-cover mb-6 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          Sarah Martinez
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Volunteer since 2023
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed italic text-center transition-colors">
                      "Volunteering with myHometown has been incredibly
                      rewarding. I've met amazing neighbors and helped make our
                      community stronger."
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex flex-col items-center text-center mb-6">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC8kiSH5ZSAcVoj3tAQQDoP_ux0sSricMyUg&s"
                        alt="James Chen"
                        className="w-24 h-24 rounded-full object-cover mb-6 group-hover:scale-105 transition-transform"
                      />

                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          James Chen
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Volunteer since 2022
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed italic text-center transition-colors">
                      "The flexibility is perfect for my schedule. I can
                      volunteer when it works for me, and every opportunity
                      feels meaningful."
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-2 hover:border-primary/20">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex flex-col items-center text-center mb-6">
                      <img
                        src="https://media.istockphoto.com/id/1437816897/photo/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring.jpg?s=612x612&w=0&k=20&c=tyLvtzutRh22j9GqSGI33Z4HpIwv9vL_MZw_xOE19NQ="
                        alt="Emily Rodriguez"
                        className="w-24 h-24 rounded-full object-cover mb-6 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          Emily Rodriguez
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Volunteer since 2021
                        </div>
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed italic text-center transition-colors">
                      "I love seeing the direct impact of my work. From park
                      cleanups to helping elderly neighbors, every moment
                      counts."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}
