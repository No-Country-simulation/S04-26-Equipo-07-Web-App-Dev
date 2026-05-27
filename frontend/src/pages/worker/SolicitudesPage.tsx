import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '@/lib/services/worker/request.service'
import { createSocketClient } from '@/lib/websocket/socket'
import { Client } from '@stomp/stompjs'
import { RefreshCw, Eye, CheckCircle, Clock, X, ExternalLink } from 'lucide-react'

type DocReview = { documentKey: string; status: string; observation?: string }
type ActionEntry = { workerId: string; action: string; notes: string; timestamp: string }
type PaymentSummary = { bankName?: string; accountType?: string; currency?: string }
type ContractSummary = { signature?: string; signedAt?: string; accepted?: boolean }
type Request = {
  id: string
  userId: string
  assignedWorkerId?: string
  status: string
  documentReviews: DocReview[]
  actionHistory: ActionEntry[]
  createdAt: string
  updatedAt: string
  // campos del onboarding completo
  documentUrls?: Record<string, string>
  paymentSummary?: PaymentSummary
  contractSummary?: ContractSummary
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE', IN_REVIEW: 'EN_REVISIÓN', APPROVED: 'APROBADO', REJECTED: 'RECHAZADO',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-[#baccaf] text-[#baccaf]',
  IN_REVIEW: 'border-blue-400 text-blue-400',
  APPROVED: 'border-[#42ff00] text-[#42ff00]',
  REJECTED: 'border-[#ffb4ab] text-[#ffb4ab]',
}

