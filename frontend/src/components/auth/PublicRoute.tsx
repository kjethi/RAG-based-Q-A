import { Navigate } from "react-router-dom";
import { useAuth } from "../../authHook";
import type { JSX } from "react";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  
  // If user is authenticated, redirect to main app page
  return user ? <Navigate to={user.role === "admin" ? "/users" : "/documents"} replace /> : children;
}