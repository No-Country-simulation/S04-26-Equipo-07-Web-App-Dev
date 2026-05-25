import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useState } from "react"
import { Menu } from "lucide-react"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0c1609]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#3c4b35] bg-[#182214]/70 px-6 backdrop-blur-md md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-[#dae6d0]">
            <Menu size={24} />
          </button>
          <h1 className="text-[18px] font-bold text-[#f0ffe4]">NorthPay Admin</h1>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
