import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  console.log('AuthGuard isAuthenticated:', isAuthenticated);
  if (isAuthenticated) return <>{children}</>;

  return <Navigate replace to="/login" state={{ from: location.pathname }} />;
}
