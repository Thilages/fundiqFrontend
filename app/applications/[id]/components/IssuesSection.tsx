// pitchdeck/app/applications/[id]/components/IssuesSection.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface IssuesSectionProps {
  issues: string[];
  isLoading: boolean;
}

export function IssuesSection({ issues, isLoading }: IssuesSectionProps) {
  const hasIssues = issues && issues.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Action Items</CardTitle>
        <CardDescription>
          Identified issues and manual action items during processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        ) : hasIssues ? (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <Alert key={index} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required</AlertTitle>
                <AlertDescription>{issue}</AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4 text-lg font-medium">No issues or action items</p>
            <p className="mt-2 text-sm">Everything looks good!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}