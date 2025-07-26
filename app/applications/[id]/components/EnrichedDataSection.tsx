// pitchdeck/app/applications/[id]/components/EnrichedDataSection.tsx

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApplicationDetail } from "../lib/types";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
} from "lucide-react";

function formatKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
                  <div key={key} className="text-sm">
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

// Dimension Card Components
interface DimensionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  data: Record<string, any>;
}

function DimensionCard({
  title,
  description,
  icon: Icon,
  data,
}: DimensionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <span>{title} (Enriched)</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="text-md">
            <span className="font-bold">{formatKey(key)}:</span>{" "}
            {renderValue(value)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FoundersCard({ data }: { data: Record<string, any> }) {
  console.log(data);
  return (
    <DimensionCard
      title="Founders"
      description="AI-enhanced founder intelligence"
      icon={Users}
      data={data}
    />
  );
}

function MarketCard({ data }: { data: Record<string, any> }) {
  return (
    <DimensionCard
      title="Market"
      description="AI-enhanced market intelligence"
      icon={Target}
      data={data}
    />
  );
}

function ProductCard({ data }: { data: Record<string, any> }) {
  return (
    <DimensionCard
      title="Product"
      description="AI-enhanced product intelligence"
      icon={Lightbulb}
      data={data}
    />
  );
}

function TractionCard({ data }: { data: Record<string, any> }) {
  return (
    <DimensionCard
      title="Traction"
      description="AI-enhanced traction intelligence"
      icon={TrendingUp}
      data={data}
    />
  );
}

function VisionCard({ data }: { data: Record<string, any> }) {
  return (
    <DimensionCard
      title="Vision"
      description="AI-enhanced vision intelligence"
      icon={BarChart3}
      data={data}
    />
  );
}

function InvestorsCard({ data }: { data: Record<string, any> }) {
  return (
    <DimensionCard
      title="Investors"
      description="AI-enhanced investor intelligence"
      icon={DollarSign}
      data={data}
    />
  );
}

interface EnrichedDataSectionProps {
  enrichedData: ApplicationDetail["enriched"];
}

export function EnrichedDataSection({
  enrichedData,
}: EnrichedDataSectionProps) {
  if (!enrichedData || Object.keys(enrichedData).length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">
            No enhanced data available. Please trigger data enhancement.
          </p>
        </CardContent>
      </Card>
    );
  }

  const dimensionComponents = {
    founders: FoundersCard,
    market: MarketCard,
    product: ProductCard,
    traction: TractionCard,
    vision: VisionCard,
    investors: InvestorsCard,
  };

  return (
    <div className="grid">
      {["market", "vision", "product", "founders", "traction", "investors"].map(
        (dimension) => {
          const dimensionData = enrichedData?.[dimension];
          if (!dimensionData) return null;

          const DimensionComponent =
            dimensionComponents[dimension as keyof typeof dimensionComponents];

          return (
            <DimensionComponent key={dimension} data={dimensionData.data} />
          );
        }
      )}
    </div>
  );
}
