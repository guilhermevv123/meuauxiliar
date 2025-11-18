import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "@/lib/session";

type Props = { children: ReactNode };

export const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const session = getSession();
  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};
