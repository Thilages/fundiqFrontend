'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, type User, type AuthResponse } from '@/services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);

      // First check localStorage for immediate restoration
      const storedUser = AuthService.getStoredUser();
      if (storedUser) {
        console.log('🔄 Restoring user from localStorage:', storedUser);
        setUser(storedUser);
        setLoading(false);
        return;
      }

      // If no stored user, try to get session from server
      console.log('📡 No stored user, checking server session...');
      const sessionResult = await AuthService.getSession();

      if (sessionResult.success && sessionResult.data?.success && sessionResult.data.session) {
        setUser(sessionResult.data.session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await AuthService.login({ username, password });

      if (result.success && result.data?.success && result.data.user) {
        setUser(result.data.user);
        return result.data;
      }

      return result.data || { success: false, message: 'Login failed' };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: 'Login failed due to network error'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear user state even if logout request fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // The JWT token is automatically sent via HTTP-only cookies
    // No need to manually add Authorization header
    return headers;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
