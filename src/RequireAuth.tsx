import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// Se usas um AuthProvider real, importa o hook daqui:
// import { useAuth } from "./Pages/Provider/AuthProvider";

const useFakeAuth = () => {
  // TROCA por teu hook real (ex.: useAuth())
  // Aqui só para não travar tua navegação enquanto o back não está integrado
  const token = localStorage.getItem("auth_token");
  return { isAuthenticated: !!token };
};

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useFakeAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default RequireAuth;
