"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Edit,
  BarChart3,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Save,
  X,
  FileText,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";

// Types based on database schema
// Remove the old Issue interface and update ApplicationDetail interface
interface ApplicationDetail {
  id: string;
  startup_name: string;
  contact_email?: string;
  contact_name?: string;
  website_url?: string;
  status: "submitted" | "completed" | "incomplete";
  score?: number;
  confidence_score?: number;
  created_at: string;
  last_updated_at: string;
  country?: string;
  stage?: string;
  issues?: string[]; // Changed from Issue[] to string[]
  raw?: any;
  enriched?: any;
  results?: {
    [key: string]: {
      score: number;
      bucket: string;
      confidenceScore: number;
      issues: string[];
      manualCheck: boolean;
      breakdown?: any;
    };
  };
}

type ProcessingAction = "extract" | "enhance" | "evaluate";

const defaultRawData = {
  market: {
    sam: "",
    som: "",
    tam: "",
    target_geography: "",
    problem_statement: "",
    regulatory_domain: [],
    competitive_landscape: "",
  },
  vision: {
    vision: "",
    mission: "",
    differentiation: "",
    resilience_signal: "",
  },
  product: {
    tech_stack: [],
    description: "",
    is_scalable: false,
    innovation_or_ip: "",
    product_market_fit: "",
  },
  founders: [],
  traction: {
    gmv: 0,
    users: 0,
    revenue: 0,
    growth_rate: "",
    revenue_model: "",
    business_model: "",
    current_customers: [],
    retention_metrics: "",
  },
  investors: {
    advisors: [],
    co_investors: [],
  },
  contact_info: {
    emails: [],
    phone_numbers: [],
  },
  company_website: "",
};

