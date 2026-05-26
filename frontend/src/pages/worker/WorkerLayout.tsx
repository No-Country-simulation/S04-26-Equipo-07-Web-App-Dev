import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { moduleService } from '@/lib/services/worker/module.service'
import { useWorkerAuth } from '@/contexts/WorkerAuthContext'
import { LogOut } from 'lucide-react'

export default function WorkerLayout() {
  const { logout } = useWorkerAuth()
  const navigate = useNavigate()

  const { data: modules = [] } = useQuery({
    queryKey: ['modules'],
    queryFn: () => moduleService.list().then(r => r.data),
  })

  const handleLogout = () => { logout(); navigate('/worker/login') }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 border-r bg-background flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold">NorthPay</h2>
          <p className="text-xs text-muted-foreground mt-1">Panel de trabajador</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {modules.map((m: { id: string; title: string; path: string }) => (
            <NavLink
              key={m.id}
              to={`/worker${m.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`
              }
            >
              {m.title}
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
