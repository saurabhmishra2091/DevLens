import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: "40px", color: "#38bdf8" }}>Loading user session...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;