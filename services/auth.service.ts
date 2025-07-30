import { BaseService, ApiResponse } from "./base.service";

export interface User {
  id: string;
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface SessionResponse {
  success: boolean;
  session: {
    jwt_token: string;
    user: User;
  } | null;
}

export interface ValidationResponse {
  valid: boolean;
  error?: string;
  user_data?: {
    user_id: string;
    username: string;
  };
}

/**
 * Authentication service for handling user login, logout, and session management
 */
export class AuthService extends BaseService {
  private static readonly LOCAL_STORAGE_KEYS = {
    USER: "fundiq_user",
    AUTH_STATE: "fundiq_auth_state",
  } as const;

  /**
   * Login user with username and password
   */
  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    console.log("🔍 Making login request");

    const result = await this.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );

    if (result.success && result.data?.success && result.data.user) {
      this.setStoredUser(result.data.user);
      console.log("💾 User data stored in localStorage");
    }

    return result;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse<AuthResponse>> {
    console.log("🔍 Making logout request");

    const result = await this.post<AuthResponse>("/api/auth/logout");

    // Clear localStorage on logout (regardless of server response)
    this.clearStoredAuth();
    console.log("🗑️ Cleared user data from localStorage");

    return result;
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<ApiResponse<SessionResponse>> {
    // First check localStorage for user data
    const storedUser = this.getStoredUser();
    if (storedUser) {
      console.log("✅ Found user in localStorage:", storedUser);
      return {
        success: true,
        data: {
          success: true,
          session: {
            jwt_token: "stored", // We don't store the actual token for security
            user: storedUser,
          },
        },
      };
    }

    // If no stored user, try to get session from server
    console.log("🔍 No stored user, making request to sessions API");

    const result = await this.get<SessionResponse>("/api/auth/sessions");

    // If we got valid session data from server, store it
    if (result.success && result.data?.success && result.data.session?.user) {
      this.setStoredUser(result.data.session.user);
      console.log("💾 Stored user data from server response");
    }

    return result;
  }

  /**
   * Validate current JWT token
   */
  static async validateToken(): Promise<ApiResponse<ValidationResponse>> {
    return this.post<ValidationResponse>("/api/auth/validate");
  }

  /**
   * Check if user is authenticated (makes API call)
   */
  static async isAuthenticated(): Promise<boolean> {
    const sessionResult = await this.getSession();
    return !!(
      sessionResult.success &&
      sessionResult.data?.success &&
      sessionResult.data.session !== null
    );
  }

  /**
   * Get stored user data from localStorage
   */
  static getStoredUser(): User | null {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem(this.LOCAL_STORAGE_KEYS.USER);
      const authState = localStorage.getItem(
        this.LOCAL_STORAGE_KEYS.AUTH_STATE
      );

      if (userJson && authState === "authenticated") {
        try {
          return JSON.parse(userJson);
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          this.clearStoredAuth();
        }
      }
    }
    return null;
  }

  /**
   * Check if user is authenticated (from localStorage only)
   */
  static isStoredAuthenticated(): boolean {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem(this.LOCAL_STORAGE_KEYS.AUTH_STATE) ===
        "authenticated"
      );
    }
    return false;
  }

  /**
   * Set user data in localStorage
   */
  static setStoredUser(user: User | null): void {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(
          this.LOCAL_STORAGE_KEYS.USER,
          JSON.stringify(user)
        );
        localStorage.setItem(
          this.LOCAL_STORAGE_KEYS.AUTH_STATE,
          "authenticated"
        );
      } else {
        localStorage.removeItem(this.LOCAL_STORAGE_KEYS.USER);
        localStorage.removeItem(this.LOCAL_STORAGE_KEYS.AUTH_STATE);
      }
    }
  }

  /**
   * Clear stored authentication data
   */
  static clearStoredAuth(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem(this.LOCAL_STORAGE_KEYS.AUTH_STATE);
    }
  }
}
