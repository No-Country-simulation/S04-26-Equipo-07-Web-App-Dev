import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { paymentService } from '@/lib/services/user/payment.service'
import { CheckCircle, XCircle, X } from 'lucide-react'

type Payment = { id: string; amount: number; status: string; createdAt: string }

function statusColor(status: string) {
  if (status === 'ACCEPTED') return 'text-[#42ff00]'
  if (status === 'CANCELLED') return 'text-[#ffb4ab]'
  return 'text-[#ffe066]'
}

function statusDot(status: string) {
  if (status === 'ACCEPTED') return 'bg-[#42ff00]'
  if (status === 'CANCELLED') return 'bg-[#ffb4ab]'
  return 'bg-[#ffe066]'
}

// dispara confetti verde al confirmar pago exitoso
function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#42ff00', '#dae6d0', '#f0ffe4', '#3c4b35'],
  })
  setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.5 }, colors: ['#42ff00', '#baccaf'] }), 300)
}

export default function MovimientosPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const stripeResult = searchParams.get('stripe')
  const paymentId = searchParams.get('paymentId')
  const [banner, setBanner] = useState<'success' | 'cancel' | null>(null)
  const fired = useRef(false)

  // detecta retorno de stripe: llama al endpoint de verificacion para acreditar y luego muestra confetti
  useEffect(() => {
    if (stripeResult === 'success' && !fired.current) {
      fired.current = true
      setSearchParams({}, { replace: true })
      const confirm = () => {
        setBanner('success')
        fireConfetti()
        qc.invalidateQueries({ queryKey: ['payments'] })
        qc.invalidateQueries({ queryKey: ['balance'] })
      }
      if (paymentId) {
        paymentService.verifyPayment(paymentId).then(confirm).catch(confirm)
      } else {
        confirm()
      }
    } else if (stripeResult === 'cancel') {
      setBanner('cancel')
      setSearchParams({}, { replace: true })
    }
  }, [stripeResult, paymentId, qc, setSearchParams])

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => paymentService.getHistory().then(r => r.data),
  })

  const total = payments.filter(p => p.status === 'ACCEPTED').reduce((acc, p) => acc + p.amount, 0)

  return (
    <div className="p-8">
      {/* banner de resultado de pago */}
      {banner === 'success' && (
        <div className="mb-6 flex items-center justify-between border border-[#42ff00] bg-[#42ff00]/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-[#42ff00]" />
            <div>
              <p className="font-mono text-[12px] font-bold uppercase tracking-wider text-[#42ff00]">
                Pago exitoso
              </p>
              <p className="font-mono text-[10px] text-[#baccaf]">
                Tus créditos han sido acreditados. El saldo se actualizará en breve.
              </p>
            </div>
          </div>
          <button onClick={() => setBanner(null)} className="text-[#baccaf] hover:text-[#f0ffe4]">
            <X size={16} />
          </button>
        </div>
      )}
      {banner === 'cancel' && (
        <div className="mb-6 flex items-center justify-between border border-[#ffb4ab]/40 bg-[#ffb4ab]/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <XCircle size={18} className="text-[#ffb4ab]" />
            <p className="font-mono text-[12px] text-[#ffb4ab]">Pago cancelado. No se realizó ningún cargo.</p>
          </div>
          <button onClick={() => setBanner(null)} className="text-[#baccaf] hover:text-[#f0ffe4]">
            <X size={16} />
          </button>
        </div>
      )}

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Movimientos</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{payments.length}</span> transacciones registradas
          </p>
        </div>
        {payments.length > 0 && (
          <div className="border border-[#3c4b35] bg-[#182214] px-4 py-2 text-right">
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Total acreditado</p>
            <p className="font-mono text-[18px] font-bold text-[#42ff00]">
              {total.toFixed(2)} <span className="text-[10px] text-[#3c4b35]">USD</span>
            </p>
          </div>
        )}
      </header>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['ID Transacción', 'Monto', 'Estado', 'Fecha'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <p className="font-mono text-[10px] text-[#baccaf]">Sin movimientos registrados</p>
                    <p className="mt-1 font-mono text-[9px] text-[#3c4b35]">Los pagos procesados aparecerán aquí.</p>
                  </td>
                </tr>
              ) : payments.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4 font-mono text-[10px] text-[#3c4b35]">
                    {p.id.slice(-12).toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[14px] font-bold text-[#dae6d0]">
                      ${p.amount.toFixed(2)}
                    </span>
                    <span className="ml-1 font-mono text-[10px] text-[#3c4b35]">USD</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${statusColor(p.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot(p.status)}`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                    {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

