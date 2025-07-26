// pitchdeck/app/applications/[id]/components/ImprovedRawDataSection.tsx

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Edit,
  Save,
  X,
  LucideIcon,
  Building2,
  Info,
} from "lucide-react";

// 1. --- TYPE DEFINITIONS (Unchanged) ---

interface WorkHistory {
  company: string;
  period: string | null;
  role: string | null;
}
interface CoFounderOverlap {
  shared_employers: string[];
  shared_universities: string[];
}
interface Founder {
  name: string;
  age_estimate: string;
  current_designation: string;
  linkedin_url: string | null;
  education: string[];
  roles: string[];
  is_repeat_founder: boolean | null;
  total_experience_years: number | null;
  work_history: WorkHistory[];
  co_founder_overlap: CoFounderOverlap;
}
interface Investor {
  name: string;
  exit_history?: string;
  background?: string;
}
interface CompanyProfile {
  company_name: string;
  company_website: string;
  contact_info: {
    emails: string[];
    phone_numbers: string[];
  };
  founders: Founder[];
  investors: {
    advisors: Investor[];
    co_investors: Investor[];
  };
  market: {
    tam: string;
    sam: string | null;
    som: string | null;
    problem_statement: string;
    target_geography: string;
    competitive_landscape: string;
    regulatory_domain: string[];
  };
  product: {
    description: string;
    innovation_or_ip: string;
    tech_stack: string | null;
    product_market_fit: string | null;
  };
  traction: {
    revenue: string;
    gmv: string | null;
    users: string;
    growth_rate: string;
    retention_metrics: string | null;
    current_customers: string[];
    business_model: string;
    revenue_model: string;
  };
  vision: {
    vision: string;
    mission: string | null;
    differentiation: string;
    resilience_signal: string;
  };
  issues?: Record<string, string[]>;
}

// 2. --- UTILITY FUNCTIONS (Unchanged) ---

const formatKey = (key: string): string => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const getIconForDimension = (dimension: string): LucideIcon => {
  const icons: Record<string, LucideIcon> = {
    founders: Users,
    market: Target,
    product: Lightbulb,
    traction: TrendingUp,
    vision: BarChart3,
    investors: DollarSign,
    contact_info: Info,
  };
  return icons[dimension] || Lightbulb;
};

// 3. --- REFINED DISPLAY COMPONENT ---
// CONSISTENCY & ROBUSTNESS: Aligns grid, font sizes, styles, and adds error handling for all nested data.

