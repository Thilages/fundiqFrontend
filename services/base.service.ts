/**
 * Base service class that provides common HTTP request functionality
 * All other services should extend this class
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class BaseService {
  protected static baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  /**
   * Make an HTTP request with error handling
   */
  protected static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = endpoint.startsWith("http")
        ? endpoint
        : `${this.baseUrl}${endpoint}`;

      const defaultOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      };

      const config = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options.headers || {}),
        },
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the text as error message
          errorMessage = errorText || errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } else {
        // If response is not JSON, return the text
        const text = await response.text();
        return {
          success: true,
          data: text as T,
        };
      }
    } catch (error) {
      console.error("Request failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Network error occurred",
      };
    }
  }

  /**
   * GET request
   */
  protected static async get<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  protected static async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected static async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected static async delete<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * PATCH request
   */
  protected static async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}
