import React from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

// A wrapper component for public routes that don't require authentication
export function PublicRoute({ children }: PublicRouteProps) {
  return <>{children}</>;
}