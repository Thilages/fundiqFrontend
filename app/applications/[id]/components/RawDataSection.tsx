// pitchdeck/app/applications/[id]/components/CompanyProfileDisplay.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  Building2,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Info,
  Briefcase,
  GraduationCap,
  Linkedin,
  LucideIcon,
  CheckCircle2,
  XCircle,
  BarChart3,
  ShieldCheck,
  FileText,
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  UserCheck,
  Activity,
} from "lucide-react";

// 1. --- ACCURATE TYPE DEFINITIONS ---
// These interfaces are rewritten to precisely match the provided JSON data structure.

interface CompanyBasicInfo {
  company_name?: string;
  company_website?: string;
  founding_year?: number;
  industry_category?: string;
  location?: string;
}

interface ContactInfo {
  emails?: string[];
  phone_numbers?: string[];
}

interface FounderInformation {
  name?: string;
  current_designation?: string;
  founder_summary?: string;
  linkedin_url?: string | null;
  total_experience_years?: number;
  education?: { degree?: string; institution?: string | null }[];
  work_history?: { company?: string }[];
  skills_and_expertise?: {
    primary_skill_category?: string;
    secondary_skills?: string[];
  };
  seniority_and_background?: {
    is_repeat_founder?: boolean;
  };
}

interface FoundersData {
  total_founders?: number;
  team_summary?: string;
  founders_informations?: FounderInformation[];
  team_dynamics?: {
    skills_complementarity?: {
      skill_coverage?: string[];
      skill_gaps?: string[];
    };
    cohesiveness_analysis?: {
      shared_employers?: string[];
    };
  };
}

interface MarketData {
  problem_and_validation?: {
    problem_statement?: string;
    market_growth_potential?: string;
  };
  market_size_analysis?: {
    tam?: string | null;
    sam?: string | null;
    som?: string | null;
  };
  competitive_landscape?: {
    competitive_positioning?: string;
    competitors_mentioned?: string[];
    differentiation_claims?: string[];
    market_saturation_level?: string;
  };
  regulatory_environment?: {
    compliance_details?: string;
    regulatory_risks?: string;
  };
  geographic_and_scalability?: {
    target_geography?: string;
    global_scalability_indicators?: string;
  };
}

interface ProductData {
  product_overview?: {
    product_description?: string;
    unique_value_proposition?: string;
    target_user_segments?: string[];
  };
  technology_and_innovation?: {
    technology_stack?: string[];
    innovation_level?: string;
  };
  market_fit_indicators?: {
    product_market_fit_claims?: string;
  };
}

interface TractionData {
  traction_metrics?: {
    metrics_verification_status?: string;
    user_metrics?: {
      users?: string;
      user_growth_rate?: string;
    };
    financial_metrics?: {
      revenue_growth_rate?: string;
      unit_economics?: string;
    };
    other_kpis?: string[];
  };
  revenue_model_assessment?: {
    pricing_strategy?: string;
    revenue_streams?: string[];
  };
  business_model_analysis?: {
    go_to_market_strategy?: string;
  };
  customer_and_market_validation?: {
    customer_portfolio?: {
      current_customers?: string[];
    };
  };
}

interface InvestorsData {
  funding_round_context?: {
    round_details?: {
      round_stage?: string;
      round_size?: string;
      round_completion_status?: string;
      lead_investor?: string | null;
    };
    investment_validation?: {
      investor_credibility?: string;
      funding_adequacy?: string;
      round_competitiveness?: string;
    };
  };
  coinvestor_analysis?: {
    coinvestor_portfolio?: any[];
    coinvestor_metrics?: {
      total_coinvestors?: number;
      average_investor_quality?: string | null;
      institutional_vs_angel_ratio?: string | null;
    };
  };
  advisory_board_analysis?: {
    advisors?: any[];
    advisor_portfolio_strength?: {
      total_advisors?: number;
      advisor_relevance_score?: string | null;
      domain_coverage?: string[];
    };
  };
  evaluation_readiness?: {
    funding_round_details_clear?: boolean;
    coinvestor_count_identifiable?: boolean;
    advisor_backgrounds_available?: boolean;
    track_record_data_present?: boolean;
  };
  exit_potential_indicators?: {
    exit_pathway_clarity?: string;
    follow_on_potential?: string | null;
    strategic_investor_presence?: boolean;
    investor_exit_history?: any[];
  };
  extraction_confidence?: number;
}

interface VisionData {
  vision_and_mission?: {
    mission_statement?: string;
    vision_statement?: string | null;
  };
  market_differentiation?: {
    competitive_moats?: string[];
    positioning_strategy?: string;
  };
  strategic_roadmap?: {
    future_roadmap?: string;
    expansion_strategy?: string;
  };
  founder_resilience_analysis?: {
    resilience_indicators?: {
      challenges_overcome?: string;
    };
  };
}

interface ExtractionMetadata {
  extraction_confidence?: number;
  data_completeness?: number;
  extraction_timestamp?: string;
  missing_critical_data?: string[];
}

interface CompanyProfile {
  company_basic_info?: CompanyBasicInfo;
  contact_info?: ContactInfo;
  founders?: FoundersData;
  market?: MarketData;
  product?: ProductData;
  traction?: TractionData;
  investors?: InvestorsData;
  vision?: VisionData;
  extraction_metadata?: ExtractionMetadata;
}

// 2. --- HELPER & UTILITY COMPONENTS ---

// Formats snake_case or camelCase keys into "Title Case"
const formatKey = (key: string): string => {
  const result = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// A consistent badge for displaying tags, skills, etc.
const InfoBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-gray-200 text-black text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-md">
    {children}
  </span>
);

// Professional badge variants for different types of data
const PrimaryBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block text-black bg-gray-200 text-xs font-semibold mr-2 mb-2 px-3 py-1.5 rounded-md">
    {children}
  </span>
);

const SecondaryBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-white text-black border border-gray-300 text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-md">
    {children}
  </span>
);

const StatusBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' }> = ({
  children,
  variant = 'neutral'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return "bg-gray-900 text-white";
      case 'warning':
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  return (
    <span className={`inline-block text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full ${getVariantClasses()}`}>
      {children}
    </span>
  );
};

const MetricBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-gray-100 text-gray-800 border border-gray-400 text-sm font-medium mr-2 mb-2 px-3 py-1.5 rounded-lg">
    {children}
  </span>
);

const CategoryBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-block bg-gray-800 text-white text-xs font-medium mr-2 mb-2 px-3 py-1 rounded-sm uppercase tracking-wide">
    {children}
  </span>
);

// Helper component to render different types of arrays with appropriate badges
const SmartArrayDisplay: React.FC<{
  value: any[];
  type?: 'skills' | 'companies' | 'metrics' | 'categories' | 'general';
}> = ({ value, type = 'general' }) => {
  if (!Array.isArray(value) || value.length === 0) {
    return <span className="text-gray-500 italic">None specified</span>;
  }

  const getBadgeComponent = (item: any, index: number) => {
    const content = typeof item === 'string' ? item : String(item);

    switch (type) {
      case 'skills':
        return index === 0 ? (
          <PrimaryBadge key={index}>{content}</PrimaryBadge>
        ) : (
          <InfoBadge key={index}>{content}</InfoBadge>
        );
      case 'companies':
        return <CategoryBadge key={index}>{content}</CategoryBadge>;
      case 'metrics':
        return <MetricBadge key={index}>{content}</MetricBadge>;
      case 'categories':
        return <SecondaryBadge key={index}>{content}</SecondaryBadge>;
      default:
        return <InfoBadge key={index}>{content}</InfoBadge>;
    }
  };

  return (
    <div className="flex flex-wrap items-center -mb-2">
      {value.map((item, index) => getBadgeComponent(item, index))}
    </div>
  );
};

// Specialized component for funding and status information
const StatusDisplay: React.FC<{ value: string; type?: 'funding' | 'completion' | 'stage' }> = ({
  value,
  type = 'funding'
}) => {
  if (!value) return <span className="text-gray-500 italic">Not specified</span>;

  const getStatusVariant = () => {
    const lowerValue = value.toLowerCase();
    if (type === 'completion') {
      if (lowerValue.includes('complete') || lowerValue.includes('closed')) return 'success';
      if (lowerValue.includes('ongoing') || lowerValue.includes('active')) return 'warning';
    }
    if (type === 'stage') {
      if (lowerValue.includes('series') || lowerValue.includes('round')) return 'success';
    }
    return 'neutral';
  };

  return <StatusBadge variant={getStatusVariant()}>{value}</StatusBadge>;
};

// Component for monetary amounts
const AmountDisplay: React.FC<{ value: string }> = ({ value }) => {
  if (!value) return <span className="text-gray-500 italic">Not disclosed</span>;
  return <MetricBadge>{value}</MetricBadge>;
};

