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

// Sub-component for a single scorecard
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
  icon: React.ElementType;
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

// Main section component
interface ScorecardSectionProps {
  results: ApplicationDetail["results"];
}

export function ScorecardSection({ results }: ScorecardSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>AI-generated evaluation summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {results && Object.keys(results).length > 0
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
          const dimensionData = results?.[dimension];
          const Icon = getIconForDimension(dimension);
          const title = dimension.charAt(0).toUpperCase() + dimension.slice(1);

          if (!dimensionData || dimensionData.score === -1) {
            return (
              <Card key={dimension}>
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
              score={dimensionData.score}
              summary={dimensionData.bucket || "No summary available"}
              confidence={dimensionData.confidence_score}
              icon={Icon}
            />
          );
        })}
      </div>
    </div>
  );
}