const DisplayField: React.FC<{ fieldValue: any }> = ({ fieldValue }) => {
  try {
    if (
      fieldValue === null ||
      fieldValue === undefined ||
      (typeof fieldValue === "string" && String(fieldValue).trim() === "")
    ) {
      return (
        <span className="text-md text-muted-foreground italic">
          Not provided
        </span>
      );
    }

    if (Array.isArray(fieldValue)) {
      if (fieldValue.length === 0)
        return (
          <span className="text-md text-muted-foreground italic">None</span>
        );

      // Handles arrays of objects (like work_history)
      if (typeof fieldValue[0] === "object" && fieldValue[0] !== null) {
        return (
          <div className="space-y-3">
            {fieldValue.map((item, index) => {
              if (!item || typeof item !== "object") return null;
              const { name, current_designation, background, role, ...rest } =
                item;
              const title = name || `Item ${index + 1}`;
              const description =
                current_designation || background || role || "";

              return (
                <Card
                  key={index}
                  className="bg-muted/50 shadow-sm overflow-hidden"
                >
                  {(title || description) && (
                    <CardHeader className="bg-muted/70 p-3">
                      {title && (
                        <CardTitle className="text-md font-semibold">
                          {title}
                        </CardTitle>
                      )}
                      {description && (
                        <CardDescription className="text-sm pt-1">
                          {description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  )}
                  <CardContent className="p-3 text-md">
                    <div className="space-y-2">
                      {Object.entries(rest).map(([key, val]) => (
                        <div
                          key={key}
                          className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start"
                        >
                          <span className="font-semibold text-muted-foreground">
                            {formatKey(key)}:
                          </span>
                          <DisplayField fieldValue={val} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      }
      // Handles arrays of strings
      return <span className="text-md">{fieldValue.join(", ")}</span>;
    }

    if (typeof fieldValue === "boolean") {
      return (
        <Badge variant={fieldValue ? "default" : "secondary"}>
          {fieldValue ? "Yes" : "No"}
        </Badge>
      );
    }

    // Handles nested objects
    if (typeof fieldValue === "object" && fieldValue !== null) {
      return (
        <div className="space-y-2 pl-4 border-l ml-1 text-md">
          {Object.entries(fieldValue).map(([key, val]) => (
            <div
              key={key}
              className="grid grid-cols-1 md:grid-cols-[160px_1fr] items-start"
            >
              <span className="font-semibold text-muted-foreground">
                {formatKey(key)}:
              </span>
              <DisplayField fieldValue={val} />
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-md">{String(fieldValue)}</span>;
  } catch (err) {
    return (
      <span className="text-md text-red-500 italic">Error rendering field</span>
    );
  }
};

// 4. --- REFINED EDITABLE COMPONENT ---
// CONSISTENCY: Standardized text sizes and input styles.

const EditableField: React.FC<{
  value: any;
  path: (string | number)[];
  onChange: (path: (string | number)[], value: any) => void;
}> = ({ value, path, onChange }) => {
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      return (
        <Textarea
          value={value.join("\n")}
          onChange={(e) =>
            onChange(path, e.target.value.split("\n").filter(Boolean))
          }
          className="text-md w-full"
          rows={Math.max(3, value.length)}
        />
      );
    }
    return (
      <div className="space-y-4 pl-4 border-l">
        {value.map((item, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-muted/50 space-y-3"
          >
            <h4 className="font-semibold text-md text-foreground">
              {item.name || `Item ${index + 1}`}
            </h4>
            {Object.entries(item).map(([itemKey, itemValue]) => (
              <div key={itemKey}>
                <label className="text-sm font-medium text-muted-foreground">
                  {formatKey(itemKey)}
                </label>
                <EditableField
                  value={itemValue}
                  path={[...path, index, itemKey]}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (
    typeof value === "boolean" ||
    (value === null && path.includes("is_repeat_founder"))
  ) {
    return (
      <select
        value={String(value)}
        onChange={(e) =>
          onChange(
            path,
            e.target.value === "true"
              ? true
              : e.target.value === "false"
              ? false
              : null
          )
        }
        className="text-md w-full p-2 border rounded-md bg-background focus:ring-2 focus:ring-primary"
      >
        <option value="null">Select...</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (typeof value === "number") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(path, e.target.valueAsNumber || null)}
        className="text-md w-full"
      />
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-3 pl-4 border-l">
        {Object.entries(value).map(([key, val]) => (
          <div key={key}>
            <label className="text-sm font-medium text-muted-foreground">
              {formatKey(key)}
            </label>
            <EditableField
              value={val}
              path={[...path, key]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Input
      value={value === null ? "" : String(value)}
      onChange={(e) => onChange(path, e.target.value)}
      className="text-md w-full"
      placeholder="Not provided"
    />
  );
};

// 5. --- DEDICATED COMPANY HEADER CARD ---
// CONSISTENCY: Standardized title and icon size.

interface CompanyHeaderCardProps {
  name: string;
  website: string;
  onSave: (data: { company_name: string; company_website: string }) => void;
}

const CompanyHeaderCard: React.FC<CompanyHeaderCardProps> = ({
  name,
  website,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    company_name: name,
    company_website: website,
  });

  const handleSave = () => {
    onSave(editableData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableData({ company_name: name, company_website: website });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Building2 className="h-5 w-5 text-primary" /> Edit Company Info
            </CardTitle>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-md font-medium">Company Name</label>
            <Input
              value={editableData.company_name}
              onChange={(e) =>
                setEditableData((d) => ({ ...d, company_name: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-md font-medium">Company Website</label>
            <Input
              value={editableData.company_website}
              onChange={(e) =>
                setEditableData((d) => ({
                  ...d,
                  company_website: e.target.value,
                }))
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="outline-none border-0 shadow-none">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Building2 className="h-6 w-6 text-primary" /> {name}
            </CardTitle>
            <CardDescription className="pt-2">
              <a
                href={`//${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {website}
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

// 6. --- DATA SECTION CARDS (Generic, Founders, Investors) ---
// IMPROVEMENT: All data sections are now self-contained cards with consistent headers and edit states.

const handleFieldChange = (
  path: (string | number)[],
  value: any,
  setEditableData: React.Dispatch<React.SetStateAction<any>>
) => {
  setEditableData((prev: any) => {
    const newData = JSON.parse(JSON.stringify(prev));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    return newData;
  });
};

const CardHeaderControls: React.FC<{
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  isEditing: boolean;
}> = ({ onSave, onCancel, onEdit, isEditing }) => {
  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button size="sm" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    );
  }
  return (
    <Button variant="ghost" size="sm" onClick={onEdit}>
      <Edit className="mr-2 h-4 w-4" /> Edit
    </Button>
  );
};

// 6.1 --- GENERIC DATA SECTION ---

const DataSectionCard: React.FC<{
  sectionKey: string;
  sectionData: any;
  onSave: (key: string, data: any) => void;
}> = ({ sectionKey, sectionData, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);
  const Icon = getIconForDimension(sectionKey);

  const handleEditClick = () => {
    setEditableData(JSON.parse(JSON.stringify(sectionData)));
    setIsEditing(true);
  };
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    onSave(sectionKey, editableData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Icon className="h-5 w-5 text-primary" />
            {formatKey(sectionKey)}
          </CardTitle>
          <CardHeaderControls
            isEditing={isEditing}
            onEdit={handleEditClick}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {Object.entries(editableData).map(([key, value]) => (
              <div key={key}>
                <label className="text-md font-medium text-muted-foreground block mb-2">
                  {formatKey(key)}
                </label>
                <EditableField
                  value={value}
                  path={[key]}
                  onChange={(path, val) =>
                    handleFieldChange(path, val, setEditableData)
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(sectionData).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4"
              >
                <span className="text-md font-medium text-muted-foreground">
                  {formatKey(key)}
                </span>
                <DisplayField fieldValue={value} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 6.2 --- CUSTOM FOUNDERS SECTION CARD ---

const FoundersSectionCard: React.FC<{
  founders: Founder[];
  onSave: (key: string, data: any) => void;
}> = ({ founders, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);

  const handleEditClick = () => {
    setEditableData(
      Array.isArray(founders) ? JSON.parse(JSON.stringify(founders)) : []
    );
    setIsEditing(true);
  };
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    onSave("founders", editableData || []);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Users className="h-5 w-5 text-primary" />
              Founders
            </CardTitle>
            <CardHeaderControls
              isEditing={isEditing}
              onEdit={handleEditClick}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </CardHeader>
        <CardContent>
          <EditableField
            value={editableData || []}
            path={[]}
            onChange={(path, val) =>
              handleFieldChange(path, val, setEditableData)
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(founders) || founders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Users className="h-5 w-5 text-primary" /> Founders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-md text-muted-foreground italic">
            No founders provided
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Users className="h-5 w-5 text-primary" />
            Founders
          </CardTitle>
          <CardHeaderControls
            isEditing={isEditing}
            onEdit={handleEditClick}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {founders.map((founder, idx) => {
            if (!founder || typeof founder !== "object") return null;
            return (
              <div key={idx} className="space-y-4 p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-3">
                      {founder?.name || `Founder ${idx + 1}`}
                    </h3>
                    <p className="pt-1 text-md text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
                      {founder?.current_designation && (
                        <span className="font-medium text-foreground">
                          {founder.current_designation}
                        </span>
                      )}
                      {founder?.linkedin_url && (
                        <a
                          href={
                            founder.linkedin_url.startsWith("http")
                              ? founder.linkedin_url
                              : `https://www.linkedin.com${founder.linkedin_url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          LinkedIn
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-1 text-sm text-muted-foreground">
                    {founder?.age_estimate && (
                      <span>
                        Age:{" "}
                        <span className="font-semibold text-foreground">
                          {founder.age_estimate}
                        </span>
                      </span>
                    )}
                    {founder?.is_repeat_founder !== null &&
                      founder?.is_repeat_founder !== undefined && (
                        <span>
                          Repeat Founder:{" "}
                          <span className="font-semibold text-foreground">
                            {founder.is_repeat_founder ? "Yes" : "No"}
                          </span>
                        </span>
                      )}
                    {founder?.total_experience_years !== null &&
                      founder?.total_experience_years !== undefined && (
                        <span>
                          Experience:{" "}
                          <span className="font-semibold text-foreground">
                            {founder.total_experience_years} yrs
                          </span>
                        </span>
                      )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4 gap-y-3 text-md">
                  {Array.isArray(founder?.roles) &&
                    founder.roles.length > 0 && (
                      <>
                        <span className="font-medium text-muted-foreground">
                          Roles
                        </span>
                        <span className="text-foreground">
                          {founder.roles.join(", ")}
                        </span>
                      </>
                    )}
                  {Array.isArray(founder?.education) &&
                    founder.education.length > 0 && (
                      <>
                        <span className="font-medium text-muted-foreground">
                          Education
                        </span>
                        <ul className="list-disc ml-4 text-foreground">
                          {founder.education.map((edu, i) => (
                            <li key={i}>{edu}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  {Array.isArray(founder?.work_history) &&
                    founder.work_history.length > 0 && (
                      <>
                        <span className="font-medium text-muted-foreground">
                          Work History
                        </span>
                        <ul className="list-disc ml-4 text-foreground">
                          {founder.work_history.map((job, i) => (
                            <li key={i} className="mb-1">
                              <span className="font-semibold">
                                {job?.company || "Unknown Company"}
                              </span>
                              {job?.role && (
                                <span className="ml-1">({job.role})</span>
                              )}
                              {job?.period && (
                                <span className="ml-1 text-muted-foreground text-sm">
                                  {job.period}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  {founder?.co_founder_overlap &&
                    ((Array.isArray(
                      founder.co_founder_overlap.shared_employers
                    ) &&
                      founder.co_founder_overlap.shared_employers.length > 0) ||
                      (Array.isArray(
                        founder.co_founder_overlap.shared_universities
                      ) &&
                        founder.co_founder_overlap.shared_universities.length >
                          0)) && (
                      <>
                        <span className="font-medium text-muted-foreground">
                          Co-Founder Overlap
                        </span>
                        <div className="space-y-1">
                          {Array.isArray(
                            founder.co_founder_overlap.shared_employers
                          ) &&
                            founder.co_founder_overlap.shared_employers.length >
                              0 && (
                              <div>
                                Shared Employers:{" "}
                                <span className="font-semibold">
                                  {founder.co_founder_overlap.shared_employers.join(
                                    ", "
                                  )}
                                </span>
                              </div>
                            )}
                          {Array.isArray(
                            founder.co_founder_overlap.shared_universities
                          ) &&
                            founder.co_founder_overlap.shared_universities
                              .length > 0 && (
                              <div>
                                Shared Universities:{" "}
                                <span className="font-semibold">
                                  {founder.co_founder_overlap.shared_universities.join(
                                    ", "
                                  )}
                                </span>
                              </div>
                            )}
                        </div>
                      </>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// 6.3 --- CUSTOM INVESTORS SECTION CARD ---

const InvestorsSectionCard: React.FC<{
  investors: { advisors: Investor[]; co_investors: Investor[] };
  onSave: (key: string, data: any) => void;
}> = ({ investors, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);

  const { advisors = [], co_investors = [] } = investors || {};

  const handleEditClick = () => {
    setEditableData(
      investors && typeof investors === "object"
        ? JSON.parse(JSON.stringify(investors))
        : { advisors: [], co_investors: [] }
    );
    setIsEditing(true);
  };
  const handleCancel = () => setIsEditing(false);
  const handleSave = () => {
    onSave("investors", editableData || { advisors: [], co_investors: [] });
    setIsEditing(false);
  };

  const hasInvestors =
    (Array.isArray(advisors) && advisors.length > 0) ||
    (Array.isArray(co_investors) && co_investors.length > 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <DollarSign className="h-5 w-5 text-primary" />
            Investors
          </CardTitle>
          <CardHeaderControls
            isEditing={isEditing}
            onEdit={handleEditClick}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditableField
            value={editableData || { advisors: [], co_investors: [] }}
            path={[]}
            onChange={(path, val) =>
              handleFieldChange(path, val, setEditableData)
            }
          />
        ) : !hasInvestors ? (
          <span className="text-md text-muted-foreground italic">
            No investors provided
          </span>
        ) : (
          <div className="space-y-4 text-md">
            {Array.isArray(advisors) && advisors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4">
                <span className="font-medium text-muted-foreground">
                  Advisors
                </span>
                <ul className="list-disc ml-4 text-foreground">
                  {advisors.map((inv, i) => (
                    <li key={i} className="mb-1">
                      <span className="font-semibold text-foreground">
                        {inv?.name || "Unknown"}
                      </span>
                      {inv?.background && (
                        <span className="ml-2 text-muted-foreground">
                          ({inv.background})
                        </span>
                      )}
                      {inv?.exit_history && (
                        <span className="ml-2 text-muted-foreground">
                          Exits: {inv.exit_history}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(co_investors) && co_investors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4">
                <span className="font-medium text-muted-foreground">
                  Co-Investors
                </span>
                <ul className="list-disc ml-4 text-foreground">
                  {co_investors.map((inv, i) => (
                    <li key={i} className="mb-1">
                      <span className="font-semibold text-foreground">
                        {inv?.name || "Unknown"}
                      </span>
                      {inv?.background && (
                        <span className="ml-2 text-muted-foreground">
                          ({inv.background})
                        </span>
                      )}
                      {inv?.exit_history && (
                        <span className="ml-2 text-muted-foreground">
                          Exits: {inv.exit_history}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 7. --- MAIN EXPORTED COMPONENT ---
// CONSISTENCY: Renders the appropriate, consistent card for each data section.

export function RawDataSection({
  initialData,
  onSave,
}: {
  initialData: CompanyProfile;
  onSave: (data: CompanyProfile) => void;
}) {
  const [fullData, setFullData] = useState<CompanyProfile>(
    initialData || ({} as CompanyProfile)
  );

  const handleFullDataUpdate = (partialUpdate: Partial<CompanyProfile>) => {
    try {
      const updatedFullData = { ...fullData, ...partialUpdate };
      setFullData(updatedFullData);
      onSave(updatedFullData);
    } catch (err) {
      // fallback: do not update state
      // Optionally, show a toast or error message here
    }
  };

  const handleSectionSave = (sectionKey: string, updatedData: any) => {
    handleFullDataUpdate({ [sectionKey]: updatedData });
  };

  if (!fullData || typeof fullData !== "object") {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No raw data available.
        </CardContent>
      </Card>
    );
  }

  // Defensive destructure
  const {
    company_name = "",
    company_website = "",
    issues = {},
    ...sections
  } = fullData || {};

  return (
    <div className="space-y-2">
      <CompanyHeaderCard
        name={company_name || "Unknown Company"}
        website={company_website || ""}
        onSave={handleFullDataUpdate}
      />
      {Object.entries(sections || {}).map(([key, data]) => {
        if (key === "founders") {
          return (
            <FoundersSectionCard
              key={key}
              founders={Array.isArray(data) ? data : []}
              onSave={handleSectionSave}
            />
          );
        }
        if (key === "investors") {
          const advisors = Array.isArray(data && (data as any).advisors)
            ? (data as any).advisors
            : [];
          const co_investors = Array.isArray(data && (data as any).co_investors)
            ? (data as any).co_investors
            : [];
          return (
            <InvestorsSectionCard
              key={key}
              investors={{ advisors, co_investors }}
              onSave={handleSectionSave}
            />
          );
        }
        return (
          <DataSectionCard
            key={key}
            sectionKey={key}
            sectionData={data || {}}
            onSave={handleSectionSave}
          />
        );
      })}
    </div>
  );
}
