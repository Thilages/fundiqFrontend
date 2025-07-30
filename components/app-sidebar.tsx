"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  FileText,
  LogOut,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ApplicationService } from "@/services";

// --- TYPES ---
interface Application {
  id: string;
  companyName: string;
  status: "completed" | "submitted" | "incomplete" | "rejected";
  submittedAt: string;
  score?: number;
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// --- CONSTANTS ---
const MENU_ITEMS = [
  {
    id: "dashboard",
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

const STATUS_CONFIG: Record<Application["status"], StatusConfig> = {
  completed: { icon: CheckCircle, color: "text-emerald-500" },
  submitted: { icon: Clock, color: "text-blue-500" },
  incomplete: { icon: AlertCircle, color: "text-amber-500" },
  rejected: { icon: AlertCircle, color: "text-red-500" },
};

// --- HELPER FUNCTIONS ---
function getStatusConfig(status: Application["status"]): StatusConfig {
  return STATUS_CONFIG[status] || STATUS_CONFIG.incomplete;
}

// Add New Application Modal Component
function AddNewApplicationModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startup_name: "",
    contact_name: "",
    contact_email: "",
    website_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Startup name validation
    if (!formData.startup_name.trim()) {
      newErrors.startup_name = "Startup name is required";
    } else if (formData.startup_name.length > 100) {
      newErrors.startup_name = "Startup name must be less than 100 characters";
    } else if (!/^[a-zA-Z0-9\s\-&.]+$/.test(formData.startup_name)) {
      newErrors.startup_name = "Startup name contains invalid characters";
    }

    // Contact name validation
    if (!formData.contact_name.trim()) {
      newErrors.contact_name = "Contact name is required";
    } else if (formData.contact_name.length > 50) {
      newErrors.contact_name = "Contact name must be less than 50 characters";
    } else if (!/^[a-zA-Z\s\-']+$/.test(formData.contact_name)) {
      newErrors.contact_name = "Contact name contains invalid characters";
    }

    // Email validation
    if (!formData.contact_email.trim()) {
      newErrors.contact_email = "Contact email is required";
    } else if (formData.contact_email.length > 100) {
      newErrors.contact_email = "Email must be less than 100 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    // Website URL validation
    if (!formData.website_url.trim()) {
      newErrors.website_url = "Website URL is required";
    } else if (formData.website_url.length > 200) {
      newErrors.website_url = "Website URL must be less than 200 characters";
    } else if (
      !/^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+$/.test(formData.website_url)
    ) {
      newErrors.website_url = "Please enter a valid website URL";
    }

    // File validation
    if (!file) {
      newErrors.file = "Pitch deck file is required";
    } else if (file.type !== "application/pdf") {
      newErrors.file = "Only PDF files are allowed";
    } else if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      newErrors.file = "File size must be less than 10MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("startup_name", formData.startup_name.trim());
      submitFormData.append("contact_name", formData.contact_name.trim());
      submitFormData.append("contact_email", formData.contact_email.trim());
      submitFormData.append("website_url", formData.website_url.trim());
      if (file) {
        submitFormData.append("file", file);
      }

      const response = await fetch(`/api/applications`, {
        method: "POST",
        body: submitFormData,
        credentials: "include", // Include cookies for JWT token
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Application created successfully",
      });

      // Reset form
      setFormData({
        startup_name: "",
        contact_name: "",
        contact_email: "",
        website_url: "",
      });
      setFile(null);
      setErrors({});
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create application:", error);
      toast({
        title: "Error",
        description: "Failed to create application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 text-sm font-medium px-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Create a new pitch deck application
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startup_name">Startup Name *</Label>
            <Input
              id="startup_name"
              value={formData.startup_name}
              onChange={(e) => updateField("startup_name", e.target.value)}
              placeholder="Enter startup name"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.startup_name && (
              <p className="text-sm text-red-600">{errors.startup_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => updateField("contact_name", e.target.value)}
              placeholder="Enter contact person name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.contact_name && (
              <p className="text-sm text-red-600">{errors.contact_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => updateField("contact_email", e.target.value)}
              placeholder="Enter contact email"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.contact_email && (
              <p className="text-sm text-red-600">{errors.contact_email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL *</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => updateField("website_url", e.target.value)}
              placeholder="Enter website URL"
              maxLength={200}
              disabled={isSubmitting}
            />
            {errors.website_url && (
              <p className="text-sm text-red-600">{errors.website_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Pitch Deck (PDF) *</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                setFile(selectedFile);
                if (errors.file) {
                  setErrors({ ...errors, file: "" });
                }
              }}
              disabled={isSubmitting}
            />
            {errors.file && (
              <p className="text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- COMPONENT ---
export function AppSidebar() {
  const pathname = usePathname();
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

      const data = result.data?.applications || result.data || [];

      if (Array.isArray(data)) {
        const transformedApplications = data.map((app: any) => ({
          id: app.id,
          companyName: app.startup_name || "Unknown Company",
          status: app.status || "submitted",
          submittedAt: app.created_at
            ? new Date(app.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            : "No date",
          score: app.overall?.score,
        }));
        setApplications(transformedApplications.slice(0, 5)); // Show top 5 recent
      } else {
        setApplications([]);
      }
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch applications for sidebar:", err);
      setError("Could not load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApplicationSuccess = () => {
    // Refresh the applications list when a new application is created
    fetchApplications();
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log("Logout action triggered");
  };

  return (
    <Sidebar className="border-r bg-background flex flex-col h-screen">
      <SidebarHeader className="p-4 border-b">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">FundIQ</h2>
            <p className="text-xs text-muted-foreground">
              Evaluation Platform
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col px-2 pt-4 space-y-4 overflow-y-auto">
        <AddNewApplicationModal onSuccess={handleApplicationSuccess} />
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.id}>
                    <Button
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start h-11"
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-semibold">{item.title}</span>
                      </Link>
                    </Button>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* New Application Action */}

        {/* Recent Applications Section */}
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Applications
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2 text-sm">Loading...</span>
              </div>
            ) : error ? (
              <div className="px-3 py-4 text-center text-sm text-red-600">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No applications found.</p>
                <p className="text-xs text-muted-foreground mt-1">Get started by creating one.</p>
              </div>
            ) : (
              <SidebarMenu className="space-y-1">
                {applications.map((app) => {
                  const { icon: StatusIcon, color } = getStatusConfig(app.status);
                  return (
                    <SidebarMenuItem key={app.id}>
                      <Link
                        href={`/applications/${app.id}`}
                        className="flex items-center w-full p-3 rounded-md transition-colors hover:bg-muted"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">
                            {app.companyName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {app.submittedAt}
                          </p>
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          <StatusIcon className={`h-5 w-5 ${color}`} />
                        </div>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full h-10 justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="text-sm font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}