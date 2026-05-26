import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'
import { paymentService } from '@/lib/services/user/payment.service'
import { companyService } from '@/lib/services/user/company.service'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default function ConvocatoriasPage() {
  const qc = useQueryClient()
  const [showPayment, setShowPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(10)

  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm<{
    companyId: string; title: string; description: string; location: string
  }>()

  const create = useMutation({
    mutationFn: (data: object) => convocatoriaService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['convocatorias'] }); reset() },
  })

  const payMutation = useMutation({
    mutationFn: (amount: number) => paymentService.createPaymentIntent(amount).then(r => r.data),
    onSuccess: async (data) => {
      // redirige a checkout de stripe con el client secret
      const stripe = await stripePromise
      if (stripe) {
        await stripe.confirmCardPayment(data.clientSecret)
        qc.invalidateQueries({ queryKey: ['balance'] })
        setShowPayment(false)
      }
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Convocatorias</h1>
        <Button variant="outline" onClick={() => setShowPayment(true)}>Agregar creditos</Button>
      </div>

      {showPayment && (
        <div className="rounded-lg border p-4 max-w-xs space-y-3">
          <p className="text-sm font-medium">Agregar creditos (USD)</p>
          <Input
            type="number"
            min={1}
            value={paymentAmount}
            onChange={e => setPaymentAmount(Number(e.target.value))}
          />
          <div className="flex gap-2">
            <Button onClick={() => payMutation.mutate(paymentAmount)} disabled={payMutation.isPending}>
              {payMutation.isPending ? 'Procesando...' : `Pagar $${paymentAmount}`}
            </Button>
            <Button variant="ghost" onClick={() => setShowPayment(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-2 gap-3 max-w-lg">
        <select {...register('companyId')} className="col-span-2 border rounded-md px-3 py-2 text-sm">
          <option value="">Selecciona empresa</option>
          {companies.map((c: { id: string; name: string }) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Input placeholder="Titulo" {...register('title')} className="col-span-2" />
        <Input placeholder="Descripcion" {...register('description')} className="col-span-2" />
        <Input placeholder="Ubicacion" {...register('location')} />
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Creando...' : 'Crear convocatoria'}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {convocatorias.map((c: { id: string; title: string; status: string; companyId: string }) => (
            <div key={c.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.companyId}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
