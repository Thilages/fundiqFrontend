// pitchdeck/app/applications/[id]/components/FileUploadModal.tsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface FileUploadModalProps {
  onUpload: (file: File) => Promise<void>;
}

export function FileUploadModal({ onUpload }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
