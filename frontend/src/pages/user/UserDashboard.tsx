import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/lib/services/user/payment.service'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'
import { companyService } from '@/lib/services/user/company.service'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-[#3c4b35] bg-[#182214] p-6 hover:border-[#42ff00]/40 transition-colors">
      <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
        {label}
      </p>
      <p className="mt-2 font-mono text-[32px] font-bold leading-none text-[#42ff00]">
        {value}
      </p>
      {sub && (
        <p className="mt-1 font-mono text-[10px] text-[#baccaf]">{sub}</p>
      )}
    </div>
  )
}

export default function UserDashboard() {
  const { data: balance } = useQuery({
    queryKey: ['balance'],
    queryFn: () => paymentService.getBalance().then(r => r.data),
  })

  const { data: convocatorias = [] } = useQuery<{ status: string }[]>({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const { data: companies = [] } = useQuery<{ id: string }[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const active  = convocatorias.filter(c => c.status === 'ACTIVE').length
  const credits = balance?.credits ?? 0

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-[28px] font-bold text-[#f0ffe4]">Dashboard</h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
          Resumen de tu cuenta NorthPay
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Créditos Disponibles"
          value={credits.toFixed(2)}
          sub="USD en tu cuenta"
        />
        <StatCard
          label="Convocatorias Activas"
          value={active}
          sub={`de ${convocatorias.length} total`}
        />
        <StatCard
          label="Empresas Registradas"
          value={companies.length}
          sub="vinculadas a tu perfil"
        />
      </div>

      {/* recent activity hint */}
      <div className="mt-8 border border-[#3c4b35] bg-[#182214] p-5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35] mb-3">
          — Estado del sistema
        </p>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#42ff00] animate-pulse" />
          <span className="font-mono text-[11px] text-[#dae6d0]">Conexión activa con NorthPay</span>
        </div>
      </div>
    </div>
  )
}
