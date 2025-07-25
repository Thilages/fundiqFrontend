"use client";

import type React from "react";

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
  Settings,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

const menuItems = [
  {
    id: 0,
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
];

// Updated firm ID as requested
const TEMP_FIRM_ID = "447a1f02-d6c7-4014-b3fe-500cbe876405";

interface Preference {
  id: string;
  preference_name: string;
  custom_rules_text: string;
  dimensions: {
    founders: number;
    product: number;
    market: number;
    vision: number;
    traction: number;
    investors: number;
  };
  created_at?: string;
  updated_at?: string;
}

function CreateFilterModal({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    custom_prompt: "",
    dimensions: {
      founders: 75,
      market: 60,
      product: 35,
      traction: 15,
      investors: 5,
      vision: 10,
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Filter name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!formData.custom_prompt.trim()) {
      newErrors.custom_prompt = "Custom prompt is required";
    } else if (formData.custom_prompt.length > 500) {
      newErrors.custom_prompt =
        "Custom prompt must be less than 500 characters";
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
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          custom_prompt: formData.custom_prompt.trim(),
          dimensions: formData.dimensions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const newPreference = await response.json();
      console.log("Created preference:", newPreference);

      toast({
        title: "Success",
        description: "Filter created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        custom_prompt: "",
        dimensions: {
          founders: 75,
          market: 60,
          product: 35,
          traction: 15,
          investors: 5,
          vision: 10,
        },
      });
      setErrors({});
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to create filter:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create filter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const updateDimension = (dimension: string, value: number[]) => {
    const newValue = Math.round(value[0]);

    setFormData({
      ...formData,
      dimensions: {
        ...formData.dimensions,
        [dimension]: newValue,
      },
    });
  };

  const resetToDefaults = () => {
    setFormData({
      ...formData,
      dimensions: {
        founders: 75,
        market: 60,
        product: 35,
        traction: 15,
        investors: 5,
        vision: 10,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-8 px-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="text-sm">Create Filter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Filter</DialogTitle>
          <DialogDescription>
            Set up a custom evaluation filter. Rate each dimension from 0-100
            based on importance.
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">
              0 = Not important at all • 50 = Moderately important • 100 =
              Extremely important
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Filter Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter filter name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_prompt">Custom Prompt *</Label>
            <Textarea
              id="custom_prompt"
              value={formData.custom_prompt}
              onChange={(e) => updateField("custom_prompt", e.target.value)}
              placeholder="Enter your custom evaluation prompt..."
              maxLength={500}
              disabled={isSubmitting}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {formData.custom_prompt.length}/500 characters
            </p>
            {errors.custom_prompt && (
              <p className="text-sm text-red-600">{errors.custom_prompt}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Dimension Importance (0-100)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                disabled={isSubmitting}
              >
                Reset to Defaults
              </Button>
            </div>

            {Object.entries(formData.dimensions).map(([dimension, value]) => (
              <div key={dimension} className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="capitalize font-medium">{dimension}</Label>
                  <span className="text-sm font-medium px-2 py-1 bg-muted rounded">
                    {value}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(newValue) =>
                    updateDimension(dimension, newValue)
                  }
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Important</span>
                  <span>Moderately Important</span>
                  <span>Extremely Important</span>
                </div>
              </div>
            ))}
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
                  <Loader2 className="animate-spin rounded-full h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Filter"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AppSidebar() {
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No preferences found, that's okay
          setPreferences([]);
          return;
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched preferences:", data);

      // Handle API response with { preferences: [...] }
      const preferencesArray = Array.isArray(data.preferences)
        ? data.preferences
        : Array.isArray(data)
        ? data
        : [];
      setPreferences(preferencesArray);

      // Load selected preference from localStorage
      const savedSelected = localStorage.getItem("selectedPreference");
      if (
        savedSelected &&
        preferencesArray.some((p: Preference) => p.id === savedSelected)
      ) {
        setSelectedPreference(savedSelected);
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load preferences"
      );
      setPreferences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const togglePreference = (preferenceId: string) => {
    if (selectedPreference === preferenceId) {
      // Deselect if already selected
      setSelectedPreference(null);
      localStorage.removeItem("selectedPreference");
      toast({
        title: "Filter Deselected",
        description: "No filter is currently active",
      });
    } else {
      // Select new preference
      setSelectedPreference(preferenceId);
      localStorage.setItem("selectedPreference", preferenceId);
      const preference = preferences.find((p) => p.id === preferenceId);
      toast({
        title: "Filter Selected",
        description: `"${preference?.preference_name}" will be used for evaluations`,
      });
    }
  };

  const refreshPreferences = () => {
    fetchPreferences();
  };

  return (
    <Sidebar className="flex-[2]">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground">FundIQ</h2>
        <p className="text-xs text-muted-foreground">
          Firm ID: {TEMP_FIRM_ID}...
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
              {/* {console.log(menuItems)} */}
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

        {/* Filters Section */}
        <SidebarGroup className="px-3 py-2">
          <SidebarGroupLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Settings className="h-3 w-3" />
            Filters
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {error ? (
                <div className="px-2 py-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              ) : loading ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  Loading preferences...
                </div>
              ) : preferences.length === 0 ? (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  No filters created yet
                </div>
              ) : (
                preferences.map((preference, idx) => (
                  <SidebarMenuItem key={`${preference.id}-${idx}`}>
                    <SidebarMenuButton
                      className="h-9 px-2 justify-between group"
                      onClick={() => togglePreference(preference.id)}
                    >
                      <div className="flex flex-col min-w-0 text-left">
                        <span
                          className="text-sm truncate font-medium"
                          title={preference.preference_name}
                        >
                          {preference.preference_name}
                        </span>
                        {preference.custom_rules_text && (
                          <span
                            className="text-xs text-muted-foreground truncate"
                            title={preference.custom_rules_text}
                          >
                            {preference.custom_rules_text}
                          </span>
                        )}
                      </div>
                      {selectedPreference === preference.id && (
                        <Check className="h-3 w-3 text-primary shrink-0" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>

            {/* Create Filter Button */}
            <div className="px-2 pt-2">
              <CreateFilterModal onSuccess={refreshPreferences} />
            </div>

            {/* Refresh Button */}
            {error && (
              <div className="px-2 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 px-2 text-xs"
                  onClick={refreshPreferences}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <Settings className="mr-2 h-3 w-3" />
                  )}
                  <span>Retry</span>
                </Button>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Demo User</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
