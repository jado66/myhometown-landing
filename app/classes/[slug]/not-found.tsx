import { Container } from "@/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <Container>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <MapPin className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">Location Not Found</CardTitle>
            <CardDescription>
              The Community Resource Center you&apos;re looking for doesn&apos;t exist or
              may have been moved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Please check the URL or browse all available locations to find the
              classes you&apos;re looking for.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/classes">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse All Locations
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
