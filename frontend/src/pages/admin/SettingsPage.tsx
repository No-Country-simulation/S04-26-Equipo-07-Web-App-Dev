import { Shield, Bell, Globe, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-[32px]">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-[#f0ffe4] md:text-[32px]">Configuración</h2>
        <p className="mt-1 font-mono text-[12px] uppercase tracking-wider text-[#baccaf]">
          Administrar preferencias del sistema
        </p>
      </div>

      <div className="space-y-6">
        <div className="border border-[#3c4b35] bg-[#182214] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Shield className="text-[#42ff00]" size={20} />
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-[#f0ffe4]">Seguridad</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Autenticación de dos factores</span>
              <input type="checkbox" defaultChecked className="accent-[#42ff00]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Notificar inicio de sesión nuevo</span>
              <input type="checkbox" defaultChecked className="accent-[#42ff00]" />
            </label>
          </div>
        </div>

        <div className="border border-[#3c4b35] bg-[#182214] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="text-[#42ff00]" size={20} />
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-[#f0ffe4]">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Alertas de nuevos contratistas</span>
              <input type="checkbox" defaultChecked className="accent-[#42ff00]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Documentos pendientes</span>
              <input type="checkbox" defaultChecked className="accent-[#42ff00]" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Errores del sistema</span>
              <input type="checkbox" defaultChecked className="accent-[#42ff00]" />
            </label>
          </div>
        </div>

        <div className="border border-[#3c4b35] bg-[#182214] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Globe className="text-[#42ff00]" size={20} />
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-[#f0ffe4]">Región</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Zona horaria</span>
              <select className="border border-[#3c4b35] bg-[#141e10] px-3 py-1.5 font-mono text-[12px] text-[#dae6d0] outline-none">
                <option>UTC-06:00 (Ciudad de México)</option>
                <option>UTC-05:00 (Bogotá)</option>
                <option>UTC-03:00 (Buenos Aires)</option>
                <option>UTC+01:00 (Madrid)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#dae6d0]">Moneda predeterminada</span>
              <select className="border border-[#3c4b35] bg-[#141e10] px-3 py-1.5 font-mono text-[12px] text-[#dae6d0] outline-none">
                <option>MXN</option>
                <option>USD</option>
                <option>EUR</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border border-[#3c4b35] bg-[#182214] p-6">
          <div className="mb-4 flex items-center gap-3">
            <RefreshCw className="text-[#42ff00]" size={20} />
            <h3 className="font-mono text-[14px] font-bold uppercase tracking-wider text-[#f0ffe4]">Sincronización</h3>
          </div>
          <p className="mb-4 text-[13px] text-[#baccaf]">
            Los datos se sincronizan automáticamente cada 5 minutos.
          </p>
          <button className="border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-[#42ff00] transition-all hover:bg-[#42ff00] hover:text-[#083900]">
            Forzar sincronización
          </button>
        </div>
      </div>
    </div>
  )
}
