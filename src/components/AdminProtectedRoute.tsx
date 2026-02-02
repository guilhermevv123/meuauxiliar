import { Navigate } from "react-router-dom";
import { hasAdminSession } from "@/lib/adminSession";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!hasAdminSession()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

export default AdminProtectedRoute;
