import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { LayoutDashboard, Building2, Megaphone, ArrowLeftRight, LogOut } from 'lucide-react'

const NAV = [
  { to: '/dashboard',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/dashboard/empresas',     label: 'Empresas',      icon: Building2,       end: false },
  { to: '/dashboard/convocatorias',label: 'Convocatorias', icon: Megaphone,       end: false },
  { to: '/dashboard/movimientos',  label: 'Movimientos',   icon: ArrowLeftRight,  end: false },
]

export default function UserLayout() {
  const { logout, credits } = useUserAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-[#0c1609]">
      {/* sidebar */}
      <aside className="flex w-64 flex-col border-r border-[#3c4b35] bg-[#0c1609]">
        {/* brand */}
        <div className="border-b border-[#3c4b35] p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#42ff00]" />
            <h2 className="font-mono text-[16px] font-bold tracking-widest text-[#f0ffe4]">
              NORTH<span className="text-[#42ff00]">PAY</span>
            </h2>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
            Panel_Cliente_v1.0
          </p>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'border border-[#42ff00] bg-[#42ff00]/10 text-[#42ff00]'
                    : 'border border-transparent text-[#baccaf] hover:border-[#3c4b35] hover:text-[#dae6d0]'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* footer: credits + logout */}
        <div className="border-t border-[#3c4b35] p-3 space-y-1">
          <div className="px-3 py-2 border border-[#3c4b35] bg-[#182214]">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Créditos</p>
            <p className="font-mono text-[18px] font-bold text-[#42ff00] leading-tight">
              {credits.toFixed(2)}
              <span className="ml-1 text-[10px] text-[#3c4b35]">USD</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#ffb4ab]/40 hover:text-[#ffb4ab]"
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 overflow-auto bg-[#0c1609]">
        <Outlet />
      </main>
    </div>
  )
}
