"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Download,
  FileText,
  Video,
  Presentation,
  ImageIcon,
  Clock,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { PDFViewer } from "@/components/training/pdf-viewer";
import { VideoPlayer } from "@/components/training/video-player";
import { PPTViewer } from "@/components/training/ppt-viewer";
import { ImageGallery } from "@/components/training/image-gallery";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { use, useState, useEffect } from "react";

// Hardcoded training materials data
const trainingMaterials = {
  "welcome-guide": {
    title: "Welcome Guide",
    description:
      "Complete onboarding guide for new team members covering company culture, policies, and getting started resources.",
    type: "pdf",
    category: "Onboarding",
    duration: "15 min read",
    lastUpdated: "October 15, 2024",
    s3Key: "Training Materials/sample-local-pdf (1).pdf",
    relatedMaterials: ["company-handbook", "first-week-checklist"],
  },
  "product-demo": {
    title: "Product Demo",
    description:
      "Comprehensive product walkthrough covering all features, use cases, and best practices for customer demonstrations.",
    type: "video",
    category: "Product Knowledge",
    duration: "25 minutes",
    lastUpdated: "November 1, 2024",
    s3Key: "videos/Banner 2 MHT 3440X1000.webm",
    relatedMaterials: ["product-features", "customer-stories"],
  },
  "sales-presentation": {
    title: "Sales Presentation",
    description:
      "Master sales deck with pitch guidelines, objection handling, and closing techniques for enterprise clients.",
    type: "ppt",
    category: "Product Knowledge",
    duration: "30 slides",
    lastUpdated: "October 28, 2024",
    s3Key: "Training Materials/Dickinson_Sample_Slides.pptx",
    relatedMaterials: ["sales-playbook", "pricing-guide"],
  },
  "brand-assets": {
    title: "Brand Assets",
    description:
      "Complete collection of logo files, color palettes, typography guidelines, and brand usage examples.",
    type: "images",
    category: "Onboarding",
    duration: "12 assets",
    lastUpdated: "September 20, 2024",
    s3Keys: [
      "training/brand/logo-primary.png",
      "training/brand/logo-secondary.png",
      "training/brand/color-palette.png",
      "training/brand/typography.png",
    ],
    relatedMaterials: ["brand-guidelines", "marketing-templates"],
  },
  "security-training": {
    title: "Security Training",
    description:
      "Essential security practices, password management, phishing awareness, and data protection protocols.",
    type: "video",
    category: "Compliance",
    duration: "18 minutes",
    lastUpdated: "November 5, 2024",
    s3Key: "training/security-training.mp4",
    relatedMaterials: ["security-policy", "incident-response"],
  },
  "quarterly-review": {
    title: "Q4 Review",
    description:
      "Quarterly performance review covering key metrics, achievements, challenges, and strategic initiatives.",
    type: "ppt",
    category: "Product Knowledge",
    duration: "45 slides",
    lastUpdated: "October 1, 2024",
    s3Key: "training/q4-review.pptx",
    relatedMaterials: ["annual-goals", "team-objectives"],
  },
};

export default function MaterialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const material = trainingMaterials[slug as keyof typeof trainingMaterials];

  const [isCompleted, setIsCompleted] = useLocalStorage<boolean>(
    `training-material-${slug}-completed`,
    false
  );

  const [completedMaterials, setCompletedMaterials] = useState<
    Record<string, boolean>
  >({});

  const [signedUrl, setSignedUrl] = useState<string>("");
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loadingUrl, setLoadingUrl] = useState(true);

  // Load completion status for related materials
  useEffect(() => {
    if (material?.relatedMaterials) {
      const completed: Record<string, boolean> = {};
      material.relatedMaterials.forEach((relatedSlug) => {
        const key = `training-material-${relatedSlug}-completed`;
        const value = localStorage.getItem(key);
        completed[relatedSlug] = value === "true";
      });
      setCompletedMaterials(completed);
    }
  }, [material]);

  // Fetch signed URL(s) when component mounts
  useEffect(() => {
    const fetchSignedUrls = async () => {
      if (!material) return;

      setLoadingUrl(true);
      try {
        if ("s3Key" in material && material.s3Key) {
          // Single file
          const response = await fetch(
            `/api/s3/signed-url?key=${encodeURIComponent(material.s3Key)}`
          );
          if (response.ok) {
            const data = await response.json();
            setSignedUrl(data.url);
          }
        } else if ("s3Keys" in material && material.s3Keys) {
          // Multiple files (images)
          const urls = await Promise.all(
            material.s3Keys.map(async (key) => {
              const response = await fetch(
                `/api/s3/signed-url?key=${encodeURIComponent(key)}`
              );
              if (response.ok) {
                const data = await response.json();
                return data.url;
              }
              return "";
            })
          );
          setSignedUrls(urls.filter((url) => url !== ""));
        }
      } catch (error) {
        console.error("Error fetching signed URLs:", error);
      } finally {
        setLoadingUrl(false);
      }
    };

    fetchSignedUrls();
  }, [material]);

  if (!material) {
    notFound();
  }

  const handleDownload = async () => {
    if (!signedUrl) return;

    try {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = material.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "ppt":
        return <Presentation className="h-5 w-5" />;
      case "images":
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const renderContent = () => {
    if (loadingUrl) {
      return (
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      );
    }

    switch (material.type) {
      case "pdf":
        return signedUrl ? <PDFViewer url={signedUrl} /> : null;
      case "video":
        return signedUrl ? <VideoPlayer url={signedUrl} /> : null;
      case "ppt":
        return signedUrl ? <PPTViewer url={signedUrl} /> : null;
      case "images":
        return signedUrls.length > 0 ? (
          <ImageGallery urls={signedUrls} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/training">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Materials
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getIcon(material.type)}
                  {material.type.toUpperCase()}
                </Badge>
                <Badge variant="outline">{material.category}</Badge>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-3">
                {material.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {material.description}
              </p>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">{renderContent()}</CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Material Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{material.duration}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Updated {material.lastUpdated}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed"
                    checked={isCompleted}
                    onCheckedChange={(checked) =>
                      setIsCompleted(checked === true)
                    }
                  />
                  <label
                    htmlFor="completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Mark as completed
                  </label>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDownload}
                  disabled={!signedUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {material.relatedMaterials &&
                  material.relatedMaterials.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3 text-foreground">
                          Related Materials
                        </h3>
                        <div className="space-y-2">
                          {material.relatedMaterials.map((relatedSlug) => {
                            const related =
                              trainingMaterials[
                                relatedSlug as keyof typeof trainingMaterials
                              ];
                            if (!related) return null;
                            const isRelatedCompleted =
                              completedMaterials[relatedSlug];
                            return (
                              <Link
                                key={relatedSlug}
                                href={`/admin/training/materials/${relatedSlug}`}
                              >
                                <Card
                                  className={`hover:shadow-lg transition-all cursor-pointer ${
                                    isRelatedCompleted
                                      ? "!border-[#1a8a2f] border-2"
                                      : ""
                                  }`}
                                >
                                  <CardHeader className="p-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <CardTitle className="text-sm font-medium text-foreground">
                                        {related.title}
                                      </CardTitle>
                                      {isRelatedCompleted && (
                                        <CheckCircle2 className="h-4 w-4 text-[#10b981] flex-shrink-0" />
                                      )}
                                    </div>
                                    <CardDescription className="text-xs mt-1">
                                      {related.category}
                                    </CardDescription>
                                  </CardHeader>
                                </Card>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
