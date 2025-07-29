import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ApplicationDetail } from "../lib/types";
import { getIconForDimension } from "../lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Enhanced sub-component for a single scorecard
function ScoreCard({
  title,
  score,
  summary,
  confidence,
  icon: Icon,
  breakdown,
  manualCheck,
}: {
  title: string;
  score: number;
  summary: string;
  confidence: number;
  icon: React.ElementType;
  breakdown?: any;
  manualCheck?: boolean;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const hasBreakdown =
    breakdown &&
    typeof breakdown === "object" &&
    Object.keys(breakdown).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {manualCheck && (
            <Badge variant="secondary" className="text-xs">
              Manual Review
            </Badge>
          )}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <Badge variant="outline" className="text-xs">
            {confidence}% confidence
          </Badge>
        </div>
        <Progress value={score} className="mt-2" />
        {summary && (
          <p className="text-xs text-muted-foreground mt-2">{summary}</p>
        )}
        {/* Breakdown Section */}
        {hasBreakdown && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-3 w-3" />
              <span>View Breakdown</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-2">
              {Object.entries(breakdown).map(([key, data]: [string, any]) => (
                <div key={key} className="border-l-2 border-muted pl-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span
                      className={`text-xs font-bold ${getScoreColor(
                        data.score
                      )}`}
                    >
                      {data.score}
                    </span>
                  </div>
                  {data.rationale && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.rationale}
                    </p>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

// Main section component
interface ScorecardSectionProps {
  results: ApplicationDetail["results"];
}

export function ScorecardSection({ results }: ScorecardSectionProps) {
  const hasResults = results && Object.keys(results).length > 0;
  const totalScore = hasResults
    ? Object.values(results).reduce(
        (sum, result) => sum + (result.score || 0),
        0
      ) / Object.keys(results).length
    : 0;
  const totalConfidence = hasResults
    ? Object.values(results).reduce(
        (sum, result) => sum + (result.confidence_score || 0),
        0
      ) / Object.keys(results).length
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Summary</CardTitle>
          <CardDescription>AI-generated evaluation summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasResults ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {totalScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {totalConfidence.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Average Confidence
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-muted-foreground">
                No evaluation data available
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Please trigger an evaluation to see detailed results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dimension Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          "founders",
          "market",
          "product",
          "traction",
          "vision",
          "investors",
        ].map((dimension) => {
          const dimensionData = results?.[dimension];
          const Icon = getIconForDimension(dimension);
          const title = dimension.charAt(0).toUpperCase() + dimension.slice(1);

          if (!dimensionData || dimensionData.score === -1) {
            return (
              <Card key={dimension} className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
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
              title={title}
              score={dimensionData.score || 0}
              summary={
                dimensionData.bucket ||
                dimensionData.summary ||
                "No summary available"
              }
              confidence={dimensionData.confidence_score || 0}
              icon={Icon}
              breakdown={dimensionData.breakdown}
              manualCheck={
                dimensionData.manualCheck || dimensionData.manual_check
              }
            />
          );
        })}
      </div>
    </div>
  );
}
