// pitchdeck/app/applications/[id]/lib/utils.tsx

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
} from "lucide-react";

// Formats a snake_case key into Title Case
export function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Renders a badge based on the application status
export function getStatusBadge(status: string | null | undefined) {
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

// Returns an icon component based on a dimension key
export function getIconForDimension(dimension: string) {
  const icons: { [key: string]: React.ElementType } = {
    founders: Users,
    market: Target,
    product: Lightbulb,
    traction: TrendingUp,
    vision: BarChart3,
    investors: DollarSign,
  };
  return icons[dimension] || Users;
}

// Recursively renders values for display, handling various data types
export function renderValue(value: any): React.ReactNode {
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
                    <span className="font-bold">{formatKey(key)}: </span>
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
          <div key={key} className="text-sm">
            <span className="font-bold">{formatKey(key)}: </span>
            {renderValue(val)}
          </div>
        ))}
      </div>
    );
  }
  return <span>{String(value)}</span>;
}
