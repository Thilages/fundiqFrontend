// Authentication utility functions for the frontend

const LOCAL_STORAGE_KEYS = {
  USER: 'fundiq_user',
  AUTH_STATE: 'fundiq_auth_state',
} as const;

export interface User {
  id: string;
  username: string;
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

// Helper functions for localStorage
const storage = {
  setUser: (user: User | null) => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_STATE, 'authenticated');
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_STATE);
      }
    }
  },
  
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userJson = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const authState = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_STATE);
      
      if (userJson && authState === 'authenticated') {
        try {
          return JSON.parse(userJson);
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          storage.clear();
        }
      }
    }
    return null;
  },
  
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_STATE);
    }
  },
  
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_STATE) === 'authenticated';
    }
    return false;
  }
};

export class AuthService {
  private static baseUrl = '/api/auth';

  /**
   * Login user with username and password
   */
  static async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Making login request to:', `${this.baseUrl}/login`);
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok and has JSON content type
      if (!response.ok) {
        console.error(`Login API responded with status: ${response.status}`);
        const responseText = await response.text();
        console.error('❌ Login non-OK response body:', responseText.substring(0, 1000));
        return {
          success: false,
          message: 'Login failed'
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Login API did not return JSON response');
        console.error('🔍 Login Content-Type received:', contentType);
        const responseText = await response.text();
        console.error('❌ Login non-JSON response body:', responseText.substring(0, 1000));
        return {
          success: false,
          message: 'Server error occurred'
        };
      }

      const data = await response.json();
      console.log('✅ Login parsed JSON data:', data);
      
      // Store user data in localStorage on successful login
      if (data.success && data.user) {
        storage.setUser(data.user);
        console.log('💾 User data stored in localStorage');
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<AuthResponse> {
    try {
      console.log('🔍 Making logout request to:', `${this.baseUrl}/logout`);
      const response = await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Logout response status:', response.status);
      console.log('📡 Logout response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok and has JSON content type
      if (!response.ok) {
        console.error(`Logout API responded with status: ${response.status}`);
        const responseText = await response.text();
        console.error('❌ Logout non-OK response body:', responseText.substring(0, 1000));
        return {
          success: false,
          message: 'Logout failed'
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Logout API did not return JSON response');
        console.error('🔍 Logout Content-Type received:', contentType);
        const responseText = await response.text();
        console.error('❌ Logout non-JSON response body:', responseText.substring(0, 1000));
        return {
          success: false,
          message: 'Server error occurred'
        };
      }

      const data = await response.json();
      console.log('✅ Logout parsed JSON data:', data);
      
      // Clear localStorage on logout (regardless of server response)
      storage.clear();
      console.log('🗑️ Cleared user data from localStorage');
      
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Network error occurred'
      };
    }
  }

  /**
   * Get current session
   */
  static async getSession(): Promise<SessionResponse> {
    // First check localStorage for user data
    const storedUser = storage.getUser();
    if (storedUser) {
      console.log('✅ Found user in localStorage:', storedUser);
      return {
        success: true,
        session: {
          jwt_token: 'stored', // We don't store the actual token for security
          user: storedUser
        }
      };
    }

    // If no stored user, try to get session from server
    try {
      console.log('🔍 No stored user, making request to:', `${this.baseUrl}/sessions`);
      
      const response = await fetch(`${this.baseUrl}/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in the request
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok and has JSON content type
      if (!response.ok) {
        console.error(`Sessions API responded with status: ${response.status}`);
        const responseText = await response.text();
        console.error('❌ Non-OK response body:', responseText.substring(0, 1000));
        return {
          success: true,
          session: null
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Sessions API did not return JSON response');
        console.error('🔍 Content-Type received:', contentType);
        const responseText = await response.text();
        console.error('❌ Non-JSON response body:', responseText.substring(0, 1000));
        return {
          success: true,
          session: null
        };
      }

      const data = await response.json();
      console.log('✅ Parsed JSON data:', data);
      
      // If we got valid session data from server, store it
      if (data.success && data.session && data.session.user) {
        storage.setUser(data.session.user);
        console.log('💾 Stored user data from server response');
      }
      
      return data;
    } catch (error) {
      console.error('Get session error:', error);
      return {
        success: true,
        session: null
      };
    }
  }

  /**
   * Validate current JWT token
   */
  static async validateToken(): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is ok and has JSON content type
      if (!response.ok) {
        console.error(`Validate API responded with status: ${response.status}`);
        return {
          valid: false,
          error: 'Token validation failed'
        };
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Validate API did not return JSON response');
        return {
          valid: false,
          error: 'Server error occurred'
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        valid: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session.success && session.session !== null;
  }

  /**
   * Get stored user data from localStorage
   */
  static getStoredUser(): User | null {
    return storage.getUser();
  }

  /**
   * Check if user is authenticated (from localStorage)
   */
  static isStoredAuthenticated(): boolean {
    return storage.isAuthenticated();
  }

  /**
   * Clear stored authentication data
   */
  static clearStoredAuth(): void {
    storage.clear();
  }
}
