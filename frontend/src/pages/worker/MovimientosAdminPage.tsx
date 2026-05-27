import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { workerPaymentService } from '@/lib/services/worker/payment.service'
import { personaService } from '@/lib/services/worker/persona.service'

type Payment = {
  id: string
  userId: string
  amount: number
  currency: string
  status: string
  createdAt?: string
}

type Persona = {
  id: string
  firstName: string
  lastName: string
  email: string
}

function statusClass(status: string) {
  if (status === 'ACCEPTED') return 'text-[#42ff00]'
  if (status === 'CANCELLED') return 'text-[#ffb4ab]'
  return 'text-[#ffe066]'
}

export default function MovimientosAdminPage() {
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['worker', 'payments'],
    queryFn: () => workerPaymentService.list().then((r) => r.data),
  })

  const { data: personas = [] } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => personaService.list().then((r) => r.data),
  })

  const byUserId = useMemo(() => {
    const map = new Map<string, Persona>()
    personas.forEach((p) => map.set(p.id, p))
    return map
  }, [personas])

  const acceptedTotal = payments
    .filter((p) => p.status === 'ACCEPTED')
    .reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Movimientos_Usuarios</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{payments.length}</span> transacciones registradas
          </p>
        </div>
        <div className="border border-[#3c4b35] bg-[#182214] px-4 py-2 text-right">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Total aceptado</p>
          <p className="font-mono text-[18px] font-bold text-[#42ff00]">{acceptedTotal.toFixed(2)} USD</p>
        </div>
      </header>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Usuario', 'Email', 'Monto', 'Estado', 'Fecha', 'ID'].map((h) => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">
                    Sin transacciones registradas
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const user = byUserId.get(p.userId)
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-[#42ff00]/5">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">
                        {user ? `${user.firstName} ${user.lastName}` : p.userId.slice(-8)}
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{user?.email ?? '—'}</td>
                      <td className="px-5 py-4 font-mono text-[12px] font-bold text-[#dae6d0]">${p.amount.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`font-mono text-[10px] uppercase tracking-wider ${statusClass(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('es-AR') : '—'}
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-[#3c4b35]">{p.id.slice(-10).toUpperCase()}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
