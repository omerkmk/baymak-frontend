import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DevicesPage from "./pages/DevicesPage";
import UsersPage from "./pages/UsersPage";
import TechniciansPage from "./pages/TechniciansPage";
import ProfilePage from "./pages/ProfilePage";
import ServiceReportsPage from "./pages/ServiceReportsPage";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="devices" element={<DevicesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="technicians" element={<TechniciansPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="reports" element={<ServiceReportsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
