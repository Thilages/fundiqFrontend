import { API_BASE_URL } from './config';

/**
 * Utility for making authenticated API calls to the Flask backend
 */
export class ApiClient {
  private static baseUrl = API_BASE_URL;

  /**
   * Make an authenticated request to the backend
   */
  static async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get client IP for forwarding
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // This ensures cookies are sent with requests
    };

    try {
      const response = await fetch(url, config);
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  static async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  static async post(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  static async put(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  static async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}
