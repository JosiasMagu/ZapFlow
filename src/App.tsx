// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from './Pages/Home/HomePage'
import LoginPage from './Pages/LoginPage'
import SignUpPage from './Pages/Auth/SignUpPage'

import DashboardLayout from './Layouts/DashboardLayouts'
import DashboardHome from './Pages/Dashboard/DashboardHome'

// Seções do Dashboard
import FlowBuilderPage from './Pages/Flows/FlowBuilderPage'
import FlowCanvasPage from './Pages/Flows/FlowCanvasPage'
import BroadcastsPage from './Pages/Broadcasts/BroadcastPage'
import ContactsPage from './Pages/Contacts/ContactsPage'
import ActivityPage from './Pages/Dashboard/ActivityPage'
import TemplatesPage from './Pages/Dashboard/TemplatePage'

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<HomePage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />

        {/* Flows: lista + canvas */}
        <Route path="flows" element={<FlowBuilderPage />} />
        <Route path="flows/:id" element={<FlowCanvasPage />} />

        {/* Outras áreas */}
        <Route path="broadcasts" element={<BroadcastsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="templates" element={<TemplatesPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
