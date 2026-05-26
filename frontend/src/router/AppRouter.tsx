import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../app/LandingPage"
import { LoginPage } from "../app/LoginPage"
import { RegisterPage } from "@/app/RegisterPage"
import Success from "@/pages/onboarding/Success"
import TokenGate from "@/components/onboarding/TokenGate"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import AdminDashboard from "@/modules/admin/page/AdminDashboard"
import PendingPage from "@/pages/admin/PendingPage"
import ContractorsPage from "@/pages/admin/ContractorsPage"
import SettingsPage from "@/pages/admin/SettingsPage"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding/success" element={<Success />} />
        <Route path="/onboarding/:token" element={<TokenGate />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="pending" element={<PendingPage />} />
          <Route path="contractors" element={<ContractorsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter