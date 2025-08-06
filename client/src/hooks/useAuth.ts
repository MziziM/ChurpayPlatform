import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check for fresh auth data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch // Allow manual refresh of auth state
  };
}