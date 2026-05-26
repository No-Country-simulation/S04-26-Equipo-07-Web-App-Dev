import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'
import { paymentService } from '@/lib/services/user/payment.service'
import { companyService } from '@/lib/services/user/company.service'
import { useForm } from 'react-hook-form'
import { Plus, X, CreditCard } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

type ConvocatoriaForm = { companyId: string; title: string; description: string; location: string }
type Convocatoria = { id: string; title: string; status: string; companyId: string }

function statusColor(status: string) {
  if (status === 'ACTIVE') return 'text-[#42ff00]'
  if (status === 'CLOSED') return 'text-[#ffb4ab]'
  return 'text-[#ffe066]'
}

export default function ConvocatoriasPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(10)

  const { data: convocatorias = [], isLoading } = useQuery<Convocatoria[]>({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const { data: companies = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm<ConvocatoriaForm>()

  const create = useMutation({
    mutationFn: (data: object) => convocatoriaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['convocatorias'] })
      reset()
      setShowForm(false)
    },
  })

  // stripe payment: create intent then confirm
  const payMutation = useMutation({
    mutationFn: (amount: number) => paymentService.createPaymentIntent(amount).then(r => r.data),
    onSuccess: async (data) => {
      const stripe = await stripePromise
      if (stripe) {
        await stripe.confirmCardPayment(data.clientSecret)
        qc.invalidateQueries({ queryKey: ['balance'] })
        setShowPayment(false)
      }
    },
  })

  const active = convocatorias.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="p-8">
      {/* header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Convocatorias</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{active}</span> activas · {convocatorias.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPayment(v => !v)}
            className="flex items-center gap-2 border border-[#3c4b35] bg-[#182214] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] transition-colors"
          >
            <CreditCard size={14} />
            Agregar Créditos
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : 'Nueva Convocatoria'}
          </button>
        </div>
      </header>

      {/* stripe payment panel */}
      {showPayment && (
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
            — Agregar Créditos (USD)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={paymentAmount}
              onChange={e => setPaymentAmount(Number(e.target.value))}
              className="w-32 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
            />
            <button
              onClick={() => payMutation.mutate(paymentAmount)}
              disabled={payMutation.isPending}
              className="border border-[#42ff00] bg-[#42ff00] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
            >
              {payMutation.isPending ? 'Procesando...' : `Pagar $${paymentAmount}`}
            </button>
            <button
              onClick={() => setShowPayment(false)}
              className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#42ff00]"
            >
              Cancelar
            </button>
          </div>
          {payMutation.isError && (
            <p className="mt-2 font-mono text-[10px] text-[#ffb4ab]">Error al procesar el pago.</p>
          )}
        </div>
      )}

      {/* create form */}
      {showForm && (
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
            — Nueva Convocatoria
          </p>
          <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              {...register('companyId')}
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
            >
              <option value="">Selecciona una empresa</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              {...register('title')}
              placeholder="Título de la convocatoria"
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <input
              {...register('description')}
              placeholder="Descripción"
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <input
              {...register('location')}
              placeholder="Ubicación"
              className="border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <button
              type="submit"
              disabled={create.isPending}
              className="border border-[#42ff00] bg-[#42ff00] py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
            >
              {create.isPending ? 'Creando...' : 'Publicar'}
            </button>
          </form>
          {create.isError && (
            <p className="mt-2 font-mono text-[10px] text-[#ffb4ab]">Error al crear la convocatoria.</p>
          )}
        </div>
      )}

      {/* list */}
      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Empresa', 'Estado', 'ID'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : convocatorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <p className="font-mono text-[10px] text-[#baccaf]">Sin convocatorias publicadas</p>
                    <p className="mt-1 font-mono text-[9px] text-[#3c4b35]">Usa el botón "Nueva Convocatoria" para publicar una.</p>
                  </td>
                </tr>
              ) : convocatorias.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{c.title}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.companyId.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${statusColor(c.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#3c4b35]">{c.id.slice(-8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
