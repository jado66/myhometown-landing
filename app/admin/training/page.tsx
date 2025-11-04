"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  Video,
  ImageIcon,
  Presentation,
  Search,
  CheckCircle2,
} from "lucide-react";

const trainingMaterials = [
  {
    slug: "welcome-guide",
    title: "Welcome Guide",
    description: "Complete onboarding guide for new team members",
    type: "PDF",
    category: "Onboarding",
    icon: FileText,
  },
  {
    slug: "product-demo",
    title: "Product Demo",
    description: "Comprehensive product walkthrough and features",
    type: "Video",
    category: "Product Knowledge",
    icon: Video,
  },
  {
    slug: "sales-presentation",
    title: "Sales Presentation",
    description: "Master sales deck and pitch guidelines",
    type: "PPT",
    category: "Product Knowledge",
    icon: Presentation,
  },
  {
    slug: "brand-assets",
    title: "Brand Assets",
    description: "Logo files, color palettes, and brand guidelines",
    type: "Images",
    category: "Onboarding",
    icon: ImageIcon,
  },
  {
    slug: "security-training",
    title: "Security Training",
    description: "Essential security practices and protocols",
    type: "Video",
    category: "Compliance",
    icon: Video,
  },
  {
    slug: "quarterly-review",
    title: "Q4 Review",
    description: "Quarterly performance review and insights",
    type: "PPT",
    category: "Product Knowledge",
    icon: Presentation,
  },
];

const categories = [
  {
    slug: "onboarding",
    title: "Onboarding",
    description: "Essential materials for new team members",
    icon: BookOpen,
    count: 12,
    color: "primary",
  },
  {
    slug: "product-knowledge",
    title: "Product Knowledge",
    description: "Learn about our products and services",
    icon: Presentation,
    count: 8,
    color: "accent",
  },
  {
    slug: "technical-skills",
    title: "Technical Skills",
    description: "Develop your technical expertise",
    icon: Video,
    count: 15,
    color: "primary",
  },
  {
    slug: "compliance",
    title: "Compliance",
    description: "Required compliance training materials",
    icon: FileText,
    count: 6,
    color: "accent",
  },
];

export default function TrainingMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [completedMaterials, setCompletedMaterials] = useState<
    Record<string, boolean>
  >({});

  // Load completion status from localStorage
  useEffect(() => {
    const completed: Record<string, boolean> = {};
    trainingMaterials.forEach((material) => {
      const key = `training-material-${material.slug}-completed`;
      const value = localStorage.getItem(key);
      completed[material.slug] = value === "true";
    });
    setCompletedMaterials(completed);
  }, []);

  const filteredMaterials = useMemo(() => {
    if (!searchQuery.trim()) return trainingMaterials;

    const query = searchQuery.toLowerCase();
    return trainingMaterials.filter(
      (material) =>
        material.title.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query) ||
        material.type.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Training Materials
              </h1>
              <p className="text-muted-foreground mt-1">
                Access all your learning resources in one place
              </p>
            </div>
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
              placeholder="Search training materials..."
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!searchQuery && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.slug}
                    href={`/admin/training/${category.slug}`}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-${category.color}/10`}
                          >
                            <Icon
                              className={`h-6 w-6 text-${category.color}`}
                            />
                          </div>
                          <CardTitle className="text-lg">
                            {category.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {category.description}
                        </CardDescription>
                        <Badge variant="secondary" className="mt-3">
                          {category.count} resources
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent/Search Results */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-foreground">
            {searchQuery ? "Search Results" : "Recent Materials"}
          </h2>
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
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">
                          {material.title}
                        </CardTitle>
                        <CardDescription>
                          {material.description}
                        </CardDescription>
                      </CardHeader>
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
                  Try adjusting your search terms or browse by category
                </p>
              </div>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
