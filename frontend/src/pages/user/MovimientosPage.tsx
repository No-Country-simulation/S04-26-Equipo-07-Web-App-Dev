import { useQuery } from '@tanstack/react-query'
import { paymentService } from '@/lib/services/user/payment.service'

export default function MovimientosPage() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getHistory().then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Movimientos</h1>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {payments.map((p: { id: string; amount: number; status: string; createdAt: string }) => (
            <div key={p.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">${p.amount.toFixed(2)} USD</p>
                <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-medium ${
                p.status === 'ACCEPTED' ? 'text-green-600' :
                p.status === 'CANCELLED' ? 'text-red-500' : 'text-yellow-600'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-muted-foreground">Sin movimientos</p>}
        </div>
      )}
    </div>
  )
}
