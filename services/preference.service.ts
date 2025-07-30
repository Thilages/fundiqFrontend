import { BaseService, ApiResponse } from "./base.service";
import { TEMP_FIRM_ID } from "../lib/config";

export interface Preference {
  id?: string;
  overall_custom_eval: string;
  founders_custom_eval: string;
  product_custom_eval: string;
  market_custom_eval: string;
  vision_custom_eval: string;
  traction_custom_eval: string;
  investors_custom_eval: string;
  use_custom_eval?: boolean;
}

export interface PreferenceResponse {
  preferences?: Preference;
  id?: string;
  // Allow both old and new structure formats
  [key: string]: any;
}

/**
 * Service for handling user preferences and custom evaluation criteria
 */
export class PreferenceService extends BaseService {
  /**
   * Get preferences for a firm
   */
  static async getPreferences(
    firmId: string = TEMP_FIRM_ID
  ): Promise<ApiResponse<PreferenceResponse>> {
    console.log("🔍 Fetching preferences for firm:", firmId);

    const result = await this.get<PreferenceResponse>(
      `/api/preferences/${firmId}`
    );

    if (result.success) {
      console.log("✅ Successfully fetched preferences:", result.data);
    } else {
      console.error("❌ Failed to fetch preferences:", result.error);
    }

    return result;
  }

  /**
   * Save or update preferences for a firm
   */
  static async savePreferences(
    preferences: Preference,
    firmId: string = TEMP_FIRM_ID
  ): Promise<ApiResponse<PreferenceResponse>> {
    console.log("🔍 Saving preferences for firm:", firmId);
    console.log("📋 Preferences data:", preferences);

    const result = await this.post<PreferenceResponse>(
      `/api/preferences/${firmId}`,
      preferences
    );

    if (result.success) {
      console.log("✅ Successfully saved preferences:", result.data);
    } else {
      console.error("❌ Failed to save preferences:", result.error);
    }

    return result;
  }

  /**
   * Check if custom evaluations are enabled for a firm
   */
  static async isCustomEvaluationEnabled(
    firmId: string = TEMP_FIRM_ID
  ): Promise<boolean> {
    try {
      const result = await this.getPreferences(firmId);

      if (result.success && result.data) {
        // Handle both old and new data structures
        const preferences = result.data.preferences || result.data;
        return preferences?.use_custom_eval ?? false;
      }

      return false;
    } catch (error) {
      console.error("Failed to check custom evaluation status:", error);
      return false;
    }
  }

  /**
   * Get the preference ID when custom evaluation is enabled
   */
  static async getPreferenceId(
    firmId: string = TEMP_FIRM_ID
  ): Promise<string | null> {
    try {
      const isEnabled = await this.isCustomEvaluationEnabled(firmId);
      return isEnabled ? firmId : null;
    } catch (error) {
      console.error("Failed to get preference ID:", error);
      return null;
    }
  }

  /**
   * Update localStorage based on preference state
   */
  static updateLocalStorage(preferences: Preference, enabled: boolean): void {
    if (typeof window !== "undefined") {
      if (enabled && preferences.id) {
        localStorage.setItem("selectedPreference", preferences.id);
        console.log("Stored preference ID in localStorage:", preferences.id);
      } else {
        localStorage.removeItem("selectedPreference");
        console.log("Removed preference ID from localStorage");
      }
    }
  }

  /**
   * Toggle custom evaluation setting
   */
  static async toggleCustomEvaluation(
    enabled: boolean,
    currentPreferences: Preference,
    firmId: string = TEMP_FIRM_ID
  ): Promise<ApiResponse<PreferenceResponse>> {
    const updatedPreferences = {
      ...currentPreferences,
      use_custom_eval: enabled,
    };

    const result = await this.savePreferences(updatedPreferences, firmId);

    if (result.success) {
      // Update localStorage based on the new state
      this.updateLocalStorage(updatedPreferences, enabled);

      // Update preference ID if returned from API
      if (result.data?.id && enabled) {
        const newPreferences = { ...updatedPreferences, id: result.data.id };
        this.updateLocalStorage(newPreferences, enabled);
      }
    }

    return result;
  }
}
