// pitchdeck/app/applications/[id]/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplicationService } from "@/services";

// Local Imports (New Structure)
import { ApplicationDetail, ProcessingAction } from "./lib/types";
import { fetchApplication } from "./lib/api";
import { ApplicationHeader } from "./components/ApplicationHeader";
import { ActionButtons } from "./components/ActionButtons";
import { FullScreenLoader } from "./components/FullScreenLoader";
import { ScorecardSection } from "./components/ScorecardSection";
import { EnrichedDataSection } from "./components/EnrichedDataSection";
import { RawDataSection } from "./components/RawDataSection";
import { IssuesSection } from "./components/IssuesSection";

// Default data structure to prevent errors with missing API data
const defaultRawData = {
  /* ... keep the same defaultRawData object as before ... */
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] =
    useState<ProcessingAction | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchApplication(id)
      .then((data) => {
        setApp({
          ...data,
          raw: data.raw || defaultRawData,
          enriched: data.enriched || {},
          results: data.results || {},
          issues: data.issues || [],
        });
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load application");
        setApp(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRawData = async (updatedRaw: any) => {
    try {
      const result = await ApplicationService.updateApplication(id, { raw: updatedRaw });

      if (!result.success) {
        throw new Error(result.error || "Failed to save");
      }

      // Update local state immediately for responsiveness
      setApp((prev) => (prev ? { ...prev, raw: updatedRaw } : null));

      // Fetch fresh data from server to ensure consistency
      fetchData();

      toast({ title: "Success", description: "Raw data updated successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const handleTriggerAction = async (action: ProcessingAction) => {
    setProcessingAction(action);
    try {
      // Build URL with query parameters
      let url = `/api/application/${id}?action=${action}`;
      if (action === "evaluate") {
        const prefId = localStorage.getItem("selectedPreference");
        if (prefId) url += `&preferences_id=${prefId}`;
      }

      const response = await fetch(url, {
        method: "POST",
        credentials: "include", // Include cookies for JWT token
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to trigger ${action}`);

      toast({
        title: "Success",
        description: `The ${action} process has completed. Refreshing data...`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to trigger ${action}`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // For file uploads, we need to use the base service with FormData
      const response = await fetch(`/api/application/${id}`, {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to upload");

      toast({
        title: "Success",
        description: "Pitch deck updated. Refreshing data...",
      });
      fetchData();
    } catch (error) {
      console.error("Upload failed:", error);
      throw error; // Re-throw to be caught by the modal
    }
  };

  if (loading && !app) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ApplicationHeader
          app={{} as any}
          error={error}
          onFileUpload={handleFileUpload}
        />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 p-8">
        {/* Basic header for not found state */}
        <p className="text-muted-foreground">Application not found</p>
      </div>
    );
  }

  const unresolvedIssuesCount = app.issues?.length || 0;

  return (
    <>
      {processingAction && <FullScreenLoader action={processingAction} />}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <ApplicationHeader app={app} onFileUpload={handleFileUpload} />
        <ActionButtons
          onTriggerAction={handleTriggerAction}
          processingAction={processingAction}
        />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="raw">Raw Extracted Data</TabsTrigger>
            <TabsTrigger value="enriched">Enriched Data</TabsTrigger>
            <TabsTrigger value="overview">Overview & Scores</TabsTrigger>


            <TabsTrigger value="notes">
              Issues & Actions
              {unresolvedIssuesCount > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {unresolvedIssuesCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ScorecardSection results={app.results} />
          </TabsContent>
          <TabsContent value="enriched">
            <EnrichedDataSection enrichedData={app.enriched} />
          </TabsContent>
          <TabsContent value="raw">
            <RawDataSection initialData={app.raw} onSave={handleSaveRawData} />
          </TabsContent>
          <TabsContent value="notes">
            <IssuesSection
              issues={
                app.issues && typeof app.issues === "object" && !Array.isArray(app.issues)
                  ? app.issues
                  : { enrichment_issues: [], evaluation_issues: [], extraction_issues: [] }
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
