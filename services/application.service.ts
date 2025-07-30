import { BaseService, ApiResponse } from "./base.service";

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

export interface ApplicationsListResponse {
  applications: ApplicationDetail[];
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Service for handling application-related API operations
 */
export class ApplicationService extends BaseService {
  /**
   * Fetch a single application by ID
   */
  static async getApplication(
    id: string
  ): Promise<ApiResponse<ApplicationDetail>> {
    console.log("🔍 Fetching application:", id);

    const result = await this.get<ApplicationDetail>(`/api/application/${id}`, {
      cache: "no-store",
    });

    if (result.success) {
      console.log("✅ Successfully fetched application:", result.data);
    } else {
      console.error("❌ Failed to fetch application:", result.error);
    }

    return result;
  }

  /**
   * Fetch all applications
   */
  static async getApplications(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<ApplicationsListResponse>> {
    console.log("🔍 Fetching applications list");

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);

    const endpoint = `/api/applications${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const result = await this.get<ApplicationsListResponse>(endpoint);

    if (result.success) {
      console.log("✅ Successfully fetched applications list");
    } else {
      console.error("❌ Failed to fetch applications:", result.error);
    }

    return result;
  }

  /**
   * Create a new application
   */
  static async createApplication(
    applicationData: Partial<ApplicationDetail>
  ): Promise<ApiResponse<ApplicationDetail>> {
    console.log("🔍 Creating new application");

    const result = await this.post<ApplicationDetail>(
      "/api/applications",
      applicationData
    );

    if (result.success) {
      console.log("✅ Successfully created application:", result.data);
    } else {
      console.error("❌ Failed to create application:", result.error);
    }

    return result;
  }

  /**
   * Update an existing application
   */
  static async updateApplication(
    id: string,
    applicationData: Partial<ApplicationDetail>
  ): Promise<ApiResponse<ApplicationDetail>> {
    console.log("🔍 Updating application:", id);

    const result = await this.put<ApplicationDetail>(
      `/api/application/${id}`,
      applicationData
    );

    if (result.success) {
      console.log("✅ Successfully updated application:", result.data);
    } else {
      console.error("❌ Failed to update application:", result.error);
    }

    return result;
  }

  /**
   * Delete an application
   */
  static async deleteApplication(id: string): Promise<ApiResponse<void>> {
    console.log("🔍 Deleting application:", id);

    const result = await this.delete<void>(`/api/application/${id}`);

    if (result.success) {
      console.log("✅ Successfully deleted application");
    } else {
      console.error("❌ Failed to delete application:", result.error);
    }

    return result;
  }

  /**
   * Generate or fetch deck for an application
   */
  static async getDeck(id: string): Promise<ApiResponse<any>> {
    console.log("🔍 Fetching deck for application:", id);

    const result = await this.get<any>(`/api/application/${id}/deck`);

    if (result.success) {
      console.log("✅ Successfully fetched deck");
    } else {
      console.error("❌ Failed to fetch deck:", result.error);
    }

    return result;
  }
}
