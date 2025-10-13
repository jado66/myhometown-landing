import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Clock, Award } from "lucide-react";

export function VolunteerSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-stone-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Why Volunteer with Us?
            </h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-3xl mx-auto">
              Join a community of dedicated volunteers making a real difference
              in neighborhoods across Utah
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Make a Real Impact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  See the direct results of your work through hands-on projects
                  that transform neighborhoods and help families in need.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Build Connections</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Meet like-minded neighbors and create lasting friendships
                  while working together toward common goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Flexible Schedule</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose from various service opportunities that fit your
                  availability, from single-day events to ongoing projects.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Experience Needed</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All tools, training, and guidance provided. Just bring your
                  energy and willingness to serve.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg mb-6 text-primary-foreground/90 max-w-2xl mx-auto">
              Sign up for an upcoming Day of Service and experience the joy of
              giving back to your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="font-semibold">
                Browse Upcoming Events
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Learn More About Volunteering
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground font-medium">
                Active Volunteers
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground font-medium">
                Events This Year
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                10,000+
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Hours Served
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
