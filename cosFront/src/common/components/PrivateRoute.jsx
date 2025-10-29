import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { token } = useAuth();

  // Si le token existe, autoriser l’accès, sinon rediriger vers /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
