import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { LayoutDashboard, Building2, Megaphone, ArrowLeftRight, Settings, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/empresas', label: 'Empresas', icon: Building2, end: false },
  { to: '/dashboard/convocatorias', label: 'Convocatorias', icon: Megaphone, end: false },
  { to: '/dashboard/movimientos', label: 'Movimientos', icon: ArrowLeftRight, end: false },
]

export default function UserLayout() {
  const { logout, credits } = useUserAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-background flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">NorthPay</h2>
          <p className="text-xs text-muted-foreground mt-1">Creditos: {credits.toFixed(2)}</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
