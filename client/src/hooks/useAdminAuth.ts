import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    admin: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedAuth = localStorage.getItem('adminAuth');
      if (!storedAuth) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const parsedAuth = JSON.parse(storedAuth);
      if (!parsedAuth.token || !parsedAuth.admin) {
        localStorage.removeItem('adminAuth');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Verify token is still valid by making an API call
      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${parsedAuth.token}`
        }
      });

      if (response.ok) {
        const admin = await response.json();
        setAuthState({
          admin,
          token: parsedAuth.token,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('adminAuth');
        setAuthState({
          admin: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error checking admin auth status:', error);
      localStorage.removeItem('adminAuth');
      setAuthState({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await apiRequest('POST', '/api/admin/signin', {
        email,
        password,
        rememberMe
      });

      const authData = await response.json();
      
      // Store auth data
      localStorage.setItem('adminAuth', JSON.stringify({
        admin: authData.admin,
        token: authData.token,
        expiresIn: authData.expiresIn
      }));

      setAuthState({
        admin: authData.admin,
        token: authData.token,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true, data: authData };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Sign in failed' 
      };
    }
  };

  const signOut = async () => {
    try {
      if (authState.token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during admin logout:', error);
    } finally {
      localStorage.removeItem('adminAuth');
      setAuthState({
        admin: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const makeAuthenticatedRequest = async (method: string, url: string, data?: any) => {
    if (!authState.token) {
      throw new Error('No admin authentication token');
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.token}`
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (response.status === 401) {
      // Token expired, sign out
      await signOut();
      throw new Error('Admin session expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response;
  };

  return {
    ...authState,
    signIn,
    signOut,
    makeAuthenticatedRequest,
    refreshAuth: checkAuthStatus
  };
}