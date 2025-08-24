import { Navigate } from "react-router-dom";
import { useAuth } from "../../authHook";
import type { JSX } from "react";

export default function PrivateRoute({
  adminOnly = false,
  children,
}: {
  adminOnly?: boolean;
  children: JSX.Element;
}) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  } else if (adminOnly && user.role !== "admin") {
    return <Navigate to="/documents" replace />;
  }
  return children;
}
