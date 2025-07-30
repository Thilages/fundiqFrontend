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
import { PreferenceService, type Preference } from "@/services";
import { TEMP_FIRM_ID } from "@/lib/config";

// Helper function to check if custom evaluations are enabled
export async function isCustomEvaluationEnabled(): Promise<boolean> {
  return PreferenceService.isCustomEvaluationEnabled(TEMP_FIRM_ID);
}

// Helper function to get the preference ID when custom evaluation is enabled
export async function getPreferenceId(): Promise<string | null> {
  return PreferenceService.getPreferenceId(TEMP_FIRM_ID);
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
      const result = await PreferenceService.getPreferences(TEMP_FIRM_ID);

      if (result.success && result.data) {
        console.log("Fetched preferences:", result.data);

        // Handle both old and new data structures
        const data = result.data;
        let loadedPreferences: Preference;

        if (data.preferences) {
          // Old structure - convert to new structure
          loadedPreferences = {
            ...data.preferences,
            id: data.preferences?.id || data.id,
            use_custom_eval: data.preferences?.use_custom_eval ?? false,
          };
        } else {
          // New structure
          loadedPreferences = {
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
        }

        // If no server preference for use_custom_eval, check localStorage
        if (loadedPreferences.use_custom_eval === false) {
          const storedState = PreferenceService.getUseCustomEvalsFromStorage();
          if (storedState) {
            loadedPreferences.use_custom_eval = storedState;
          }
        }

        setPreferences(loadedPreferences);

        // Sync localStorage with loaded state
        PreferenceService.updateLocalStorage(loadedPreferences, loadedPreferences.use_custom_eval || false);
      } else {
        console.log("No preferences found or error:", result.error);

        // Check localStorage for checkbox state even if no server preferences
        const storedCheckboxState = PreferenceService.getUseCustomEvalsFromStorage();
        if (storedCheckboxState) {
          setPreferences(prev => ({ ...prev, use_custom_eval: storedCheckboxState }));
        }

        // Ensure localStorage is clean if no preferences found
        if (typeof window !== 'undefined') {
          localStorage.removeItem("selectedPreference");
        }
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);

      // Check localStorage for checkbox state even if fetch failed
      const storedCheckboxState = PreferenceService.getUseCustomEvalsFromStorage();
      if (storedCheckboxState) {
        setPreferences(prev => ({ ...prev, use_custom_eval: storedCheckboxState }));
      }
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
      const result = await PreferenceService.savePreferences(preferences, TEMP_FIRM_ID);

      if (!result.success) {
        throw new Error(result.error || "Failed to save preferences");
      }

      console.log("Success response:", result.data);

      // Update the preference ID if it's returned from the API
      if (result.data?.id) {
        const updatedPreferences = { ...preferences, id: result.data.id };
        setPreferences(updatedPreferences);

        // Update localStorage if custom evaluations are enabled
        if (preferences.use_custom_eval) {
          PreferenceService.updateLocalStorage(updatedPreferences, true);
        }
      }

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

    // Auto-save the checkbox state using the service
    try {
      const result = await PreferenceService.toggleCustomEvaluation(checked, preferences, TEMP_FIRM_ID);

      if (!result.success) {
        throw new Error(result.error || "Failed to save setting");
      }

      // Update the preference ID if it's returned from the API
      if (result.data?.id && checked) {
        const newPreferences = { ...updatedPreferences, id: result.data.id };
        setPreferences(newPreferences);
      }

      toast({
        title: "Success",
        description: `Custom evaluations ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to save checkbox state:", error);
      // Revert the checkbox if save failed
      setPreferences(preferences);

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
