import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "../app/LandingPage"
import { LoginPage } from "../app/LoginPage"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AdminLayout } from "@/components/admin/AdminLayout"
import AdminDashboard from "@/modules/admin/page/AdminDashboard"
import PendingPage from "@/pages/admin/PendingPage"
import ContractorsPage from "@/pages/admin/ContractorsPage"
import SettingsPage from "@/pages/admin/SettingsPage"
import InvitationRegister from "@/pages/auth/InvitationRegister"
import SetPassword from "@/pages/auth/SetPassword"
import WorkerLogin from "@/pages/worker/WorkerLogin"
import WorkerLayout from "@/pages/worker/WorkerLayout"
import WorkerDashboard from "@/pages/worker/WorkerDashboard"
import SolicitudesPage from "@/pages/worker/SolicitudesPage"
import WorkersPage from "@/pages/worker/WorkersPage"
import RolesPage from "@/pages/worker/RolesPage"
import ModulesPage from "@/pages/worker/ModulesPage"
import WorkerConvocatoriasPage from "@/pages/worker/WorkerConvocatoriasPage"
import LogsUsersPage from "@/pages/worker/LogsUsersPage"
import LogsWorkersPage from "@/pages/worker/LogsWorkersPage"
import PersonasPage from "@/pages/worker/PersonasPage"
import ClientesPage from "@/pages/worker/ClientesPage"
import MovimientosAdminPage from "@/pages/worker/MovimientosAdminPage"
import UserLayout from "@/pages/user/UserLayout"
import UserDashboard from "@/pages/user/UserDashboard"
import EmpresasPage from "@/pages/user/EmpresasPage"
import ConvocatoriasPage from "@/pages/user/ConvocatoriasPage"
import MovimientosPage from "@/pages/user/MovimientosPage"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<InvitationRegister />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/worker/login" element={<WorkerLogin />} />

        {/* rutas del panel de trabajador */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route index element={<WorkerDashboard />} />
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="requests" element={<SolicitudesPage />} />
          <Route path="workers" element={<WorkersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="convocatorias" element={<WorkerConvocatoriasPage />} />
          <Route path="logs/users" element={<LogsUsersPage />} />
          <Route path="logs/workers" element={<LogsWorkersPage />} />
          <Route path="personas" element={<PersonasPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="movimientos" element={<MovimientosAdminPage />} />
        </Route>

        {/* rutas del panel de usuario */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="convocatorias" element={<ConvocatoriasPage />} />
          <Route path="movimientos" element={<MovimientosPage />} />
        </Route>

        {/* rutas de admin legacy */}
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