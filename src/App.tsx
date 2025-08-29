// FILE: src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";

// Layout
import DashboardLayouts from "./Layouts/DashboardLayouts";

// Páginas públicas
import HomePage from "./Pages/Home/HomePage";
import SignUpPage from "./Pages/Auth/SignUpPage";
import LoginPage from "./Pages/LoginPage";

// Dashboard (filhas)
import DashboardHome from "./Pages/Dashboard/DashboardHome";
import TemplatePage from "./Pages/Dashboard/TemplatePage";
import FlowsPage from "./Pages/Flows/FlowPage";           // ✅ usa o arquivo da listagem mostrado por você
import ConnectionPage from "./Pages/Dashboard/Components/ConnectionPage";
import FlowCanvas from "./Pages/Flows/FlowCanvas";          // ✅ editor visual (canvas)

const App: React.FC = () => {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protegido: Dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayouts />
          </RequireAuth>
        }
      >
        {/* Início do dashboard */}
        <Route index element={<DashboardHome />} />

        {/* Conexão */}
        <Route path="conexao" element={<ConnectionPage />} />

        {/* LISTA de Funis — suportando duas rotas */}
        <Route path="funis" element={<FlowsPage />} />
        <Route path="flows" element={<FlowsPage />} />

        {/* CANVAS do Funil — suportando as duas convenções */}
        <Route path="flows/canvas/:id" element={<FlowCanvas />} />
        <Route path="flows/:id" element={<FlowCanvas />} />

        {/* Templates */}
        <Route path="templates" element={<TemplatePage />} />

        {/* Pequenos redirecionamentos/aliases úteis */}
        <Route path="funnels" element={<Navigate to="/dashboard/funis" replace />} />
      </Route>

      {/* 404 simples: manda para home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

export default App;
