"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  FileText,
  Video,
  Presentation,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";

const categoryData = {
  onboarding: {
    title: "Onboarding",
    description: "Essential materials for new team members to get started",
    materials: [
      {
        slug: "welcome-guide",
        title: "Welcome Guide",
        description: "Complete onboarding guide for new team members",
        type: "PDF",
        icon: FileText,
      },
      {
        slug: "brand-assets",
        title: "Brand Assets",
        description: "Logo files, color palettes, and brand guidelines",
        type: "Images",
        icon: ImageIcon,
      },
      {
        slug: "company-handbook",
        title: "Company Handbook",
        description: "Policies, benefits, and company culture guide",
        type: "PDF",
        icon: FileText,
      },
      {
        slug: "first-week-checklist",
        title: "First Week Checklist",
        description: "Step-by-step guide for your first week",
        type: "PDF",
        icon: FileText,
      },
    ],
  },
  "product-knowledge": {
    title: "Product Knowledge",
    description: "Learn about our products and services",
    materials: [
      {
        slug: "product-demo",
        title: "Product Demo",
        description: "Comprehensive product walkthrough and features",
        type: "Video",
        icon: Video,
      },
      {
        slug: "sales-presentation",
        title: "Sales Presentation",
        description: "Master sales deck and pitch guidelines",
        type: "PPT",
        icon: Presentation,
      },
      {
        slug: "quarterly-review",
        title: "Q4 Review",
        description: "Quarterly performance review and insights",
        type: "PPT",
        icon: Presentation,
      },
    ],
  },
  "technical-skills": {
    title: "Technical Skills",
    description: "Develop your technical expertise",
    materials: [
      {
        slug: "coding-standards",
        title: "Coding Standards",
        description: "Best practices and coding guidelines",
        type: "PDF",
        icon: FileText,
      },
      {
        slug: "api-tutorial",
        title: "API Tutorial",
        description: "Complete guide to our API",
        type: "Video",
        icon: Video,
      },
    ],
  },
  compliance: {
    title: "Compliance",
    description: "Required compliance training materials",
    materials: [
      {
        slug: "security-training",
        title: "Security Training",
        description: "Essential security practices and protocols",
        type: "Video",
        icon: Video,
      },
      {
        slug: "security-policy",
        title: "Security Policy",
        description: "Company security policies and procedures",
        type: "PDF",
        icon: FileText,
      },
    ],
  },
};

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryInfo = categoryData[category as keyof typeof categoryData];

  if (!categoryInfo) {
    notFound();
  }

  return <CategoryPageClient category={category} categoryInfo={categoryInfo} />;
}

function CategoryPageClient({
  category,
  categoryInfo,
}: {
  category: string;
  categoryInfo: (typeof categoryData)[keyof typeof categoryData];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [completedMaterials, setCompletedMaterials] = useState<
    Record<string, boolean>
  >({});

  // Load completion status from localStorage
  useEffect(() => {
    const completed: Record<string, boolean> = {};
    categoryInfo.materials.forEach((material) => {
      const key = `training-material-${material.slug}-completed`;
      const value = localStorage.getItem(key);
      completed[material.slug] = value === "true";
    });
    setCompletedMaterials(completed);
  }, [categoryInfo.materials]);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return categoryInfo.materials;

    const query = searchQuery.toLowerCase();
    return categoryInfo.materials.filter(
      (material) =>
        material.title.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.type.toLowerCase().includes(query)
    );
  }, [searchQuery, categoryInfo.materials]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/admin/training">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Materials
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {categoryInfo.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {categoryInfo.description}
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${categoryInfo.title.toLowerCase()} materials...`}
              className="pl-10 h-12 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
              Found {filteredMaterials.length}{" "}
              {filteredMaterials.length === 1 ? "result" : "results"} for "
              {searchQuery}"
            </p>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      <main className="container mx-auto px-4 py-12">
        {filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => {
              const Icon = material.icon;
              const isCompleted = completedMaterials[material.slug];
              return (
                <Link
                  key={material.slug}
                  href={`/admin/training/materials/${material.slug}`}
                >
                  <Card
                    className={`hover:shadow-lg transition-shadow cursor-pointer h-full ${
                      isCompleted ? "!border-[#1a8a2f] border-2" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{material.type}</Badge>
                        </div>
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                        ) : (
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <CardTitle className="text-lg mt-3">
                        {material.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{material.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-12">
            <div className="text-center space-y-3">
              <Search className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">
                No materials found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
