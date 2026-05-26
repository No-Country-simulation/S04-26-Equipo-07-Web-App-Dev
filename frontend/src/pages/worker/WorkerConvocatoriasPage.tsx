import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { convocatoriaWorkerService } from '@/lib/services/worker/convocatoria.service'
import { RefreshCw, Send, X } from 'lucide-react'

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
