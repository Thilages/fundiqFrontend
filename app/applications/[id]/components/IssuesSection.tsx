// pitchdeck/app/applications/[id]/components/IssuesSection.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface IssuesSectionProps {
  issues: string[];
}

export function IssuesSection({ issues }: IssuesSectionProps) {
  if (!issues || issues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues & Action Items</CardTitle>
          <CardDescription>Identified issues and manual action items during processing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No issues or action items</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues & Action Items</CardTitle>
        <CardDescription>Identified issues and manual action items during processing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/50">
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
