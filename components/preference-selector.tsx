"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Settings, Loader2, Save } from "lucide-react";

// Updated firm ID as requested
const TEMP_FIRM_ID = "f5fef2ab-f981-4e90-8845-6783ddee5de0";

// Helper function to check if custom evaluations are enabled
export async function isCustomEvaluationEnabled(): Promise<boolean> {
  try {
    const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data?.preferences?.use_custom_eval ?? false;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to check custom evaluation status:", error);
    return false;
  }
}

// Helper function to get the preference ID when custom evaluation is enabled
export async function getPreferenceId(): Promise<string | null> {
  try {
    const isEnabled = await isCustomEvaluationEnabled();
    return isEnabled ? TEMP_FIRM_ID : null;
  } catch (error) {
    console.error("Failed to get preference ID:", error);
    return null;
  }
}

interface Preference {
  id?: string;
  overall_custom_eval: string;
  founders_custom_eval: string;
  product_custom_eval: string;
  market_custom_eval: string;
  vision_custom_eval: string;
  traction_custom_eval: string;
  investors_custom_eval: string;
  use_custom_eval?: boolean;
}

export function PreferenceSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState<Preference>({
    id: undefined,
    overall_custom_eval: "",
    founders_custom_eval: "",
    product_custom_eval: "",
    market_custom_eval: "",
    vision_custom_eval: "",
    traction_custom_eval: "",
    investors_custom_eval: "",
    use_custom_eval: false,
  });

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log("Fetched preferences:", data.preferences);
          // Handle both old and new data structures
          if (data) {
            // Old structure - convert to new structure
            const loadedPreferences = {
              ...data.preferences,
              id: data.preferences?.id || data.id,
              use_custom_eval: data.preferences?.use_custom_eval ?? false,
            };
            setPreferences(loadedPreferences);

            // Sync localStorage with loaded state
            if (loadedPreferences.use_custom_eval && loadedPreferences.id) {
              localStorage.setItem("selectedPreference", loadedPreferences.id);
              console.log("Stored preference ID in localStorage:", loadedPreferences.id);
            } else {
              localStorage.removeItem("selectedPreference");
            }
          } else if (data.overall_custom_eval !== undefined) {
            // New structure
            const loadedPreferences = {
              id: data.id,
              overall_custom_eval: data.overall_custom_eval || "",
              founders_custom_eval: data.founders_custom_eval || "",
              product_custom_eval: data.product_custom_eval || "",
              market_custom_eval: data.market_custom_eval || "",
              vision_custom_eval: data.vision_custom_eval || "",
              traction_custom_eval: data.traction_custom_eval || "",
              investors_custom_eval: data.investors_custom_eval || "",
              use_custom_eval: data.use_custom_eval ?? false,
            };
            setPreferences(loadedPreferences);

            // Sync localStorage with loaded state
            if (loadedPreferences.use_custom_eval && loadedPreferences.id) {
              localStorage.setItem("selectedPreference", loadedPreferences.id);
              console.log("Stored preference ID in localStorage:", loadedPreferences.id);
            } else {
              localStorage.removeItem("selectedPreference");
            }
          }
        }
      } else {
        console.log("No preferences found or error:", response.status);
        // Ensure localStorage is clean if no preferences found
        localStorage.removeItem("selectedPreference");
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Submitting preferences:", preferences);

    try {
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(preferences),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }
        console.error("Error response:", errorData);
        throw new Error(
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      let result: any = null;
      try {
        result = JSON.parse(responseText);
        // Update the preference ID if it's returned from the API
        if (result?.id) {
          setPreferences(prev => ({ ...prev, id: result.id }));
          // Update localStorage if custom evaluations are enabled
          if (preferences.use_custom_eval) {
            localStorage.setItem("selectedPreference", result.id);
            console.log("Updated preference ID from save response:", result.id);
          }
        }
      } catch {
        result = { success: true };
      }
      console.log("Success response:", result);

      toast({
        title: "Success",
        description: "Evaluation criteria saved successfully",
      });

      setIsOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save evaluation criteria. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePreference = (field: keyof Preference, value: string | boolean) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleCheckboxChange = async (checked: boolean) => {
    const updatedPreferences = { ...preferences, use_custom_eval: checked };
    setPreferences(updatedPreferences);

    // Update localStorage based on checkbox state
    if (checked && preferences.id) {
      localStorage.setItem("selectedPreference", preferences.id);
      console.log("Custom evaluations enabled, stored preference ID in localStorage:", preferences.id);
    } else {
      localStorage.removeItem("selectedPreference");
      console.log("Custom evaluations disabled, removed preference ID from localStorage");
    }

    // Auto-save the checkbox state
    try {
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response data to update the preference ID if needed
      const responseText = await response.text();
      let result: any = null;
      try {
        result = JSON.parse(responseText);
        // Update the preference ID if it's returned from the API
        if (result?.id && checked) {
          setPreferences(prev => ({ ...prev, id: result.id }));
          localStorage.setItem("selectedPreference", result.id);
          console.log("Updated preference ID from API response:", result.id);
        }
      } catch {
        // Response might not be JSON, that's okay
      }

      toast({
        title: "Success",
        description: `Custom evaluations ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to save checkbox state:", error);
      // Revert the checkbox if save failed
      setPreferences(preferences);
      // Revert localStorage as well
      if (checked) {
        localStorage.removeItem("selectedPreference");
      } else if (preferences.id) {
        localStorage.setItem("selectedPreference", preferences.id);
      }
      toast({
        title: "Error",
        description: "Failed to save setting. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Custom Evaluation Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="use-custom-eval-main"
          checked={preferences.use_custom_eval || false}
          onCheckedChange={handleCheckboxChange}
          disabled={loading}
        />
        <Label htmlFor="use-custom-eval-main" className="text-sm font-medium cursor-pointer">
          Use Custom Evals
        </Label>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Custom Evals
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Evaluation Criteria
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edit your custom evaluation criteria for each dimension."
                : "View your custom evaluation criteria for each dimension. Click Edit to make changes."
              }
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preferences...
            </div>
          ) : !isEditing ? (
            // Read-only view
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Overall Evaluation Criteria
                </Label>
                <div className="p-3 bg-gray-50 border rounded-md text-sm">
                  {preferences.overall_custom_eval || "No criteria defined yet."}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Founders & Team
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.founders_custom_eval || "No criteria defined yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Product & Technology
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.product_custom_eval || "No criteria defined yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Market & Opportunity
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.market_custom_eval || "No criteria defined yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Vision & Strategy
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.vision_custom_eval || "No criteria defined yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Traction & Metrics
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.traction_custom_eval || "No criteria defined yet."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Existing Investors
                  </Label>
                  <div className="p-3 bg-gray-50 border rounded-md text-sm">
                    {preferences.investors_custom_eval || "No criteria defined yet."}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            // Edit form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="overall" className="text-sm font-medium">
                  Overall Evaluation Criteria
                </Label>
                <Textarea
                  id="overall"
                  placeholder="Describe your overall evaluation approach and what matters most to you across all dimensions..."
                  value={preferences.overall_custom_eval}
                  onChange={(e) => updatePreference("overall_custom_eval", e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className=""
                />
              </div>

              <div className="">
                <div className="space-y-2">
                  <Label htmlFor="founders" className="text-sm font-medium">
                    Founders & Team
                  </Label>
                  <Textarea
                    id="founders"
                    placeholder="What do you look for in founders? Experience, domain expertise, track record..."
                    value={preferences.founders_custom_eval}
                    onChange={(e) => updatePreference("founders_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product" className="text-sm font-medium">
                    Product & Technology
                  </Label>
                  <Textarea
                    id="product"
                    placeholder="Product quality, innovation, technical differentiation, user experience..."
                    value={preferences.product_custom_eval}
                    onChange={(e) => updatePreference("product_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market" className="text-sm font-medium">
                    Market & Opportunity
                  </Label>
                  <Textarea
                    id="market"
                    placeholder="Market size, growth potential, competitive landscape, timing..."
                    value={preferences.market_custom_eval}
                    onChange={(e) => updatePreference("market_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision" className="text-sm font-medium">
                    Vision & Strategy
                  </Label>
                  <Textarea
                    id="vision"
                    placeholder="Long-term vision, strategic thinking, scalability, business model..."
                    value={preferences.vision_custom_eval}
                    onChange={(e) => updatePreference("vision_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="traction" className="text-sm font-medium">
                    Traction & Metrics
                  </Label>
                  <Textarea
                    id="traction"
                    placeholder="Revenue growth, user metrics, partnerships, market validation..."
                    value={preferences.traction_custom_eval}
                    onChange={(e) => updatePreference("traction_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="investors" className="text-sm font-medium">
                    Existing Investors
                  </Label>
                  <Textarea
                    id="investors"
                    placeholder="Quality of existing investors, valuation, funding history, investor alignment..."
                    value={preferences.investors_custom_eval}
                    onChange={(e) => updatePreference("investors_custom_eval", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
