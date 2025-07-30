// pitchdeck/app/applications/[id]/lib/types.ts

// The main data structure for an application
export interface ApplicationDetail {
  id: string;
  startup_name: string;
  contact_email?: string;
  contact_name?: string;
  website_url?: string;
  status: "submitted" | "completed" | "incomplete";
  score?: number;
  confidence_score?: number;
  created_at: string;
  last_updated_at: string;
  country?: string;
  stage?: string;
  issues?: string[];
  raw?: any;
  enriched?: any;
  results?: {
    [key: string]: {
      confidence_score: number;
      score: number;
      bucket?: string;
      summary?: string;
      confidenceScore: number;
      issues: Array<
        string | { issue: string; impact?: string; relevance?: string }
      >;
      manualCheck: boolean;
      manual_check?: boolean;
      breakdown?: {
        [key: string]: {
          score: number;
          rationale: string;
        };
      };
    };
  };
}

// Type for processing actions
export type ProcessingAction = "extract" | "enhance" | "evaluate";

// Type for PDF view response
export interface PdfViewResponse {
  success: boolean;
  signed_url?: string;
  error?: string;
}
