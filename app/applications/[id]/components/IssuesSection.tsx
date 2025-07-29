import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, FileText, Target, Database, ChevronDown, ChevronRight } from "lucide-react";

interface IssuesSectionProps {
  issues: {
    enrichment_issues: string[];
    evaluation_issues: string[];
    extraction_issues: string[];
  };
  isLoading?: boolean;
}

export function IssuesSection({ issues, isLoading = false }: IssuesSectionProps) {
  console.log("IssuesSection rendered with issues:", issues, "isLoading:", isLoading);

  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

  const toggleCategory = (categoryIndex: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryIndex]: !prev[categoryIndex]
    }));
  };

  const totalIssues = (issues?.enrichment_issues?.length || 0) +
    (issues?.evaluation_issues?.length || 0) +
    (issues?.extraction_issues?.length || 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues & Action Items</CardTitle>
          <CardDescription>
            Identified issues and manual action items during processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading issues...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalIssues === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Issues & Action Items</CardTitle>
          <CardDescription>
            Identified issues and manual action items during processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4 text-lg font-medium">No issues or action items</p>
            <p className="mt-2 text-sm">Everything looks good!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const issueCategories = [
    {
      title: "Extraction Issues",
      description: "Issues encountered during data extraction from documents",
      icon: Database,
      issues: issues?.extraction_issues || [],
      variant: "destructive" as const,
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      title: "Enrichment Issues",
      description: "Issues during data enrichment and processing",
      icon: FileText,
      issues: issues?.enrichment_issues || [],
      variant: "default" as const,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
    {
      title: "Evaluation Issues",
      description: "Issues during analysis and evaluation processes",
      icon: Target,
      issues: issues?.evaluation_issues || [],
      variant: "default" as const,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    }
  ];

  const categoriesWithIssues = issueCategories.filter(category => category.issues.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Issues & Action Items
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
            {totalIssues}
          </span>
        </CardTitle>
        <CardDescription>
          Identified issues and manual action items during processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoriesWithIssues.map((category, categoryIndex) => {
            const isExpanded = expandedCategories[categoryIndex]; // Default to expanded

            return (
              <div key={categoryIndex} className="space-y-3">
                {/* Category Header - Clickable */}
                <div
                  className="flex items-center gap-3 pb-2 border-b cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => toggleCategory(categoryIndex)}
                >
                  <div className={`w-8 h-8 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                    <category.icon className={`h-4 w-4 ${category.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{category.title}</h3>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <span className={`${category.bgColor} ${category.iconColor} text-xs font-medium px-2 py-1 rounded-full`}>
                    {category.issues.length}
                  </span>
                  {/* Expand/Collapse Icon */}
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Issues List - Collapsible */}
                {isExpanded && (
                  <div className="space-y-3 ml-4">
                    {category.issues.map((issue, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}