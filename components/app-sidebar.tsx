"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // Import usePathname

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import UserMenu from "@/components/UserMenu";
import { ApplicationService } from "@/services";

const menuItems = [
  {
    id: 0,
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

// Types
interface Application {
  id: string;
  companyName: string;
  status: "completed" | "submitted" | "incomplete";
  submittedAt: string;
}

// Enhanced getStatusIcon with better styling
function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "submitted":
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
}

// Refined getStatusBadgeVariant for better color-coding
function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "completed":
      return "default";
    case "submitted":
      return "secondary";
    default:
      return "outline";
  }
}

export function AppSidebar() {
  const pathname = usePathname(); // Get current path
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetching logic remains the same ---
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await ApplicationService.getApplications();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch applications");
      }

      const data = result.data;
      const applicationsData = data?.applications || data;

      if (Array.isArray(applicationsData)) {
        const transformedApplications = applicationsData.map((app: any) => ({
          id: app.id,
          companyName: app.startup_name || "Unknown Company",
          status: app.status || "submitted",
          submittedAt: app.created_at
            ? new Date(app.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "No date",
        }));
        setApplications(transformedApplications.slice(0, 5));
      } else {
        setApplications([]);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch applications for sidebar:", err);
      setError("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <Sidebar className="flex-[2] border-r bg-muted/20">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-semibold text-foreground">FundIQ</h2>
        <p className="text-xs text-muted-foreground">
          Pitch Deck Evaluation Platform
        </p>
      </SidebarHeader>

      <SidebarContent className="flex flex-col p-4">
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2 space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    // Apply active state styling
                    className={`h-10 px-3 transition-colors duration-200 ${pathname === item.url
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                      }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Applications Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase">
            Recent Applications
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="px-3 py-2 text-sm text-red-500">{error}</div>
            ) : applications.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No applications yet.
              </div>
            ) : (
              <SidebarMenu className="space-y-1">
                {applications.map((app) => (
                  <SidebarMenuItem key={app.id}>
                    <SidebarMenuButton
                      asChild
                      className="h-auto w-full cursor-pointer rounded-lg p-3 transition-colors duration-200 hover:bg-muted"
                    >
                      <Link
                        href={`/applications/${app.id}`}
                        className="flex flex-col items-start gap-2"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-semibold truncate">
                            {app.companyName}
                          </span>
                          {getStatusIcon(app.status)}
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <Badge
                            variant={getStatusBadgeVariant(app.status)}
                            className="text-xs capitalize"
                          >
                            {app.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {app.submittedAt}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto bg-muted/20">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}