// Editable input for text values
const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, placeholder, multiline = false }) => {
  if (multiline) {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical min-h-[60px]"
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

// A flexible component to display various data types gracefully.
// A flexible component to display and edit various data types
const ValueDisplay: React.FC<{
  value: any;
  editable?: boolean;
  onUpdate?: (newValue: any) => void;
  path?: string;
}> = ({ value, editable = false, onUpdate, path }) => {
  // Only editable if both editable is true and onUpdate is provided
  const isEditable = editable && onUpdate;

  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    if (isEditable) {
      return (
        <EditableText
          value=""
          onChange={(newValue) => onUpdate(newValue)}
          placeholder="Enter value..."
        />
      );
    }
    return <span className="text-gray-500 italic">N/A</span>;
  }

  if (Array.isArray(value)) {
    if (isEditable) {
      return (
        <EditableText
          value={value.length > 0 ? value.join(", ") : ""}
          onChange={(newValue) => {
            // Convert comma-separated string to array
            const arrayValue = newValue
              ? newValue
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item)
              : [];
            onUpdate(arrayValue);
          }}
          placeholder="Enter comma-separated values..."
        />
      );
    }

    if (value.length === 0) {
      return <span className="text-gray-500 italic">None specified</span>;
    }

    // Display arrays of strings as badges (read-only mode)
    if (value.every((item) => typeof item === "string")) {
      // Determine badge type based on the path or content
      let badgeType: 'skills' | 'companies' | 'metrics' | 'categories' | 'general' = 'general';

      // Only use badges for specific types of short list items, not for long text arrays
      const hasLongText = value.some(item => typeof item === 'string' && item.length > 100);

      if (hasLongText) {
        // For arrays with long text, display as regular text list
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="text-sm text-black">
                • {item}
              </div>
            ))}
          </div>
        );
      }

      if (path?.includes('skill') || path?.includes('expertise')) {
        badgeType = 'skills';
      } else if (path?.includes('company') || path?.includes('competitors') || path?.includes('employers')) {
        badgeType = 'companies';
      } else if (path?.includes('metrics') || path?.includes('kpi')) {
        badgeType = 'metrics';
      } else if (path?.includes('technology') || path?.includes('segments') || path?.includes('moats')) {
        badgeType = 'categories';
      }

      return <SmartArrayDisplay value={value} type={badgeType} />;
    }    // Handle arrays of objects (like advisors, coinvestors)
    if (value.every((item) => typeof item === "object" && item !== null)) {
      return (
        <div className="space-y-3">
          {value.map((item, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(item).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      {formatKey(key)}
                    </span>
                    <span className="text-sm text-black font-medium">
                      {val ? String(val) : <span className="text-gray-400 italic">Not specified</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
        <pre className="text-xs text-black whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    );
  }

  if (typeof value === "boolean") {
    if (isEditable) {
      return (
        <select
          value={value ? "true" : "false"}
          onChange={(e) => onUpdate(e.target.value === "true")}
          className="p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px]"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }
    return value ? (
      <span className="flex items-center text-green-600">
        <CheckCircle2 className="h-4 w-4 mr-2" /> Yes
      </span>
    ) : (
      <span className="flex items-center text-red-600">
        <XCircle className="h-4 w-4 mr-2" /> No
      </span>
    );
  }

  if (typeof value === "number") {
    if (isEditable) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter number..."
        />
      );
    }

    // Use metric badge only for specific numeric contexts that benefit from highlighting
    if (path?.includes('experience') || path?.includes('confidence') || path?.includes('completeness')) {
      return <MetricBadge>{String(value)}</MetricBadge>;
    }

    // For founding year, just show as plain text
    return <span className="text-black">{String(value)}</span>;
  } if (typeof value === "object" && value !== null) {
    // Special handling for certain object structures
    if (Array.isArray(value)) {
      // This should be handled above, but just in case
      return <ValueDisplay value={value} editable={editable} onUpdate={onUpdate} path={path} />;
    }

    return (
      <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-1">
        {Object.entries(value).map(([key, val]) => (
          <DetailItem key={key} label={formatKey(key)}>
            <ValueDisplay
              value={val}
              editable={editable}
              onUpdate={
                isEditable
                  ? (newValue) => {
                    onUpdate({ ...value, [key]: newValue });
                  }
                  : undefined
              }
              path={path ? `${path}.${key}` : key}
            />
          </DetailItem>
        ))}
      </div>
    );
  }

  // String values
  if (isEditable) {
    const isLongText = typeof value === "string" && value.length > 100;
    return (
      <EditableText
        value={String(value)}
        onChange={onUpdate}
        placeholder="Enter value..."
        multiline={isLongText}
      />
    );
  }

  // Special handling for certain string types
  if (typeof value === "string") {
    const stringValue = String(value);

    // Only use special badges for specific short data types, not paragraphs
    const isLongText = stringValue.length > 50;
    const isParagraphText = isLongText || stringValue.includes('.') || stringValue.includes(',');

    // Handle funding stages and status (only for short, specific values)
    if (!isParagraphText && (path?.includes('round_stage') || path?.includes('stage'))) {
      return <StatusDisplay value={stringValue} type="stage" />;
    }
    if (!isParagraphText && (path?.includes('completion_status') || path?.includes('status'))) {
      return <StatusDisplay value={stringValue} type="completion" />;
    }
    // Handle monetary amounts (only for values that look like amounts)
    if (path?.includes('round_size') || path?.includes('size') ||
      (stringValue.includes('$') || stringValue.includes('M') || stringValue.includes('K')) && !isParagraphText) {
      return <AmountDisplay value={stringValue} />;
    }
  }

  return <span className="text-black">{String(value)}</span>;
};

// Consistently styled key-value pair for details.
const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-x-4 gap-y-1 items-start">
    <span className="text-sm font-medium text-gray-600">{label}:</span>
    <div>{children}</div>
  </div>
);

// Generic wrapper for each major section of the profile.
const Section: React.FC<{
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  editable?: boolean;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onSave?: () => void;
  hasChanges?: boolean;
  isSaving?: boolean;
}> = ({
  title,
  icon: Icon,
  children,
  editable = true,
  isEditing = false,
  onToggleEdit,
  onSave,
  hasChanges = false,
  isSaving = false,
}) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="flex items-center text-lg font-semibold text-black">
          <Icon className="w-5 h-5 mr-3 text-gray-500" />
          {title}
        </h2>
        <div className="flex items-center space-x-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={!hasChanges || isSaving}
              className={`
              flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${hasChanges && !isSaving
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }
            `}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              {isSaving ? "Saving..." : hasChanges ? "Save" : "Saved"}
            </button>
          )}
          {editable && onToggleEdit && (
            <button
              onClick={onToggleEdit}
              className={`
              flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }
            `}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );

// 3. --- SPECIALIZED CARD COMPONENTS ---

const FounderCard: React.FC<{
  founder: FounderInformation;
  onUpdate: (updatedFounder: FounderInformation) => void;
  onDelete: () => void;
  isEditing: boolean;
}> = ({ founder, onUpdate, onDelete, isEditing }) => {
  if (!founder) return null;

  const updateFounder = (field: string, value: any) => {
    const updatedFounder = { ...founder };
    const fields = field.split(".");
    let current: any = updatedFounder;

    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) current[fields[i]] = {};
      current = current[fields[i]];
    }

    current[fields[fields.length - 1]] = value;
    onUpdate(updatedFounder);
  };

  if (!isEditing) {
    // Read-only display mode
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-bold text-black">
              {founder.name || "Unnamed Founder"}
            </h3>
            <p className="text-sm text-gray-600">
              {founder.current_designation || "No designation"}
            </p>
          </div>
          {founder.linkedin_url && (
            <a
              href={founder.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600"
              aria-label={`${founder.name}'s LinkedIn Profile`}
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
        </div>

        {founder.founder_summary && (
          <p className="mt-3 text-sm text-black">
            {founder.founder_summary}
          </p>
        )}

        <div className="mt-4 space-y-3 text-sm">
          {founder.total_experience_years !== undefined && (
            <DetailItem label="Total Experience">
              <span className="text-black">
                {founder.total_experience_years} years
              </span>
            </DetailItem>
          )}
          {founder.seniority_and_background?.is_repeat_founder !==
            undefined && (
              <DetailItem label="Repeat Founder">
                {founder.seniority_and_background.is_repeat_founder ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Yes
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" /> No
                  </span>
                )}
              </DetailItem>
            )}
          {founder.education && founder.education.length > 0 && (
            <DetailItem label="Education">
              <div className="flex flex-wrap items-center">
                {founder.education.map((edu, i) => (
                  <SecondaryBadge key={i}>
                    {edu.degree}
                    {edu.institution ? ` @ ${edu.institution}` : ""}
                  </SecondaryBadge>
                ))}
              </div>
            </DetailItem>
          )}
          {founder.work_history && founder.work_history.length > 0 && (
            <DetailItem label="Past Companies">
              <div className="flex flex-wrap items-center">
                {founder.work_history.map((job, i) => (
                  <CategoryBadge key={i}>{job.company}</CategoryBadge>
                ))}
              </div>
            </DetailItem>
          )}
          {founder.skills_and_expertise && (
            <DetailItem label="Skills">
              <div className="flex flex-wrap items-center">
                {founder.skills_and_expertise.primary_skill_category && (
                  <PrimaryBadge>
                    {founder.skills_and_expertise.primary_skill_category}
                  </PrimaryBadge>
                )}
                {founder.skills_and_expertise.secondary_skills?.map(
                  (skill, i) => (
                    <InfoBadge key={i}>{skill}</InfoBadge>
                  )
                )}
              </div>
            </DetailItem>
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
        title="Delete founder"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex justify-between items-start mb-4 pr-8">
        <div className="flex-1 mr-4">
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Name
            </label>
            <EditableText
              value={founder.name || ""}
              onChange={(value) => updateFounder("name", value)}
              placeholder="Enter founder name..."
            />
          </div>
          <div className="mb-2">
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Designation
            </label>
            <EditableText
              value={founder.current_designation || ""}
              onChange={(value) => updateFounder("current_designation", value)}
              placeholder="Enter designation..."
            />
          </div>
        </div>
        <div className="w-48">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            LinkedIn URL
          </label>
          <EditableText
            value={founder.linkedin_url || ""}
            onChange={(value) => updateFounder("linkedin_url", value)}
            placeholder="Enter LinkedIn URL..."
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 block mb-1">
          Summary
        </label>
        <EditableText
          value={founder.founder_summary || ""}
          onChange={(value) => updateFounder("founder_summary", value)}
          placeholder="Enter founder summary..."
          multiline={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Experience (Years)
          </label>
          <input
            type="number"
            value={founder.total_experience_years || 0}
            onChange={(e) =>
              updateFounder(
                "total_experience_years",
                parseInt(e.target.value) || 0
              )
            }
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Years of experience..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Repeat Founder
          </label>
          <select
            value={
              founder.seniority_and_background?.is_repeat_founder
                ? "true"
                : "false"
            }
            onChange={(e) =>
              updateFounder(
                "seniority_and_background.is_repeat_founder",
                e.target.value === "true"
              )
            }
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Education (comma-separated)
          </label>
          <EditableText
            value={
              founder.education
                ?.map(
                  (edu) =>
                    `${edu.degree}${edu.institution ? ` @ ${edu.institution}` : ""
                    }`
                )
                .join(", ") || ""
            }
            onChange={(value) => {
              const educationArray = value
                ? value.split(",").map((item) => {
                  const parts = item.trim().split(" @ ");
                  return {
                    degree: parts[0] || "",
                    institution: parts[1] || null,
                  };
                })
                : [];
              updateFounder("education", educationArray);
            }}
            placeholder="e.g., MBA @ Stanford, BS Computer Science @ MIT..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Work History (comma-separated companies)
          </label>
          <EditableText
            value={
              founder.work_history
                ?.map((job) => job.company)
                .filter(Boolean)
                .join(", ") || ""
            }
            onChange={(value) => {
              const workArray = value
                ? value
                  .split(",")
                  .map((company) => ({ company: company.trim() }))
                : [];
              updateFounder("work_history", workArray);
            }}
            placeholder="e.g., Google, Microsoft, Apple..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Primary Skill
          </label>
          <EditableText
            value={founder.skills_and_expertise?.primary_skill_category || ""}
            onChange={(value) =>
              updateFounder(
                "skills_and_expertise.primary_skill_category",
                value
              )
            }
            placeholder="Primary skill category..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Secondary Skills (comma-separated)
          </label>
          <EditableText
            value={
              founder.skills_and_expertise?.secondary_skills?.join(", ") || ""
            }
            onChange={(value) => {
              const skillsArray = value
                ? value
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
                : [];
              updateFounder(
                "skills_and_expertise.secondary_skills",
                skillsArray
              );
            }}
            placeholder="e.g., Python, Management, Marketing..."
          />
        </div>
      </div>
    </div>
  );
};

// 4. --- MAIN COMPONENT ---

export function RawDataSection({
  initialData,
  onSave,
  autoSave = false,
}: {
  initialData: CompanyProfile | null;
  onSave?: (updatedData: CompanyProfile) => Promise<void>;
  autoSave?: boolean;
}) {
  const [data, setData] = useState<CompanyProfile | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Edit states for each section
  const [editStates, setEditStates] = useState({
    company: false,
    founders: false,
    market: false,
    product: false,
    traction: false,
    investors: false,
    vision: false,
    metadata: false,
  });

  // Track changes for each section
  const [sectionChanges, setSectionChanges] = useState({
    company: false,
    founders: false,
    market: false,
    product: false,
    traction: false,
    investors: false,
    vision: false,
    metadata: false,
  });

  // Track saving state for each section
  const [sectionSaving, setSectionSaving] = useState({
    company: false,
    founders: false,
    market: false,
    product: false,
    traction: false,
    investors: false,
    vision: false,
    metadata: false,
  });

  const toggleEditState = (section: keyof typeof editStates) => {
    setEditStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = useCallback(async () => {
    if (!onSave || !data || !hasChanges) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setHasChanges(false);
      // Reset all section changes
      setSectionChanges({
        company: false,
        founders: false,
        market: false,
        product: false,
        traction: false,
        investors: false,
        vision: false,
        metadata: false,
      });
      console.log("Data saved successfully");
    } catch (error) {
      console.error("Error saving data:", error);
      // You can add a toast notification here for error
    } finally {
      setIsSaving(false);
    }
  }, [onSave, data, hasChanges]);

  // Section-specific save handler
  const handleSectionSave = useCallback(
    async (section: keyof typeof editStates) => {
      if (!onSave || !data || !sectionChanges[section]) return;

      setSectionSaving((prev) => ({ ...prev, [section]: true }));
      try {
        await onSave(data);
        setSectionChanges((prev) => ({ ...prev, [section]: false }));
        setHasChanges(
          Object.values({ ...sectionChanges, [section]: false }).some(Boolean)
        );
        console.log(`${section} section saved successfully`);
      } catch (error) {
        console.error(`Error saving ${section} section:`, error);
        // You can add a toast notification here for error
      } finally {
        setSectionSaving((prev) => ({ ...prev, [section]: false }));
      }
    },
    [onSave, data, sectionChanges]
  );

  // Update local data when initialData changes
  useEffect(() => {
    setData(initialData);
    setHasChanges(false);
  }, [initialData]);

  // Add keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (hasChanges && !isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasChanges, isSaving, handleSave]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (autoSave && hasChanges && data && onSave) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save (3 seconds delay)
      const timeout = setTimeout(() => {
        handleSave();
      }, 3000);

      setAutoSaveTimeout(timeout);

      // Cleanup timeout on unmount
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [hasChanges, data, autoSave, onSave, autoSaveTimeout, handleSave]);

  // Helper function to update nested data
  const updateData = useCallback(
    (path: string, newValue: any) => {
      if (!data) return;

      const pathArray = path.split(".");
      const newData = { ...data };
      let current: any = newData;

      // Navigate to the parent of the target property
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];
        if (!current[key]) current[key] = {};
        current = current[key];
      }

      // Set the final value
      const finalKey = pathArray[pathArray.length - 1];
      current[finalKey] = newValue;

      setData(newData);
      setHasChanges(true);

      // Determine which section was changed
      const topLevelKey = pathArray[0];
      let section: keyof typeof sectionChanges;

      switch (topLevelKey) {
        case "company_basic_info":
          section = "company";
          break;
        case "founders":
          section = "founders";
          break;
        case "market":
          section = "market";
          break;
        case "product":
          section = "product";
          break;
        case "traction":
          section = "traction";
          break;
        case "investors":
          section = "investors";
          break;
        case "vision":
          section = "vision";
          break;
        case "contact_info":
        case "extraction_metadata":
          section = "metadata";
          break;
        default:
          section = "company"; // fallback
      }

      setSectionChanges((prev) => ({
        ...prev,
        [section]: true,
      }));
    },
    [data]
  );

  if (!data) {
    return (
      <div className="text-center bg-gray-50 rounded-lg text-gray-500">
        No company data available.
      </div>
    );
  }

  const {
    company_basic_info,
    contact_info,
    founders,
    market,
    product,
    traction,
    investors,
    vision,
    extraction_metadata,
  } = data;

  return (
    <div className="font-sans">
      <div className="mx-auto space-y-6">
        {/* Company Header */}
        {company_basic_info && (
          <Section
            title="Company Information"
            icon={Building2}
            isEditing={editStates.company}
            onToggleEdit={() => toggleEditState("company")}
            onSave={onSave ? () => handleSectionSave("company") : undefined}
            hasChanges={sectionChanges.company}
            isSaving={sectionSaving.company}
          >
            {editStates.company ? (
              <>
                <div className="flex items-center mb-4">
                  {/* <Building2 className="w-7 h-7 mr-4 text-gray-600 flex-shrink-0" /> */}
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Company Name
                    </label>
                    <EditableText
                      value={company_basic_info.company_name || ""}
                      onChange={(newValue) =>
                        updateData("company_basic_info.company_name", newValue)
                      }
                      placeholder="Enter company name..."
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Website
                  </label>
                  <EditableText
                    value={company_basic_info.company_website || ""}
                    onChange={(newValue) =>
                      updateData("company_basic_info.company_website", newValue)
                    }
                    placeholder="Enter company website..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <DetailItem label="Industry">
                    <ValueDisplay
                      value={company_basic_info.industry_category}
                      editable={true}
                      onUpdate={(newValue) =>
                        updateData(
                          "company_basic_info.industry_category",
                          newValue
                        )
                      }
                    />
                  </DetailItem>
                  <DetailItem label="Founded">
                    <ValueDisplay
                      value={company_basic_info.founding_year}
                      editable={true}
                      onUpdate={(newValue) =>
                        updateData(
                          "company_basic_info.founding_year",
                          parseInt(newValue) || newValue
                        )
                      }
                    />
                  </DetailItem>
                  <DetailItem label="Location">
                    <ValueDisplay
                      value={company_basic_info.location}
                      editable={true}
                      onUpdate={(newValue) =>
                        updateData("company_basic_info.location", newValue)
                      }
                    />
                  </DetailItem>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-black flex items-center">
                    {/* <Building2 className="w-7 h-7 mr-4 text-gray-600" /> */}
                    {company_basic_info.company_name || "Company Profile"}
                  </h1>
                  {company_basic_info.company_website && (
                    <a
                      href={`//${company_basic_info.company_website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-1 block "
                    >
                      {company_basic_info.company_website}
                    </a>
                  )}
                </div>
                <div className="space-y-2">
                  <DetailItem label="Industry">
                    <span className="text-black">
                      {company_basic_info.industry_category || "N/A"}
                    </span>
                  </DetailItem>
                  <DetailItem label="Founded">
                    <span className="text-black">
                      {company_basic_info.founding_year || "N/A"}
                    </span>
                  </DetailItem>
                  <DetailItem label="Location">
                    <span className="text-black">
                      {company_basic_info.location || "N/A"}
                    </span>
                  </DetailItem>
                </div>
              </>
            )}
          </Section>
        )}

        {/* Founders Section */}
        {founders && (
          <Section
            title="Founding Team"
            icon={Users}
            isEditing={editStates.founders}
            onToggleEdit={() => toggleEditState("founders")}
            onSave={onSave ? () => handleSectionSave("founders") : undefined}
            hasChanges={sectionChanges.founders}
            isSaving={sectionSaving.founders}
          >
            {/* Team Summary */}
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Team Summary
              </label>
              {editStates.founders ? (
                <EditableText
                  value={founders.team_summary || ""}
                  onChange={(newValue) =>
                    updateData("founders.team_summary", newValue)
                  }
                  placeholder="Enter team summary..."
                  multiline={true}
                />
              ) : (
                <p className="text-sm text-black italic">
                  {founders.team_summary
                    ? `"${founders.team_summary}"`
                    : "No team summary available"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {founders.founders_informations?.map((founder, index) => (
                <FounderCard
                  key={index}
                  founder={founder}
                  isEditing={editStates.founders}
                  onUpdate={(updatedFounder) => {
                    const newFounders = [
                      ...(founders.founders_informations || []),
                    ];
                    newFounders[index] = updatedFounder;
                    updateData("founders.founders_informations", newFounders);
                  }}
                  onDelete={() => {
                    const newFounders = [
                      ...(founders.founders_informations || []),
                    ];
                    newFounders.splice(index, 1);
                    updateData("founders.founders_informations", newFounders);
                  }}
                />
              ))}

              {/* Add Founder Button */}
              {editStates.founders && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-gray-400 transition-colors">
                  <button
                    onClick={() => {
                      const newFounder: FounderInformation = {
                        name: "",
                        current_designation: "",
                        founder_summary: "",
                        linkedin_url: null,
                        total_experience_years: 0,
                        education: [],
                        work_history: [],
                        skills_and_expertise: {
                          primary_skill_category: "",
                          secondary_skills: [],
                        },
                        seniority_and_background: {
                          is_repeat_founder: false,
                        },
                      };
                      const currentFounders =
                        founders.founders_informations || [];
                      updateData("founders.founders_informations", [
                        ...currentFounders,
                        newFounder,
                      ]);
                    }}
                    className="flex items-center text-gray-600 hover:text-black transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Founder
                  </button>
                </div>
              )}
            </div>

            {founders.team_dynamics && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <DetailItem label="Skill Coverage">
                  <ValueDisplay
                    value={
                      founders.team_dynamics.skills_complementarity
                        ?.skill_coverage
                    }
                    editable={editStates.founders}
                    onUpdate={(newValue) =>
                      updateData(
                        "founders.team_dynamics.skills_complementarity.skill_coverage",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Shared Employers">
                  <ValueDisplay
                    value={
                      founders.team_dynamics.cohesiveness_analysis
                        ?.shared_employers
                    }
                    editable={editStates.founders}
                    onUpdate={(newValue) =>
                      updateData(
                        "founders.team_dynamics.cohesiveness_analysis.shared_employers",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            )}
          </Section>
        )}

        {/* Market Section */}
        {market && (
          <Section
            title="Market Analysis"
            icon={Target}
            isEditing={editStates.market}
            onToggleEdit={() => toggleEditState("market")}
            onSave={onSave ? () => handleSectionSave("market") : undefined}
            hasChanges={sectionChanges.market}
            isSaving={sectionSaving.market}
          >
            <DetailItem label="Problem Statement">
              <ValueDisplay
                value={market.problem_and_validation?.problem_statement}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData(
                    "market.problem_and_validation.problem_statement",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Target Geography">
              <ValueDisplay
                value={market.geographic_and_scalability?.target_geography}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData(
                    "market.geographic_and_scalability.target_geography",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Competitors">
              <ValueDisplay
                value={market.competitive_landscape?.competitors_mentioned}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData(
                    "market.competitive_landscape.competitors_mentioned",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Differentiation">
              <ValueDisplay
                value={
                  market.competitive_landscape?.differentiation_claims?.[0]
                }
                editable={editStates.market}
                onUpdate={(newValue) => {
                  const currentClaims =
                    market.competitive_landscape?.differentiation_claims || [];
                  const newClaims = [...currentClaims];
                  newClaims[0] = newValue;
                  updateData(
                    "market.competitive_landscape.differentiation_claims",
                    newClaims
                  );
                }}
              />
            </DetailItem>
            <DetailItem label="TAM">
              <ValueDisplay
                value={market.market_size_analysis?.tam}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData("market.market_size_analysis.tam", newValue)
                }
              />
            </DetailItem>
            <DetailItem label="SAM">
              <ValueDisplay
                value={market.market_size_analysis?.sam}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData("market.market_size_analysis.sam", newValue)
                }
              />
            </DetailItem>
            <DetailItem label="SOM">
              <ValueDisplay
                value={market.market_size_analysis?.som}
                editable={editStates.market}
                onUpdate={(newValue) =>
                  updateData("market.market_size_analysis.som", newValue)
                }
              />
            </DetailItem>
          </Section>
        )}

        {/* Product Section */}
        {product && (
          <Section
            title="Product & Technology"
            icon={Lightbulb}
            isEditing={editStates.product}
            onToggleEdit={() => toggleEditState("product")}
            onSave={onSave ? () => handleSectionSave("product") : undefined}
            hasChanges={sectionChanges.product}
            isSaving={sectionSaving.product}
          >
            <DetailItem label="Product Description">
              <ValueDisplay
                value={product.product_overview?.product_description}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.product_overview.product_description",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Unique Value Proposition">
              <ValueDisplay
                value={product.product_overview?.unique_value_proposition}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.product_overview.unique_value_proposition",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Target Segments">
              <ValueDisplay
                value={product.product_overview?.target_user_segments}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.product_overview.target_user_segments",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Tech Stack">
              <ValueDisplay
                value={product.technology_and_innovation?.technology_stack}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.technology_and_innovation.technology_stack",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Innovation Level">
              <ValueDisplay
                value={product.technology_and_innovation?.innovation_level}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.technology_and_innovation.innovation_level",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Product Market Fit">
              <ValueDisplay
                value={product.market_fit_indicators?.product_market_fit_claims}
                editable={editStates.product}
                onUpdate={(newValue) =>
                  updateData(
                    "product.market_fit_indicators.product_market_fit_claims",
                    newValue
                  )
                }
              />
            </DetailItem>
          </Section>
        )}

        {/* Traction Section */}
        {traction && (
          <Section
            title="Traction & GTM"
            icon={TrendingUp}
            isEditing={editStates.traction}
            onToggleEdit={() => toggleEditState("traction")}
            onSave={onSave ? () => handleSectionSave("traction") : undefined}
            hasChanges={sectionChanges.traction}
            isSaving={sectionSaving.traction}
          >
            <DetailItem label="Key Metrics">
              <ValueDisplay
                value={traction.traction_metrics?.other_kpis}
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData("traction.traction_metrics.other_kpis", newValue)
                }
              />
            </DetailItem>
            <DetailItem label="Growth Rate">
              <ValueDisplay
                value={
                  traction.traction_metrics?.financial_metrics
                    ?.revenue_growth_rate
                }
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.traction_metrics.financial_metrics.revenue_growth_rate",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="User Base">
              <ValueDisplay
                value={traction.traction_metrics?.user_metrics?.users}
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.traction_metrics.user_metrics.users",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="User Growth Rate">
              <ValueDisplay
                value={
                  traction.traction_metrics?.user_metrics?.user_growth_rate
                }
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.traction_metrics.user_metrics.user_growth_rate",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Revenue Streams">
              <ValueDisplay
                value={traction.revenue_model_assessment?.revenue_streams}
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.revenue_model_assessment.revenue_streams",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Pricing Strategy">
              <ValueDisplay
                value={traction.revenue_model_assessment?.pricing_strategy}
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.revenue_model_assessment.pricing_strategy",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="GTM Strategy">
              <ValueDisplay
                value={traction.business_model_analysis?.go_to_market_strategy}
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.business_model_analysis.go_to_market_strategy",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Current Customers">
              <ValueDisplay
                value={
                  traction.customer_and_market_validation?.customer_portfolio
                    ?.current_customers
                }
                editable={editStates.traction}
                onUpdate={(newValue) =>
                  updateData(
                    "traction.customer_and_market_validation.customer_portfolio.current_customers",
                    newValue
                  )
                }
              />
            </DetailItem>
          </Section>
        )}

        {/* Investors Section */}
        {investors && (
          <Section
            title="Investors & Funding"
            icon={DollarSign}
            isEditing={editStates.investors}
            onToggleEdit={() => toggleEditState("investors")}
            onSave={onSave ? () => handleSectionSave("investors") : undefined}
            hasChanges={sectionChanges.investors}
            isSaving={sectionSaving.investors}
          >
            {/* Funding Round Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Funding Round Details
              </h3>
              <div className="space-y-3">
                <DetailItem label="Funding Stage">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.round_details?.round_stage
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.round_details.round_stage",
                        newValue
                      )
                    }
                    path="round_stage"
                  />
                </DetailItem>
                <DetailItem label="Round Size">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.round_details?.round_size
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.round_details.round_size",
                        newValue
                      )
                    }
                    path="round_size"
                  />
                </DetailItem>
                <DetailItem label="Round Status">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.round_details
                        ?.round_completion_status
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.round_details.round_completion_status",
                        newValue
                      )
                    }
                    path="completion_status"
                  />
                </DetailItem>
                <DetailItem label="Lead Investor">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.round_details?.lead_investor
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.round_details.lead_investor",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Investment Validation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Investment Validation
              </h3>
              <div className="space-y-3">
                <DetailItem label="Investor Credibility">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.investment_validation
                        ?.investor_credibility
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.investment_validation.investor_credibility",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Funding Adequacy">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.investment_validation
                        ?.funding_adequacy
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.investment_validation.funding_adequacy",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Round Competitiveness">
                  <ValueDisplay
                    value={
                      investors.funding_round_context?.investment_validation
                        ?.round_competitiveness
                    }
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.funding_round_context.investment_validation.round_competitiveness",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Co-Investor Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Co-Investor Analysis
              </h3>
              <div className="space-y-3">
                <DetailItem label="Total Co-Investors">
                  <ValueDisplay
                    value={investors.coinvestor_analysis?.coinvestor_metrics?.total_coinvestors}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.coinvestor_analysis.coinvestor_metrics.total_coinvestors",
                        parseInt(newValue) || newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Average Investor Quality">
                  <ValueDisplay
                    value={investors.coinvestor_analysis?.coinvestor_metrics?.average_investor_quality}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.coinvestor_analysis.coinvestor_metrics.average_investor_quality",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Institutional vs Angel Ratio">
                  <ValueDisplay
                    value={investors.coinvestor_analysis?.coinvestor_metrics?.institutional_vs_angel_ratio}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.coinvestor_analysis.coinvestor_metrics.institutional_vs_angel_ratio",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Co-Investor Portfolio">
                  <ValueDisplay
                    value={investors.coinvestor_analysis?.coinvestor_portfolio}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.coinvestor_analysis.coinvestor_portfolio",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Advisory Board Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <UserCheck className="w-4 h-4 mr-2" />
                Advisory Board Analysis
              </h3>
              <div className="space-y-3">
                <DetailItem label="Total Advisors">
                  <ValueDisplay
                    value={investors.advisory_board_analysis?.advisor_portfolio_strength?.total_advisors}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.advisory_board_analysis.advisor_portfolio_strength.total_advisors",
                        parseInt(newValue) || newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Advisor Relevance Score">
                  <ValueDisplay
                    value={investors.advisory_board_analysis?.advisor_portfolio_strength?.advisor_relevance_score}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.advisory_board_analysis.advisor_portfolio_strength.advisor_relevance_score",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Domain Coverage">
                  <ValueDisplay
                    value={investors.advisory_board_analysis?.advisor_portfolio_strength?.domain_coverage}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.advisory_board_analysis.advisor_portfolio_strength.domain_coverage",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Advisors">
                  <ValueDisplay
                    value={investors.advisory_board_analysis?.advisors}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.advisory_board_analysis.advisors",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Evaluation Readiness */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Evaluation Readiness
              </h3>
              <div className="space-y-3">
                <DetailItem label="Funding Round Details Clear">
                  <ValueDisplay
                    value={investors.evaluation_readiness?.funding_round_details_clear}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.evaluation_readiness.funding_round_details_clear",
                        newValue === 'true' || newValue === true
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Co-Investor Count Identifiable">
                  <ValueDisplay
                    value={investors.evaluation_readiness?.coinvestor_count_identifiable}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.evaluation_readiness.coinvestor_count_identifiable",
                        newValue === 'true' || newValue === true
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Advisor Backgrounds Available">
                  <ValueDisplay
                    value={investors.evaluation_readiness?.advisor_backgrounds_available}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.evaluation_readiness.advisor_backgrounds_available",
                        newValue === 'true' || newValue === true
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Track Record Data Present">
                  <ValueDisplay
                    value={investors.evaluation_readiness?.track_record_data_present}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.evaluation_readiness.track_record_data_present",
                        newValue === 'true' || newValue === true
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Exit Potential Indicators */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Exit Potential Indicators
              </h3>
              <div className="space-y-3">
                <DetailItem label="Exit Pathway Clarity">
                  <ValueDisplay
                    value={investors.exit_potential_indicators?.exit_pathway_clarity}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.exit_potential_indicators.exit_pathway_clarity",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Follow-on Potential">
                  <ValueDisplay
                    value={investors.exit_potential_indicators?.follow_on_potential}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.exit_potential_indicators.follow_on_potential",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Strategic Investor Presence">
                  <ValueDisplay
                    value={investors.exit_potential_indicators?.strategic_investor_presence}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.exit_potential_indicators.strategic_investor_presence",
                        newValue === 'true' || newValue === true
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Investor Exit History">
                  <ValueDisplay
                    value={investors.exit_potential_indicators?.investor_exit_history}
                    editable={editStates.investors}
                    onUpdate={(newValue) =>
                      updateData(
                        "investors.exit_potential_indicators.investor_exit_history",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            </div>

            {/* Extraction Confidence */}
            <div className="pt-4 border-t border-gray-200">
              <DetailItem label="Extraction Confidence">
                <ValueDisplay
                  value={investors.extraction_confidence}
                  editable={editStates.investors}
                  onUpdate={(newValue) =>
                    updateData(
                      "investors.extraction_confidence",
                      parseFloat(newValue) || newValue
                    )
                  }
                  path="confidence"
                />
              </DetailItem>
            </div>
          </Section>
        )}

        {/* Vision Section */}
        {vision && (
          <Section
            title="Vision & Strategy"
            icon={BarChart3}
            isEditing={editStates.vision}
            onToggleEdit={() => toggleEditState("vision")}
            onSave={onSave ? () => handleSectionSave("vision") : undefined}
            hasChanges={sectionChanges.vision}
            isSaving={sectionSaving.vision}
          >
            <DetailItem label="Mission">
              <ValueDisplay
                value={vision.vision_and_mission?.mission_statement}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.vision_and_mission.mission_statement",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Vision">
              <ValueDisplay
                value={vision.vision_and_mission?.vision_statement}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.vision_and_mission.vision_statement",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Competitive Moats">
              <ValueDisplay
                value={vision.market_differentiation?.competitive_moats}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.market_differentiation.competitive_moats",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Positioning Strategy">
              <ValueDisplay
                value={vision.market_differentiation?.positioning_strategy}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.market_differentiation.positioning_strategy",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Future Roadmap">
              <ValueDisplay
                value={vision.strategic_roadmap?.future_roadmap}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.strategic_roadmap.future_roadmap",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Expansion Strategy">
              <ValueDisplay
                value={vision.strategic_roadmap?.expansion_strategy}
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.strategic_roadmap.expansion_strategy",
                    newValue
                  )
                }
              />
            </DetailItem>
            <DetailItem label="Challenges Overcome">
              <ValueDisplay
                value={
                  vision.founder_resilience_analysis?.resilience_indicators
                    ?.challenges_overcome
                }
                editable={editStates.vision}
                onUpdate={(newValue) =>
                  updateData(
                    "vision.founder_resilience_analysis.resilience_indicators.challenges_overcome",
                    newValue
                  )
                }
              />
            </DetailItem>
          </Section>
        )}

        {/* Contact and Metadata */}
        {(contact_info || extraction_metadata) && (
          <Section
            title="Metadata & Contact"
            icon={Info}
            isEditing={editStates.metadata}
            onToggleEdit={() => toggleEditState("metadata")}
            onSave={onSave ? () => handleSectionSave("metadata") : undefined}
            hasChanges={sectionChanges.metadata}
            isSaving={sectionSaving.metadata}
          >
            {contact_info && (
              <>
                <DetailItem label="Emails">
                  <ValueDisplay
                    value={contact_info.emails}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData("contact_info.emails", newValue)
                    }
                  />
                </DetailItem>
                <DetailItem label="Phone Numbers">
                  <ValueDisplay
                    value={contact_info.phone_numbers}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData("contact_info.phone_numbers", newValue)
                    }
                  />
                </DetailItem>
              </>
            )}
            {extraction_metadata && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <DetailItem label="Data Completeness">
                  <ValueDisplay
                    value={extraction_metadata.data_completeness}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData(
                        "extraction_metadata.data_completeness",
                        parseFloat(newValue) || newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Extraction Confidence">
                  <ValueDisplay
                    value={extraction_metadata.extraction_confidence}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData(
                        "extraction_metadata.extraction_confidence",
                        parseFloat(newValue) || newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Extraction Timestamp">
                  <ValueDisplay
                    value={extraction_metadata.extraction_timestamp}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData(
                        "extraction_metadata.extraction_timestamp",
                        newValue
                      )
                    }
                  />
                </DetailItem>
                <DetailItem label="Missing Critical Data">
                  <ValueDisplay
                    value={extraction_metadata.missing_critical_data}
                    editable={editStates.metadata}
                    onUpdate={(newValue) =>
                      updateData(
                        "extraction_metadata.missing_critical_data",
                        newValue
                      )
                    }
                  />
                </DetailItem>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
