import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // ✅ logged in
  return children;
}