import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convocatoriaWorkerService } from '@/lib/services/worker/convocatoria.service'
import { RefreshCw, Send, X, Eye, MapPin, Briefcase, DollarSign, Calendar, CheckCircle, List } from 'lucide-react'

type Convocatoria = {
  id: string; title: string; description: string; companyId: string
  location: string; modality: string; contractType: string
  salaryMin?: number; salaryMax?: number
  startDate?: string; endDate?: string
  technicalRequirements?: string[]; questions?: string[]
  views?: number; applicationCount?: number
  creditCost: number; status: string; createdAt: string; updatedAt: string
}

type Application = {
  id: string; applicantName: string; applicantEmail: string
  applicantPhone?: string; applicantLinkedIn?: string
  answers?: string[]; fileUrl?: string; appliedAt: string
}

type LogEntry = {
  id: string; action: string; performedBy: string; detail?: string; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'BORRADOR', ACTIVE: 'ACTIVA', CLOSED: 'CERRADA', CANCELLED: 'CANCELADA',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-[#baccaf] text-[#baccaf]',
  ACTIVE: 'border-[#42ff00] text-[#42ff00]',
  CLOSED: 'border-[#3c4b35] text-[#3c4b35]',
  CANCELLED: 'border-[#ffb4ab] text-[#ffb4ab]',
}

const FILTERS = [
  { key: '', label: 'TODAS' },
  { key: 'DRAFT', label: 'BORRADOR' },
  { key: 'ACTIVE', label: 'ACTIVA' },
  { key: 'CLOSED', label: 'CERRADA' },
  { key: 'CANCELLED', label: 'CANCELADA' },
]

// ─── Detail Drawer ───────────────────────────────────────────────────────────
function DetailDrawer({
  conv,
  onClose,
}: {
  conv: Convocatoria
  onClose: () => void
}) {
  const [tab, setTab] = useState<'datos' | 'postulantes' | 'logs'>('datos')

  const { data: applications = [], isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ['worker-conv-applications', conv.id],
    queryFn: () => convocatoriaWorkerService.getApplications(conv.id).then(r => r.data),
    enabled: tab === 'postulantes',
  })

  const { data: logs = [], isLoading: loadingLogs } = useQuery<LogEntry[]>({
    queryKey: ['worker-conv-logs', conv.id],
    queryFn: () =>
      convocatoriaWorkerService.getLogs().then(r =>
        (r.data as LogEntry[]).filter(l => l.detail?.includes(conv.id) || l.detail?.includes(conv.title))
      ),
    enabled: tab === 'logs',
  })

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-[#3c4b35] bg-[#0c1609] shadow-2xl overflow-hidden">
        {/* header */}
        <div className="flex items-start justify-between border-b border-[#3c4b35] bg-[#182214] px-6 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Convocatoria</p>
            <h2 className="mt-0.5 font-mono text-[17px] font-bold text-[#f0ffe4] leading-tight">{conv.title}</h2>
            <span className={`mt-1 inline-block border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${STATUS_COLORS[conv.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
              {STATUS_LABELS[conv.status] ?? conv.status}
            </span>
          </div>
          <button onClick={onClose} className="mt-1 text-[#3c4b35] hover:text-[#f0ffe4]">
            <X size={18} />
          </button>
        </div>

        {/* tabs */}
        <div className="flex border-b border-[#3c4b35] bg-[#0c1609]">
          {(['datos', 'postulantes', 'logs'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                tab === t
                  ? 'border-b-2 border-[#42ff00] text-[#42ff00]'
                  : 'text-[#3c4b35] hover:text-[#baccaf]'
              }`}
            >
              {t === 'datos' ? 'Datos' : t === 'postulantes' ? `Postulantes${conv.applicationCount ? ` (${conv.applicationCount})` : ''}` : 'Logs'}
            </button>
          ))}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'datos' && (
            <>
              <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
                {conv.location && (
                  <div className="flex items-center gap-2 text-[#baccaf]">
                    <MapPin size={11} className="text-[#42ff00]" />
                    <span>{conv.location}</span>
                  </div>
                )}
                {conv.modality && (
                  <div className="flex items-center gap-2 text-[#baccaf]">
                    <Briefcase size={11} className="text-[#42ff00]" />
                    <span>{conv.modality} · {conv.contractType}</span>
                  </div>
                )}
                {(conv.salaryMin || conv.salaryMax) && (
                  <div className="flex items-center gap-2 text-[#baccaf]">
                    <DollarSign size={11} className="text-[#42ff00]" />
                    <span>
                      {conv.salaryMin ? `$${conv.salaryMin.toLocaleString()}` : '?'}
                      {' – '}
                      {conv.salaryMax ? `$${conv.salaryMax.toLocaleString()}` : '?'}
                    </span>
                  </div>
                )}
                {(conv.startDate || conv.endDate) && (
                  <div className="flex items-center gap-2 text-[#baccaf]">
                    <Calendar size={11} className="text-[#42ff00]" />
                    <span>{conv.startDate?.slice(0, 10)} → {conv.endDate?.slice(0, 10)}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Descripción</p>
                <div
                  className="font-mono text-[11px] text-[#dae6d0] leading-relaxed prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: conv.description }}
                />
              </div>

              {conv.technicalRequirements?.length ? (
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Requisitos técnicos</p>
                  <div className="flex flex-wrap gap-2">
                    {conv.technicalRequirements.map((t, i) => (
                      <span key={i} className="flex items-center gap-1 border border-[#3c4b35] px-2 py-0.5 font-mono text-[10px] text-[#baccaf]">
                        <CheckCircle size={9} className="text-[#42ff00]" />{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {conv.questions?.length ? (
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Preguntas</p>
                  <ol className="space-y-1">
                    {conv.questions.map((q, i) => (
                      <li key={i} className="font-mono text-[11px] text-[#baccaf]">
                        <span className="mr-1 text-[#42ff00]">{i + 1}.</span>{q}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-3 border-t border-[#3c4b35] pt-4">
                {[
                  { label: 'Créditos', value: conv.creditCost },
                  { label: 'Vistas', value: conv.views ?? 0 },
                  { label: 'Postulantes', value: conv.applicationCount ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-[#3c4b35] bg-[#182214] p-3 text-center">
                    <p className="font-mono text-[18px] font-bold text-[#42ff00]">{value}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'postulantes' && (
            loadingApps ? (
              <p className="font-mono text-[10px] text-[#3c4b35]">Cargando...</p>
            ) : applications.length === 0 ? (
              <p className="font-mono text-[10px] text-[#3c4b35]">Sin postulantes aún</p>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div key={app.id} className="border border-[#3c4b35] bg-[#182214] p-4 space-y-1">
                    <p className="font-mono text-[12px] font-bold text-[#f0ffe4]">{app.applicantName}</p>
                    <p className="font-mono text-[10px] text-[#baccaf]">{app.applicantEmail}</p>
                    {app.applicantPhone && <p className="font-mono text-[10px] text-[#baccaf]">{app.applicantPhone}</p>}
                    {app.applicantLinkedIn && (
                      <a href={app.applicantLinkedIn} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-[10px] text-[#42ff00] hover:underline">
                        {app.applicantLinkedIn}
                      </a>
                    )}
                    {app.fileUrl && (
                      <a href={app.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 font-mono text-[10px] text-[#42ff00] hover:underline">
                        <List size={10} /> Ver CV/Portfolio
                      </a>
                    )}
                    {app.answers?.length ? (
                      <div className="mt-2 space-y-1">
                        {app.answers.map((ans, i) => (
                          <p key={i} className="font-mono text-[10px] text-[#baccaf]">
                            <span className="text-[#3c4b35]">{i + 1}. </span>{ans}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <p className="font-mono text-[9px] text-[#3c4b35]">
                      {new Date(app.appliedAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'logs' && (
            loadingLogs ? (
              <p className="font-mono text-[10px] text-[#3c4b35]">Cargando logs...</p>
            ) : logs.length === 0 ? (
              <p className="font-mono text-[10px] text-[#3c4b35]">Sin logs para esta convocatoria</p>
            ) : (
              <div className="space-y-2">
                {logs.map(l => (
                  <div key={l.id} className="border-l-2 border-[#3c4b35] pl-3">
                    <p className="font-mono text-[11px] text-[#dae6d0]">{l.action}</p>
                    {l.detail && <p className="font-mono text-[10px] text-[#baccaf]">{l.detail}</p>}
                    <p className="font-mono text-[9px] text-[#3c4b35]">
                      {l.performedBy} · {new Date(l.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WorkerConvocatoriasPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Convocatoria | null>(null)

  const { data: convocatorias = [], isLoading } = useQuery<Convocatoria[]>({
    queryKey: ['convocatorias-worker', filter],
    queryFn: () => convocatoriaWorkerService.list().then(r => {
      const list = r.data as Convocatoria[]
      return filter ? list.filter(c => c.status === filter) : list
    }),
  })

  const publish = useMutation({
    mutationFn: (id: string) => convocatoriaWorkerService.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] }),
  })

  const close = useMutation({
    mutationFn: (id: string) => convocatoriaWorkerService.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] }),
  })

  const activeCount = convocatorias.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Convocatorias_Laborales</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{activeCount}</span> activas · {convocatorias.length} total
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] })}
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Empresa', 'Modalidad', 'Contrato', 'Créditos', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : convocatorias.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin convocatorias</td></tr>
              ) : convocatorias.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0] max-w-[200px] truncate">{c.title}</p>
                    <p className="font-mono text-[10px] text-[#3c4b35]">{c.location}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.companyId.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">{c.modality}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">{c.contractType}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{c.creditCost}</td>
                  <td className="px-5 py-4">
                    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[c.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setSelected(c)}
                        className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
                        title="Ver detalle"
                      >
                        <Eye size={12} className="inline" />
                      </button>
                      {c.status === 'DRAFT' && (
                        <button
                          onClick={() => publish.mutate(c.id)}
                          disabled={publish.isPending}
                          className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-50"
                        >
                          <Send className="mr-1 inline" size={11} />
                          Publicar
                        </button>
                      )}
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => close.mutate(c.id)}
                          disabled={close.isPending}
                          className="border border-[#ffb4ab]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50"
                        >
                          <X className="mr-1 inline" size={11} />
                          Cerrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <DetailDrawer conv={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

type Convocatoria = {
  id: string; title: string; description: string; companyId: string
  location: string; modality: string; contractType: string
  creditCost: number; status: string; createdAt: string; updatedAt: string
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'BORRADOR', ACTIVE: 'ACTIVA', CLOSED: 'CERRADA', CANCELLED: 'CANCELADA',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'border-[#baccaf] text-[#baccaf]',
  ACTIVE: 'border-[#42ff00] text-[#42ff00]',
  CLOSED: 'border-[#3c4b35] text-[#3c4b35]',
  CANCELLED: 'border-[#ffb4ab] text-[#ffb4ab]',
}

const FILTERS = [
  { key: '', label: 'TODAS' },
  { key: 'DRAFT', label: 'BORRADOR' },
  { key: 'ACTIVE', label: 'ACTIVA' },
  { key: 'CLOSED', label: 'CERRADA' },
  { key: 'CANCELLED', label: 'CANCELADA' },
]

export default function WorkerConvocatoriasPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')

  const { data: convocatorias = [], isLoading } = useQuery<Convocatoria[]>({
    queryKey: ['convocatorias-worker', filter],
    queryFn: () => convocatoriaWorkerService.list().then(r => {
      const list = r.data as Convocatoria[]
      return filter ? list.filter(c => c.status === filter) : list
    }),
  })

  const publish = useMutation({
    mutationFn: (id: string) => convocatoriaWorkerService.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] }),
  })

  const close = useMutation({
    mutationFn: (id: string) => convocatoriaWorkerService.close(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] }),
  })

  const activeCount = convocatorias.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Convocatorias_Laborales</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{activeCount}</span> activas · {convocatorias.length} total
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['convocatorias-worker'] })}
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
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Empresa', 'Modalidad', 'Contrato', 'Créditos', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : convocatorias.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin convocatorias</td></tr>
              ) : convocatorias.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0] max-w-[200px] truncate">{c.title}</p>
                    <p className="font-mono text-[10px] text-[#3c4b35]">{c.location}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.companyId.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">{c.modality}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">{c.contractType}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{c.creditCost}</td>
                  <td className="px-5 py-4">
                    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[c.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      {c.status === 'DRAFT' && (
                        <button
                          onClick={() => publish.mutate(c.id)}
                          disabled={publish.isPending}
                          className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-50"
                        >
                          <Send className="mr-1 inline" size={11} />
                          Publicar
                        </button>
                      )}
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => close.mutate(c.id)}
                          disabled={close.isPending}
                          className="border border-[#ffb4ab]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50"
                        >
                          <X className="mr-1 inline" size={11} />
                          Cerrar
                        </button>
                      )}
                    </div>
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
