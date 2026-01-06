"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserPermissions } from "@/types/user";

// Type for user with required fields for permission checking
type UserWithPermissions = {
  id: string;
  email: string;
  permissions: UserPermissions;
  first_name?: string;
  last_name?: string;
  cities?: string[];
  communities?: string[];
};

import {
  Users,
  Building2,
  MapPin,
  UserCheck,
  Clock,
  Phone,
  Send,
  CalendarClock,
  FileText,
  GraduationCap,
  Calendar,
  Bug,
  Lightbulb,
  UserCog,
  Kanban,
  AlertCircle,
  Upload,
  ChevronRight,
  LayoutDashboard,
  Menu,
  ExternalLink,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Pin,
  PinOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";
const SIDEBAR_DEFAULT_PINNED = true; // Sidebar is pinned (not collapsed) by default

// Local permission check helper
function checkSinglePermission(
  user: UserWithPermissions | null,
  permission: keyof UserPermissions
): boolean {
  if (!user) return false;
  // Administrators have all permissions
  if (user.permissions.administrator) return true;
  return user.permissions[permission] === true;
}

// Permission check helper - supports "||" for OR conditions
function checkPermission(
  user: UserWithPermissions | null,
  requiredPermission?: string
): boolean {
  if (!user) return false;
  if (!requiredPermission || requiredPermission === "any") return true;

  // Handle OR conditions like "administrator || content_development"
  if (requiredPermission.includes("||")) {
    const permissions = requiredPermission.split("||").map((p) => p.trim());
    return permissions.some((perm) =>
      checkSinglePermission(user, perm as keyof UserPermissions)
    );
  }

  return checkSinglePermission(
    user,
    requiredPermission as keyof UserPermissions
  );
}

interface NavPage {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiredPermission?: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  id: string;
  requiredPermission?: string;
  pages: NavPage[];
}

const getNavSections = (): NavSection[] => {
  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  return [
    {
      title: "Management",
      id: "management-pages",
      requiredPermission: "administrator || content_development",
      pages: [
        {
          title: "User Management",
          href: "/admin/users",
          icon: Users,
          requiredPermission: "administrator",
        },
        {
          title: "City Management",
          href: rootUrl + "/admin-dashboard/cities",
          icon: Building2,
          requiredPermission: "content_development",
          external: !!rootUrl,
        },
        {
          title: "Community Management",
          href: rootUrl + "/admin-dashboard/communities",
          icon: MapPin,
          requiredPermission: "content_development",
          external: !!rootUrl,
        },
      ],
    },
    {
      title: "Missionaries & Volunteers",
      id: "missionary-volunteer-pages",
      requiredPermission: "missionary_volunteer_management",
      pages: [
        {
          title: "Roster",
          href: rootUrl + "/admin-dashboard/missionaries",
          icon: UserCheck,
          requiredPermission: "missionary_volunteer_management",
          external: !!rootUrl,
        },
        {
          title: "Log Service Hours",
          href: rootUrl + "/admin-dashboard/log-hours",
          icon: Clock,
          external: !!rootUrl,
        },
      ],
    },
    {
      title: "Texting",
      id: "texting-pages",
      requiredPermission: "texting",
      pages: [
        {
          title: "Contact Directory",
          href: rootUrl + "/admin-dashboard/texting/directory",
          icon: Phone,
          requiredPermission: "texting",
          external: !!rootUrl,
        },
        {
          title: "Send Messages",
          href: rootUrl + "/admin-dashboard/texting/send",
          icon: Send,
          requiredPermission: "texting",
          external: !!rootUrl,
        },
        {
          title: "Scheduled Messages",
          href: rootUrl + "/admin-dashboard/texting/scheduled-messages",
          icon: CalendarClock,
          requiredPermission: "texting",
          external: !!rootUrl,
        },
        {
          title: "Texting Logs",
          href: rootUrl + "/admin-dashboard/texting/logs",
          icon: FileText,
          requiredPermission: "texting",
          external: !!rootUrl,
        },
      ],
    },
    {
      title: "Tools",
      id: "tools-pages",
      requiredPermission: "any",
      pages: [
        {
          title: "Classes and Rolls",
          href: rootUrl + "/admin-dashboard/classes",
          icon: GraduationCap,
          external: !!rootUrl,
        },
        {
          title: "Days Of Service",
          href: rootUrl + "/admin-dashboard/days-of-service",
          icon: Calendar,
          external: !!rootUrl,
        },
      ],
    },
    {
      title: "Support",
      id: "support-pages",
      requiredPermission: "any",
      pages: [
        {
          title: "Bug Report",
          href: rootUrl + "/bug-report",
          icon: Bug,
          requiredPermission: "any",
          external: !!rootUrl,
        },
        {
          title: "Request a Feature",
          href: rootUrl + "/feature-request",
          icon: Lightbulb,
          requiredPermission: "any",
          external: !!rootUrl,
        },
      ],
    },
    {
      title: "Development Tools",
      id: "dev-tools-pages",
      requiredPermission: "administrator",
      pages: [
        {
          title: "Impersonate User",
          href: rootUrl + "/admin-dashboard/impersonate",
          icon: UserCog,
          external: !!rootUrl,
        },
        {
          title: "Development Board",
          href: rootUrl + "/admin-dashboard/tasks",
          icon: Kanban,
          external: !!rootUrl,
        },
        {
          title: "Bugs and Feature Requests",
          href: rootUrl + "/admin-dashboard/bugs-and-features",
          icon: AlertCircle,
          external: !!rootUrl,
        },
        {
          title: "Upload Media",
          href: rootUrl + "/admin-dashboard/tools/media-upload",
          icon: Upload,
          external: !!rootUrl,
        },
      ],
    },
  ];
};

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();
  const navSections = getNavSections();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Determine if sidebar should show expanded content
  const showExpanded = !isCollapsed || isHovered;

  // Load collapsed state from localStorage (default to pinned/not collapsed)
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === "true");
    } else {
      // No stored preference - use default (pinned = not collapsed)
      setIsCollapsed(!SIDEBAR_DEFAULT_PINNED);
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // Toggle section expansion (for collapsed mode)
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (isLoading) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
        </div>
        {/* Desktop skeleton */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30">
          <div className="p-4 border-b">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
                <div className="h-8 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </aside>
      </>
    );
  }

  if (!user) {
    return null;
  }

  // Filter sections based on user permissions
  const visibleSections = navSections
    .filter((section) => checkPermission(user, section.requiredPermission))
    .map((section) => ({
      ...section,
      pages: section.pages.filter((page) =>
        checkPermission(user, page.requiredPermission)
      ),
    }))
    .filter((section) => section.pages.length > 0);

  // Determine which sections should be open by default (those with active links)
  const defaultOpenSections = visibleSections
    .filter((section) => section.pages.some((page) => pathname === page.href))
    .map((section) => section.id);

  // Full sidebar content (for mobile and expanded desktop)
  const FullSidebarContent = ({
    onLinkClick,
  }: {
    onLinkClick?: () => void;
  }) => (
    <TooltipProvider delayDuration={0}>
      <div className="p-4 border-b flex items-center justify-between">
        <Link
          href="/admin"
          onClick={onLinkClick}
          className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          Admin Dashboard
        </Link>
        {/* Pin/Collapse toggle - only show on desktop */}
        {!onLinkClick && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? (
                  <Pin className="h-4 w-4" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Keep sidebar open" : "Allow sidebar to collapse"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <Accordion
            type="multiple"
            defaultValue={
              defaultOpenSections.length > 0
                ? defaultOpenSections
                : [visibleSections[0]?.id]
            }
            className="w-full"
          >
            {visibleSections.map((section) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border-none"
              >
                <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline hover:bg-muted rounded-md [&[data-state=open]]:bg-muted">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pb-1">
                  <div className="flex flex-col gap-0.5 pl-2">
                    {section.pages.map((page) => {
                      const Icon = page.icon;
                      const isActive = pathname === page.href;

                      return (
                        <Link
                          key={page.href}
                          href={page.href}
                          onClick={onLinkClick}
                          target={page.external ? "_blank" : undefined}
                          rel={
                            page.external ? "noopener noreferrer" : undefined
                          }
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4 shrink-0" />}
                          <span className="truncate">{page.title}</span>
                          {page.external && (
                            <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-50" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );

  // Collapsed sidebar content (icons only with tooltips)
  const CollapsedSidebarContent = () => (
    <TooltipProvider delayDuration={0}>
      <div className="p-2 border-b flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/admin"
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Admin Dashboard</TooltipContent>
        </Tooltip>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {visibleSections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const firstIcon = section.pages[0]?.icon;
            const FirstIcon = firstIcon;

            return (
              <div key={section.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-md transition-colors mx-auto",
                        isExpanded ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      {FirstIcon ? (
                        <FirstIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{section.title}</TooltipContent>
                </Tooltip>
                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {section.pages.map((page) => {
                      const Icon = page.icon;
                      const isActive = pathname === page.href;

                      return (
                        <Tooltip key={page.href}>
                          <TooltipTrigger asChild>
                            <Link
                              href={page.href}
                              target={page.external ? "_blank" : undefined}
                              rel={
                                page.external
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                              className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-md transition-colors mx-auto",
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {page.title}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );

  return (
    <>
      {/* Mobile floating button and sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <FullSidebarContent onLinkClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "hidden lg:flex flex-col border-r bg-muted/30 transition-all duration-300 sticky top-0 h-full",
          showExpanded ? "w-64" : "w-16"
        )}
      >
        {showExpanded ? <FullSidebarContent /> : <CollapsedSidebarContent />}
      </aside>
    </>
  );
}