// API function using live API
async function fetchApplication(id: string): Promise<ApplicationDetail> {
  try {
    const response = await fetch(`/api/application/${id}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Application not found");
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Successfully fetched application:", data);

    return data;
  } catch (error) {
    console.error("Failed to fetch application:", error);
    throw error;
  }
}

function ScoreCard({
  title,
  score,
  summary,
  confidence,
  icon: Icon,
}: {
  title: string;
  score: number;
  summary: string;
  confidence: number;
  icon: any;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
          {score}
        </div>
        <Progress value={score * 10} className="mt-2" />
        <p className="text-xs text-muted-foreground mt-2">{summary}</p>
        <Badge variant="outline" className="mt-2">
          {confidence}% confidence
        </Badge>
      </CardContent>
    </Card>
  );
}

// Notes/Issues Table Component
function NotesTable({ issues }: { issues: string[] }) {
  if (!issues || issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues & Action Items</CardTitle>
          <CardDescription>
            Identified issues and manual action items during processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No issues or action items
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Action Items</CardTitle>
        <CardDescription>
          Identified issues and manual action items during processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/50"
            >
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{issue}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions
function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined || value === "null") {
    return <span className="text-muted-foreground">Not provided</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">None</span>;
    }
    if (typeof value[0] === "object" && value[0] !== null) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <Card key={index} className="p-3 bg-muted/50">
              <div className="space-y-1">
                {Object.entries(item).map(([key, val]) => (
                  <div key={key} className="text-xs">
                    <span className="font-semibold">{formatKey(key)}: </span>
                    {renderValue(val)}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }
    return <span>{value.join(", ")}</span>;
  }
  if (typeof value === "boolean") {
    return (
      <Badge variant={value ? "default" : "secondary"}>
        {value ? "Yes" : "No"}
      </Badge>
    );
  }
  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-1 pl-4 border-l">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="text-xs">
            <span className="font-semibold">{formatKey(key)}: </span>
            {renderValue(val)}
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}

function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIconForDimension(dimension: string) {
  const icons = {
    founders: Users,
    market: Target,
    product: Lightbulb,
    traction: TrendingUp,
    vision: BarChart3,
    investors: DollarSign,
  };
  return icons[dimension as keyof typeof icons] || Users;
}

// File Upload Modal Component
function FileUploadModal({ onUpload }: { onUpload: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file);
      toast({
        title: "Success",
        description: "Pitch deck uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload pitch deck",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Upload Pitch Deck</DialogTitle>
        <DialogDescription>
          Upload a new version of the pitch deck (PDF format only)
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setFile(null)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Full Screen Loader Component
function FullScreenLoader({ action }: { action: ProcessingAction }) {
  const messages = {
    extract: "Extracting latest data from source...",
    enhance: "Enhancing data with external sources...",
    evaluate: "Running evaluation models...",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <h3 className="text-lg font-semibold">Processing Request</h3>
        <p className="text-sm text-muted-foreground">{messages[action]}</p>
      </div>
    </div>
  );
}

export default function ApplicationDetail({
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

  const fetchData = React.useCallback(() => {
    setLoading(true);
    fetchApplication(id)
      .then((data) => {
        const appData = { ...data };
        // Provide default structures for missing data to ensure UI consistency
        if (!appData.raw) {
          appData.raw = defaultRawData;
        }
        if (!appData.enriched) {
          appData.enriched = {};
        }
        if (!appData.results) {
          appData.results = {};
        }
        if (!appData.issues) {
          appData.issues = [];
        }
        setApp(appData);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch application:", err);
        setError(err.message || "Failed to load application");
        setApp(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveRawData = async (updatedRaw: any) => {
    try {
      const response = await fetch(`/api/application/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          raw: updatedRaw,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");
      setApp((prev) => (prev ? { ...prev, raw: updatedRaw } : null));
      toast({
        title: "Success",
        description: "Raw data updated successfully",
      });
    } catch (error) {
      console.error("Failed to save to API:", error);
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
      let url = `${API_BASE_URL}/applications/${id}?action=${action}`;
      if (action === "evaluate") {
        const selectedPreference =
          typeof window !== "undefined"
            ? localStorage.getItem("selectedPreference")
            : null;
        if (selectedPreference) {
          url += `&preferences_id=${selectedPreference}`;
        }
      }
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error(`Failed to trigger ${action}`);

      toast({
        title: "Success",
        description: `The ${action} process has completed. Refreshing data...`,
      });
      fetchData();
    } catch (error) {
      console.error(`Failed to trigger ${action}:`, error);
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
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload");

      toast({
        title: "Success",
        description: "Pitch deck updated successfully. Refreshing data...",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to upload to API:", error);
      throw error;
    }
  };

  if (loading && !processingAction) {
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
      <div className="flex-1 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error Loading Application</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center space-x-4 mb-6">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Application not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Replace the unresolvedIssuesCount calculation with:
  const unresolvedIssuesCount = app.issues?.length || 0;

  return (
    <>
      {processingAction && <FullScreenLoader action={processingAction} />}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live Data</span>
          </div>
        </div>

        {/* Application Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">{app.startup_name}</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xl px-4 py-2">
                Score: {app.score && app.score > 0 ? `${app.score}` : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Contact Name:
              </span>
              <p className="text-sm mt-1">
                {app.contact_name || "Not provided"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Contact Email:
              </span>
              <p className="text-sm mt-1">
                {app.contact_email || "Not provided"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Website:
              </span>
              <p className="text-sm mt-1">
                {app.website_url ? (
                  <a
                    href={app.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {app.website_url}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Status:
              </span>
              <div className="mt-1">{getStatusBadge(app.status)}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Pitch Deck:
              </span>
              <div className="mt-1 flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <FileUploadModal onUpload={handleFileUpload} />
                </Dialog>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(app.last_updated_at).toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleTriggerAction("extract")}
            variant="outline"
            disabled={!!processingAction}
          >
            {processingAction === "extract" ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Trigger Data Extract
              </>
            )}
          </Button>
          <Button
            onClick={() => handleTriggerAction("enhance")}
            variant="outline"
            disabled={!!processingAction}
          >
            {processingAction === "enhance" ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Trigger Data Enhancement
              </>
            )}
          </Button>
          <Button
            onClick={() => handleTriggerAction("evaluate")}
            variant="outline"
            disabled={!!processingAction}
          >
            {processingAction === "evaluate" ? (
              <>
                <BarChart3 className="mr-2 h-4 w-4 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Trigger Evaluation
              </>
            )}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview & Scores</TabsTrigger>
            <TabsTrigger value="enriched">Enriched Data</TabsTrigger>
            <TabsTrigger value="raw">Raw Extracted Data</TabsTrigger>
            <TabsTrigger value="notes">
              Notes{" "}
              {unresolvedIssuesCount > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {unresolvedIssuesCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  AI-generated evaluation summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  {app.results && Object.keys(app.results).length > 0
                    ? "Evaluation completed with detailed scoring across all dimensions."
                    : "No summary available. Please trigger an evaluation."}
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                "founders",
                "market",
                "product",
                "traction",
                "vision",
                "investors",
              ].map((dimension) => {
                const dimensionData = app.results?.[dimension];
                if (!dimensionData || dimensionData.score === -1) {
                  return (
                    <Card key={dimension}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {dimension.charAt(0).toUpperCase() +
                            dimension.slice(1)}
                        </CardTitle>
                        {React.createElement(getIconForDimension(dimension), {
                          className: "h-4 w-4 text-muted-foreground",
                        })}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">
                          Not Computed
                        </div>
                        <Progress value={0} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Evaluation pending
                        </p>
                        <Badge variant="outline" className="mt-2">
                          0% confidence
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                }
                return (
                  <ScoreCard
                    key={dimension}
                    title={
                      dimension.charAt(0).toUpperCase() + dimension.slice(1)
                    }
                    score={dimensionData.score}
                    summary={dimensionData.bucket || "No summary available"}
                    confidence={dimensionData.confidenceScore}
                    icon={getIconForDimension(dimension)}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="enriched" className="space-y-4">
            {app.enriched && Object.keys(app.enriched).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "market",
                  "vision",
                  "product",
                  "founders",
                  "traction",
                  "investors",
                ].map((dimension) => {
                  const dimensionData = app.enriched?.[dimension];
                  if (!dimensionData) return null;
                  return (
                    <Card key={dimension}>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          {React.createElement(getIconForDimension(dimension), {
                            className: "h-5 w-5",
                          })}
                          <span>{formatKey(dimension)} (Enriched)</span>
                        </CardTitle>
                        <CardDescription>
                          AI-enhanced {dimension} intelligence
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(dimensionData).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium">
                              {formatKey(key)}:
                            </span>{" "}
                            {renderValue(value)}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No enhanced data available. Please trigger data enhancement.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="raw">
            {app.raw ? (
              <RawDataSections rawData={app.raw} onSave={handleSaveRawData} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No raw data available. Please trigger data extraction.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes">
            {app.issues && app.issues.length > 0 ? (
              <NotesTable issues={app.issues} />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No issues or action items
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function getStatusBadge(status: string | null | undefined) {
  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const variants = {
    completed: "default",
    submitted: "secondary",
    incomplete: "destructive",
  } as const;

  return (
    <Badge variant={variants[status as keyof typeof variants] || "outline"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function RawDataSections({
  rawData,
  onSave,
}: {
  rawData: any;
  onSave: (data: any) => void;
}) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<any>(null);

  const handleEditClick = (sectionKey: string) => {
    setIsEditing(sectionKey);
    setEditableData(JSON.parse(JSON.stringify(rawData[sectionKey])));
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditableData(null);
  };

  const handleSave = () => {
    if (!isEditing) return;
    const updatedRawData = { ...rawData, [isEditing]: editableData };
    onSave(updatedRawData);
    setIsEditing(null);
    setEditableData(null);
  };

  const handleFieldChange = (path: (string | number)[], value: any) => {
    setEditableData((prevData: any) => {
      const newData = JSON.parse(JSON.stringify(prevData));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const renderEditableField = (value: any, path: (string | number)[]) => {
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === "string")) {
        return (
          <Textarea
            value={value.join("\n")}
            onChange={(e) =>
              handleFieldChange(
                path,
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            className="text-sm"
            rows={value.length + 1}
          />
        );
      }
      return (
        <div className="space-y-4">
          {value.map((item, index) => (
            <div
              key={index}
              className="p-3 border rounded-md space-y-2 bg-muted/50"
            >
              <h4 className="font-semibold text-sm">Item {index + 1}</h4>
              {Object.entries(item).map(([itemKey, itemValue]) => (
                <div key={itemKey}>
                  <label className="text-xs font-medium text-muted-foreground">
                    {formatKey(itemKey)}
                  </label>
                  {renderEditableField(itemValue, [...path, index, itemKey])}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === "object" && value !== null) {
      return (
        <div className="p-3 border rounded-md space-y-2 bg-muted/50">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey}>
              <label className="text-xs font-medium text-muted-foreground">
                {formatKey(nestedKey)}
              </label>
              {renderEditableField(nestedValue, [...path, nestedKey])}
            </div>
          ))}
        </div>
      );
    }
    if (typeof value === "boolean") {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleFieldChange(path, e.target.value === "true")}
          className="text-sm w-full p-2 border rounded-md bg-background"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    if (typeof value === "number") {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            handleFieldChange(path, Number.parseFloat(e.target.value) || 0)
          }
          className="text-sm"
        />
      );
    }
    return (
      <Input
        value={value === null || value === "null" ? "" : String(value)}
        onChange={(e) => handleFieldChange(path, e.target.value)}
        className="text-sm"
        placeholder="Not provided"
      />
    );
  };

  return (
    <div className="space-y-6">
      {Object.entries(rawData).map(([sectionKey, sectionData]) => (
        <Card key={sectionKey}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                {React.createElement(getIconForDimension(sectionKey), {
                  className: "mr-2 h-5 w-5",
                })}
                {formatKey(sectionKey)}
              </CardTitle>
              {isEditing === sectionKey ? (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(sectionKey)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </div>
            <CardDescription>
              Raw extracted data for {sectionKey}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isEditing === sectionKey ? (
                typeof editableData === "object" && editableData !== null ? (
                  Object.entries(editableData).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-1">
                      <label className="text-sm font-medium">
                        {formatKey(key)}
                      </label>
                      {renderEditableField(value, [key])}
                    </div>
                  ))
                ) : (
                  renderEditableField(editableData, [])
                )
              ) : typeof sectionData === "object" && sectionData !== null ? (
                Object.entries(sectionData).map(([key, value]) => (
                  <div key={key} className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatKey(key)}
                    </span>
                    <div className="text-sm">{renderValue(value)}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm">{renderValue(sectionData)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
