import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/Authapi"; // 🔹 Import the axios instance from api.ts

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const response = await api.get("/auth/verify");
        console.log(response);
        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  if (!isAuthenticated || !allowedRoles.includes(userRole || "")) {
    return userRole === "professor" ? (
      <Navigate to="/loginprof" />
    ) : (
      <Navigate to="/loginstudent" />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
