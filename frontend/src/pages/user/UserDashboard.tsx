import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/lib/services/user/payment.service'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'

export default function UserDashboard() {
  const { data: balance } = useQuery({
    queryKey: ['balance'],
    queryFn: () => paymentService.getBalance().then(r => r.data),
  })

  const { data: convocatorias } = useQuery({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const active = convocatorias?.filter((c: { status: string }) => c.status === 'ACTIVE').length ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Creditos disponibles</p>
          <p className="text-3xl font-bold mt-1">{balance?.credits?.toFixed(2) ?? '—'}</p>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Convocatorias activas</p>
          <p className="text-3xl font-bold mt-1">{active}</p>
        </div>
      </div>
    </div>
  )
}
