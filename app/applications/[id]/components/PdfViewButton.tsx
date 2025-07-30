// pitchdeck/app/applications/[id]/components/PdfViewButton.tsx

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, ExternalLink, FileText } from "lucide-react";
import { PdfViewerModal } from "./PdfViewerModal";
import { openPdfInNewTab } from "../lib/pdf-viewer";

interface PdfViewButtonProps {
  applicationId: string;
  attachmentId?: string;
  variant?: "modal" | "newTab" | "both";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function PdfViewButton({
  applicationId,
  attachmentId,
  variant = "both",
  size = "sm",
  className = "",
  children
}: PdfViewButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNewTabClick = async () => {
    setLoading(true);
    try {
      await openPdfInNewTab(applicationId, attachmentId);
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

  if (variant === "modal") {
    return (
      <>
        <Button
          variant="outline"
          size={size}
          onClick={() => setIsModalOpen(true)}
          className={className}
        >
          <Eye className="mr-2 h-4 w-4" />
          {children || "View PDF"}
        </Button>
        <PdfViewerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          applicationId={applicationId}
          attachmentId={attachmentId}
        />
      </>
    );
  }

  if (variant === "newTab") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleNewTabClick}
        disabled={loading}
        className={className}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        {children || "Open PDF"}
      </Button>
    );
  }

  // Both options
  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size={size}
          onClick={() => setIsModalOpen(true)}
          className={className}
        >
          <Eye className="mr-2 h-4 w-4" />
          {children || "View PDF"}
        </Button>
        <Button
          variant="ghost"
          size={size}
          onClick={handleNewTabClick}
          disabled={loading}
          title="Open in new tab"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
      <PdfViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicationId={applicationId}
        attachmentId={attachmentId}
      />
    </>
  );
}
