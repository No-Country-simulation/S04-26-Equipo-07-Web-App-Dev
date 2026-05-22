import { NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, FileCheck, Users, Settings, X } from "lucide-react"
import { logout } from "@/lib/api/auth"

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/pending", icon: FileCheck, label: "Aprobaciones Pendientes" },
  { to: "/admin/contractors", icon: Users, label: "Todos los Contratistas" },
  { to: "/admin/settings", icon: Settings, label: "Configuración" },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#3c4b35] bg-[#182214] transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-6 flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-headline-md font-bold text-[#f0ffe4]">NorthPay Admin</h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#baccaf] opacity-70">
              Terminal de Operaciones
            </p>
          </div>
          <button onClick={onClose} className="text-[#baccaf] md:hidden">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-mono text-[12px] uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "border-l-4 border-[#42ff00] bg-[#42ff00]/10 text-[#f0ffe4]"
                    : "border-l-4 border-transparent text-[#baccaf] hover:bg-[#232d1e] hover:text-[#dae6d0]"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4">
          <button
            onClick={() => { navigate("/admin/pending"); onClose() }}
            className="flex w-full items-center justify-center gap-2 bg-[#42ff00] py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-[#083900] transition-all hover:brightness-110 active:scale-95"
          >
            <FileCheck size={16} />
            Revisar Cola
          </button>

          <button
            onClick={() => { logout(); navigate("/login") }}
            className="mt-4 flex w-full items-center justify-center gap-2 border border-[#ffb4ab] py-3 font-mono text-[12px] uppercase tracking-wider text-[#ffb4ab] transition-all hover:bg-[#ffb4ab]/20 active:scale-95"
          >
            Cerrar Sesión
          </button>

          <div className="mt-6 flex items-center gap-3 border-t border-[#3c4b35] px-2 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#42ff00]/30 bg-[#232d1e] font-mono text-[12px] text-[#42ff00]">
              OR
            </div>
            <div>
              <p className="font-mono text-[12px] font-bold text-[#dae6d0]">OPS_ROOT</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Admin del Sistema</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