function DetailPanel({ req, onClose }: { req: Request; onClose: () => void }) {
  const qc = useQueryClient()
  const approve = useMutation({
    mutationFn: () => requestService.updateStatus(req.id, { status: 'APPROVED', notes: 'Documentos verificados' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }); onClose() },
  })
  const reject = useMutation({
    mutationFn: () => requestService.updateStatus(req.id, { status: 'REJECTED', notes: 'Documentos no válidos' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl border border-[#3c4b35] bg-[#0c1609] shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-[#f0ffe4]">
            Solicitud_<span className="text-[#42ff00]">#{req.id.slice(-8).toUpperCase()}</span>
          </h2>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 border border-[#3c4b35] bg-[#141e10] p-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Usuario ID</p>
              <p className="font-mono text-[12px] text-[#dae6d0]">{req.userId}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Estado</p>
              <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[req.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
                {STATUS_LABELS[req.status] ?? req.status}
              </span>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Trabajador Asignado</p>
              <p className="font-mono text-[12px] text-[#dae6d0]">{req.assignedWorkerId ?? '—'}</p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Última actualización</p>
              <p className="font-mono text-[12px] text-[#dae6d0]">
                {new Date(req.updatedAt).toLocaleString('es-AR')}
              </p>
            </div>
          </div>

          {req.documentReviews.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Documentos</p>
              <div className="space-y-1">
                {req.documentReviews.map(d => (
                  <div key={d.documentKey} className="flex items-center justify-between border border-[#3c4b35] px-4 py-2">
                    <span className="font-mono text-[11px] text-[#dae6d0]">{d.documentKey}</span>
                    {d.status === 'APPROVED'
                      ? <span className="flex items-center gap-1 font-mono text-[10px] text-[#42ff00]"><CheckCircle size={12} /> Aprobado</span>
                      : d.status === 'REJECTED'
                        ? <span className="flex items-center gap-1 font-mono text-[10px] text-[#ffb4ab]"><X size={12} /> Rechazado</span>
                        : <span className="flex items-center gap-1 font-mono text-[10px] text-[#baccaf]"><Clock size={12} /> Pendiente</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {req.actionHistory.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Historial</p>
              <div className="max-h-32 overflow-y-auto space-y-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35]">
                {req.actionHistory.map((a, i) => (
                  <div key={i} className="border border-[#3c4b35] px-4 py-2">
                    <span className="font-mono text-[10px] text-[#42ff00]">{a.action}</span>
                    <span className="ml-2 font-mono text-[10px] text-[#baccaf]">{a.notes}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* documentos subidos a cloudinary */}
          {req.documentUrls && Object.keys(req.documentUrls).length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Documentos Subidos</p>
              <div className="space-y-1">
                {Object.entries(req.documentUrls).map(([key, url]) => (
                  <div key={key} className="flex items-center justify-between border border-[#3c4b35] px-4 py-2">
                    <span className="font-mono text-[11px] text-[#dae6d0] capitalize">{key}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-[10px] text-[#42ff00] hover:text-[#a0ff80] transition-colors"
                    >
                      <ExternalLink size={10} />
                      Ver
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* metodo de pago */}
          {req.paymentSummary && (req.paymentSummary.bankName || req.paymentSummary.accountType) && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Método de Pago</p>
              <div className="border border-[#3c4b35] bg-[#141e10] p-4 grid grid-cols-3 gap-4">
                {req.paymentSummary.bankName && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Banco</p>
                    <p className="font-mono text-[11px] text-[#dae6d0]">{req.paymentSummary.bankName}</p>
                  </div>
                )}
                {req.paymentSummary.accountType && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Tipo</p>
                    <p className="font-mono text-[11px] text-[#dae6d0] capitalize">{req.paymentSummary.accountType}</p>
                  </div>
                )}
                {req.paymentSummary.currency && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Moneda</p>
                    <p className="font-mono text-[11px] text-[#dae6d0]">{req.paymentSummary.currency}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* informacion del contrato */}
          {req.contractSummary && req.contractSummary.signature && (
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Contrato</p>
              <div className="border border-[#3c4b35] bg-[#141e10] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Firma</p>
                    <p className="font-mono text-[11px] text-[#dae6d0]">{req.contractSummary.signature}</p>
                  </div>
                  <span className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                    req.contractSummary.accepted
                      ? 'border-[#42ff00] text-[#42ff00]'
                      : 'border-[#ffb4ab] text-[#ffb4ab]'
                  }`}>
                    {req.contractSummary.accepted ? 'Aceptado' : 'Pendiente'}
                  </span>
                </div>
                {req.contractSummary.signedAt && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Firmado</p>
                    <p className="font-mono text-[11px] text-[#dae6d0]">
                      {new Date(req.contractSummary.signedAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#3c4b35] px-6 py-4">
          <button onClick={onClose} className="border border-[#3c4b35] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]">
            Cerrar
          </button>
          {req.status === 'IN_REVIEW' && (
            <>
              <button
                onClick={() => reject.mutate()}
                disabled={reject.isPending}
                className="border border-[#ffb4ab] bg-[#ffb4ab]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/20 disabled:opacity-50"
              >
                Rechazar
              </button>
              <button
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="border border-[#42ff00] bg-[#42ff00] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
              >
                Aprobar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: '', label: 'TODOS' },
  { key: 'PENDING', label: 'PENDIENTE' },
  { key: 'IN_REVIEW', label: 'EN_REVISIÓN' },
  { key: 'APPROVED', label: 'APROBADO' },
  { key: 'REJECTED', label: 'RECHAZADO' },
]

export default function SolicitudesPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Request | null>(null)

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['requests', filter],
    queryFn: () => requestService.list(filter || undefined).then(r => r.data),
  })

  const assign = useMutation({
    mutationFn: (id: string) => requestService.assign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  useEffect(() => {
    let client: Client
    const setup = () => {
      client = createSocketClient(() => {
        client.subscribe('/topic/worker/requests', () => {
          qc.invalidateQueries({ queryKey: ['requests'] })
        })
      })
      client.activate()
    }
    setup()
    return () => { client?.deactivate() }
  }, [qc])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Solicitudes_Onboarding</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            TOTAL: <span className="text-[#dae6d0]">{requests.length}</span> registros
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['requests'] })}
          className="flex items-center gap-2 border border-[#3c4b35] bg-[#232d1e] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#dae6d0] hover:border-[#42ff00]"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </header>

      {/* filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              filter === key
                ? 'bg-[#42ff00] font-bold text-[#083900] shadow-[0_0_8px_rgba(66,255,0,0.3)]'
                : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35] [&::-webkit-scrollbar-track]:bg-[#141e10]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['ID Solicitud', 'Usuario', 'Estado', 'Docs OK', 'Asignado a', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin registros</td></tr>
              ) : requests.map(r => {
                const docsOk = r.documentReviews.filter(d => d.status === 'APPROVED').length
                const docsTotal = r.documentReviews.length
                return (
                  <tr key={r.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-5 py-4">
                      <p className="font-mono text-[11px] font-bold text-[#dae6d0]">#{r.id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{r.userId.slice(-12)}</td>
                    <td className="px-5 py-4">
                      <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[r.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono text-[11px] ${docsTotal > 0 && docsOk === docsTotal ? 'text-[#42ff00]' : 'text-[#baccaf]'}`}>
                        {docsOk}/{docsTotal}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">
                      {r.assignedWorkerId ? r.assignedWorkerId.slice(-8) : '—'}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                      {new Date(r.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === 'PENDING' && !r.assignedWorkerId ? (
                        <button
                          onClick={() => assign.mutate(r.id)}
                          disabled={assign.isPending}
                          className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-50"
                        >
                          Tomar
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelected(r)}
                          className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
                        >
                          <Eye className="mr-1 inline" size={12} />
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailPanel req={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
