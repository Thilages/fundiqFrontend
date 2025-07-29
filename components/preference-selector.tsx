"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Settings, Plus, Check, Loader2, AlertCircle } from "lucide-react";

// Updated firm ID as requested
const TEMP_FIRM_ID = "62773c6e-4516-4c01-bb31-0e3cf2517b58";

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
    preference_name: "",
    custom_rules_text: "",
    weights: {
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

    if (!formData.preference_name.trim()) {
      newErrors.preference_name = "Filter name is required";
    } else if (formData.preference_name.length > 50) {
      newErrors.preference_name = "Name must be less than 50 characters";
    }

    if (!formData.custom_rules_text.trim()) {
      newErrors.custom_rules_text = "Custom prompt is required";
    } else if (formData.custom_rules_text.length > 500) {
      newErrors.custom_rules_text =
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
    console.log(formData);
    try {
      const response = await fetch(`/api/preferences/${TEMP_FIRM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          preference_name: formData.preference_name.trim(),
          custom_rules_text: formData.custom_rules_text.trim(),
          weights: formData.weights,
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
        preference_name: "",
        custom_rules_text: "",
        weights: {
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
      weights: {
        ...formData.weights,
        [dimension]: newValue,
      },
    });
  };

  const resetToDefaults = () => {
    setFormData({
      ...formData,
      weights: {
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
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Filter
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
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-2">
            <Label htmlFor="name">Filter Name *</Label>
            <Input
              id="name"
              value={formData.preference_name}
              onChange={(e) => updateField("preference_name", e.target.value)}
              placeholder="Enter filter name"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.preference_name && (
              <p className="text-sm text-red-600">{errors.preference_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_prompt">Custom Prompt *</Label>
            <Textarea
              id="custom_prompt"
              value={formData.custom_rules_text}
              onChange={(e) => updateField("custom_rules_text", e.target.value)}
              placeholder="Enter your custom evaluation prompt..."
              maxLength={500}
              disabled={isSubmitting}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {formData.custom_rules_text.length}/500 characters
            </p>
            {errors.custom_rules_text && (
              <p className="text-sm text-red-600">{errors.custom_rules_text}</p>
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

            {Object.entries(formData.weights).map(([dimension, value]) => (
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

export function PreferenceSelector() {
  const [isOpen, setIsOpen] = useState(false);
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

  const getActiveFilterName = () => {
    if (!selectedPreference) return null;
    return preferences.find((p) => p.id === selectedPreference)
      ?.preference_name;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          {getActiveFilterName() ? (
            <span className="truncate max-w-[120px]">
              {getActiveFilterName()}
            </span>
          ) : (
            "Filters"
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Evaluation Filters
          </DialogTitle>
          <DialogDescription>
            Select or create a filter to customize how applications are
            evaluated
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 w-full">
          {error ? (
            <div className="text-sm text-red-600 flex items-center gap-2 p-3 bg-red-50 rounded-lg w-full">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1 break-words">{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPreferences}
                disabled={loading}
                className="ml-auto shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading filters...
            </div>
          ) : preferences.length === 0 ? (
            <div className="text-center py-6">
              <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                No filters created yet. Create your first filter to get started.
              </p>
              <CreateFilterModal onSuccess={refreshPreferences} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Filters</span>
                <CreateFilterModal onSuccess={refreshPreferences} />
              </div>

              <div className="space-y-2">
                {preferences.map((preference, idx) => (
                  <div
                    key={`${preference.id}-${idx}`}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPreference === preference.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => togglePreference(preference.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {preference.preference_name}
                          </span>
                          {selectedPreference === preference.id && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                        {preference.custom_rules_text && (
                          <p className="text-xs text-muted-foreground mt-1 break-words">
                            {preference.custom_rules_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPreference && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg w-full">
                  <p className="text-sm text-primary font-medium break-words">
                    Active Filter:{" "}
                    {
                      preferences.find((p) => p.id === selectedPreference)
                        ?.preference_name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    This filter will be used for all application evaluations
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
