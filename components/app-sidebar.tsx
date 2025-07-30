"use client";

import type React from "react";
import { useState, useEffect } from "react";

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
import { LayoutDashboard, User, FileText, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
  contact_name?: string;
  contact_email?: string;
  status: "submitted" | "completed" | "incomplete";
  overallScore?: number;
  submittedAt: string;
  industry?: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "submitted":
      return <Clock className="h-3 w-3 text-yellow-500" />;
    default:
      return <AlertCircle className="h-3 w-3 text-gray-500" />;
  }
}

function getStatusBadgeVariant(status: string) {
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
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const result = await ApplicationService.getApplications();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch applications");
      }

      const data = result.data;

      // Transform the API response to match our interface
      const applications = data?.applications || data; // Handle both response formats
      if (Array.isArray(applications)) {
        const transformedApplications = applications.map((app: any) => ({
          id: app.id,
          companyName: app.startup_name || "Unknown Company",
          contact_name: app.contact_name,
          contact_email: app.contact_email,
          status: app.status || "submitted",
          overallScore: app.score || null,
          submittedAt: app.created_at
            ? new Date(app.created_at).toLocaleDateString()
            : new Date().toLocaleDateString(),
          industry: app.industry || "Unknown",
        }));

        // Get only the 5 most recent applications for sidebar
        setApplications(transformedApplications.slice(0, 5));
      } else {
        setApplications([]);
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch applications for sidebar:", err);
      setError("Failed to load");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);
  return (
    <Sidebar className="flex-[2]">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">FundIQ</h2>
        <p className="text-xs text-muted-foreground">
          Pitch Deck Evaluation Platform
        </p>
      </SidebarHeader>

      <SidebarContent className="p-0">
        {/* Navigation Section */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild className="h-9 px-2">
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
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Applications
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">
                No applications yet
              </div>
            ) : (
              <SidebarMenu className="space-y-1">
                {applications.map((app) => (
                  <SidebarMenuItem key={app.id}>
                    <SidebarMenuButton asChild className="h-auto bg-gray-200">
                      <Link href={`/applications/${app.id}`} className="flex flex-col items-start gap-1 w-full">
                        <div className="flex items-center gap-2 w-full">
                          {/* {getStatusIcon(app.status)} */}
                          <span className="text-sm font-medium truncate flex-1">
                            {app.companyName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-muted-foreground truncate">
                            {app.submittedAt}
                          </span>
                          {/* <Badge
                            variant={getStatusBadgeVariant(app.status) as any}
                            className="text-xs h-4 px-1"
                          >
                            {app.status}
                          </Badge> */}
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

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
