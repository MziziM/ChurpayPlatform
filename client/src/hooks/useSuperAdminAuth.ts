import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SuperAdmin } from '@shared/schema';

interface SuperAdminAuthResponse {
  superAdmin: SuperAdmin;
  message: string;
}

interface SuperAdminSignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  ownerCode: string;
  acceptTerms: boolean;
}

interface SuperAdminSigninData {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

interface SuperAdminVerify2FAData {
  email: string;
  verificationCode: string;
}

export function useSuperAdminProfile() {
  return useQuery({
    queryKey: ['/api/super-admin/profile'],
    retry: false,
    staleTime: 0,
    gcTime: 0
  });
}

export function useSuperAdminAuth() {
  const { data: superAdmin, isLoading, error } = useSuperAdminProfile();
  const queryClient = useQueryClient();

  const signIn = useMutation({
    mutationFn: async (data: SuperAdminSigninData) => {
      const response = await apiRequest('POST', '/api/super-admin/signin', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/profile'] });
    }
  });

  return {
    superAdmin: superAdmin as SuperAdmin | undefined,
    isLoading,
    isAuthenticated: !!superAdmin && !error,
    error,
    signIn
  };
}

export function useSuperAdminSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SuperAdminSignupData) => {
      const response = await apiRequest('POST', '/api/super-admin/signup', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the profile query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/profile'] });
    }
  });
}

export function useSuperAdminVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SuperAdminVerify2FAData) => {
      const response = await apiRequest('POST', '/api/super-admin/verify-signup-2fa', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the profile query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/profile'] });
    }
  });
}

export function useSuperAdminSignin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SuperAdminSigninData): Promise<SuperAdminAuthResponse> => {
      const response = await apiRequest('POST', '/api/super-admin/signin', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the profile query to refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/profile'] });
    }
  });
}

export function useSuperAdminLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/super-admin/logout');
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      // Specifically invalidate profile query
      queryClient.invalidateQueries({ queryKey: ['/api/super-admin/profile'] });
    }
  });
}

// Helper function to check if user has super admin access
export function useIsSuperAdmin() {
  const { superAdmin, isAuthenticated } = useSuperAdminAuth();
  
  return {
    isSuperAdmin: isAuthenticated && superAdmin?.role === 'super_admin',
    superAdmin,
    isAuthenticated
  };
}