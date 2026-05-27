import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { moduleService } from '@/lib/services/worker/module.service'
import { useWorkerAuth } from '@/contexts/WorkerAuthContext'
import {
  LogOut, LayoutDashboard, ClipboardList, Users, Shield,
  LayoutGrid, Megaphone, ScrollText, ArrowLeftRight, UserRoundPlus, type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, ClipboardList, Users, Shield,
  LayoutGrid, Megaphone, ScrollText, ArrowLeftRight, UserRoundPlus,
}

type AppModule = { id: string; title: string; path: string; icon: string; group: string }

export default function WorkerLayout() {
  const { logout, workerId } = useWorkerAuth()
  const navigate = useNavigate()

  const { data: modules = [] } = useQuery<AppModule[]>({
    queryKey: ['modules'],
    queryFn: () => moduleService.list().then(r => r.data),
  })

  const handleLogout = () => { logout(); navigate('/worker/login') }

  const gestion = modules.filter(m => m.group === 'gestion')
  const sistema = modules.filter(m => m.group === 'sistema')

  const NavItem = ({ m }: { m: AppModule }) => {
    const Icon = ICONS[m.icon] ?? LayoutGrid
    return (
      <NavLink
        to={m.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors ${
            isActive
              ? 'border border-[#42ff00] bg-[#42ff00]/10 text-[#42ff00]'
              : 'border border-transparent text-[#baccaf] hover:border-[#3c4b35] hover:text-[#dae6d0]'
          }`
        }
      >
        <Icon size={14} />
        {m.title}
      </NavLink>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#0c1609]">
      <aside className="flex w-64 flex-col border-r border-[#3c4b35] bg-[#0c1609]">
        {/* logo */}
        <div className="border-b border-[#3c4b35] p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#42ff00]" />
            <h2 className="font-mono text-[16px] font-bold tracking-widest text-[#f0ffe4]">
              NORTH<span className="text-[#42ff00]">PAY</span>
            </h2>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
            Panel_Trabajador_v1.0
          </p>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {gestion.length > 0 && (
            <div>
              <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
                — Gestión
              </p>
              <div className="space-y-0.5">
                {gestion.map(m => <NavItem key={m.id} m={m} />)}
              </div>
            </div>
          )}
          {sistema.length > 0 && (
            <div>
              <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
                — Sistema
              </p>
              <div className="space-y-0.5">
                {sistema.map(m => <NavItem key={m.id} m={m} />)}
              </div>
            </div>
          )}
        </nav>

        {/* footer */}
        <div className="border-t border-[#3c4b35] p-3 space-y-1">
          {workerId && (
            <div className="px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
                Sesión activa
              </p>
              <p className="font-mono text-[11px] text-[#dae6d0] truncate">
                {workerId ?? 'Trabajador'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 border border-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#3c4b35] hover:text-[#ffb4ab]"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#0c1609]">
        <Outlet />
      </main>
    </div>
  )
}
