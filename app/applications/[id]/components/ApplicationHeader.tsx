// pitchdeck/app/applications/[id]/components/ApplicationHeader.tsx

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, Edit, AlertCircle, Eye } from "lucide-react";
import { ApplicationDetail } from "../lib/types";
import { getStatusBadge } from "../lib/utils";
import { FileUploadModal } from "./FileUploadModal";
import { useToast } from "@/hooks/use-toast";
import { openPdfInNewTab } from "../lib/pdf-viewer";

interface ApplicationHeaderProps {
  app: ApplicationDetail;
  error?: string | null;
  onFileUpload: (file: File) => Promise<void>;
}

export function ApplicationHeader({
  app,
  error,
  onFileUpload,
}: ApplicationHeaderProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleViewPdf = async () => {
    setLoading(true);
    try {
      await openPdfInNewTab(app.id);
    } catch (error) {
      console.error('Failed to open PDF:', error);
      toast({
        title: "Error",
        description: "Failed to open PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Error state display
  if (error) {
    return (
      <>
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
      </>
    );
  }

  // Header for a successfully loaded application
  return (
    <>
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
            <p className="text-sm mt-1">{app.contact_name || "Not provided"}</p>
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
                  href={`https://${app.website_url}`}
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPdf}
                disabled={loading}
              >
                <Eye className="mr-2 h-4 w-4" />
                {loading ? "Opening..." : "View PDF"}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <FileUploadModal onUpload={onFileUpload} />
              </Dialog>
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(app.last_updated_at).toLocaleString()}
        </div>
      </div>
    </>
  );
}
