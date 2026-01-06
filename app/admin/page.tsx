"use client";

import Link from "next/link";
import {
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  FolderOpen,
  MapPin,
  BookOpen,
  Settings,
  MessageSquare,
  HandHeart,
  Calendar,
  Hammer,
  Loader2,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCurrentUser,
  hasPermission,
  hasAnyPermission,
} from "@/hooks/use-current-user";
import type { UserPermissions } from "@/types/user";

interface AdminSection {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
  // Permission required to see this section
  // "any" means any authenticated user can see it
  // "administrator" means only admins
  // specific permission key checks that permission
  requiredPermission?: keyof UserPermissions | "any";
}

const adminSections: AdminSection[] = [
  // Management Section - Administrator only
  {
    title: "User Management",
    description: "Add, edit, and manage user accounts and roles",
    href: "/admin/users",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    requiredPermission: "administrator",
  },
  {
    title: "Manage CRCs",
    description: "Manage Community Resource Centers",
    href: "/admin/manage-crcs",
    icon: MapPin,
    color: "bg-rose-500/10 text-rose-600",
    requiredPermission: "content_development",
  },
  {
    title: "Site Statistics",
    description: "Manage homepage statistics and metrics",
    href: "/admin/site-stats",
    icon: BarChart3,
    color: "bg-cyan-500/10 text-cyan-600",
    requiredPermission: "content_development",
  },

  // Classes Section
  {
    title: "Class Management",
    description: "Create and manage resource center classes",
    href: "/admin/class-management",
    icon: GraduationCap,
    color: "bg-green-500/10 text-green-600",
    requiredPermission: "classes_admin",
  },
  {
    title: "View Classes",
    description: "Browse and view all scheduled classes",
    href: "/admin/view-classes",
    icon: BookOpen,
    color: "bg-purple-500/10 text-purple-600",
    requiredPermission: "any",
  },

  // Days of Service
  {
    title: "Days of Service",
    description: "Manage service projects and volunteer activities",
    href: "/admin/days-of-service",
    icon: Hammer,
    color: "bg-amber-500/10 text-amber-600",
    requiredPermission: "dos_admin",
  },

  // Missionaries & Volunteers
  {
    title: "Missionaries & Volunteers",
    description: "Manage missionary and volunteer information",
    href: "/admin/missionaries",
    icon: HandHeart,
    color: "bg-pink-500/10 text-pink-600",
    requiredPermission: "missionary_volunteer_management",
  },

  // Texting & Communications
  {
    title: "Texting & Communications",
    description: "Send and manage text message campaigns",
    href: "/admin/texting",
    icon: MessageSquare,
    color: "bg-indigo-500/10 text-indigo-600",
    requiredPermission: "texting",
  },

  // Reports - Administrator only
  {
    title: "Reports",
    description: "Generate and view reports and analytics",
    href: "/admin/reports",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-600",
    requiredPermission: "administrator",
  },

  // File Storage - Administrator or content development
  {
    title: "File Storage",
    description: "Manage uploaded files and documents",
    href: "/admin/drive",
    icon: FolderOpen,
    color: "bg-teal-500/10 text-teal-600",
    requiredPermission: "content_development",
  },

  // Training - Available to all authenticated users
  {
    title: "Training",
    description: "Access training materials and resources",
    href: "/admin/training",
    icon: Settings,
    color: "bg-slate-500/10 text-slate-600",
    requiredPermission: "any",
  },
];

function AdminDashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <Skeleton className="h-4 w-32 mx-auto mb-4" />
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-3">
              <Skeleton className="w-12 h-12 rounded-lg mb-3" />
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotAuthenticatedState() {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the admin dashboard.
        </p>
        <Link href="/login">
          <Button size="lg">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!user) {
    return <NotAuthenticatedState />;
  }

  // Filter sections based on user permissions
  const visibleSections = adminSections.filter((section) => {
    if (!section.requiredPermission || section.requiredPermission === "any") {
      return true;
    }
    return hasPermission(user, section.requiredPermission);
  });

  const userName = user.first_name
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : user.email;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
          Administration
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Welcome back, {userName}
        </p>
      </div>

      {visibleSections.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            You don&apos;t have access to any admin sections. Please contact
            your administrator for access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href}>
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${section.color} transition-transform group-hover:scale-110`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
