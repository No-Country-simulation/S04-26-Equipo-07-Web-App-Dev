import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { personaService } from '@/lib/services/worker/persona.service'
import { Search } from 'lucide-react'

type Persona = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: string
  credits: number
  companyIds: string[]
  createdAt: string
  address?: { country: string; city: string }
}

function statusColor(status: string) {
  if (status === 'active') return 'text-[#42ff00]'
  if (status === 'pending' || status === 'pending_password') return 'text-[#ffe066]'
  return 'text-[#ffb4ab]'
}

function statusDot(status: string) {
  if (status === 'active') return 'bg-[#42ff00]'
  if (status === 'pending' || status === 'pending_password') return 'bg-[#ffe066]'
  return 'bg-[#ffb4ab]'
}

function InitialsAvatar({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#3c4b35] bg-[#232d1e] font-mono text-[11px] text-[#42ff00]">
      {initials.toUpperCase()}
    </div>
  )
}

export default function PersonasPage() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const { data: personas = [], isLoading } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => personaService.list().then(r => r.data),
  })

  const filtered = personas.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
    const matchSearch = !search || fullName.includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="p-8">
      {/* header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Personas_Registradas</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{personas.filter(p => p.status === 'active').length}</span> activos ·{' '}
            {personas.length} total
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4b35]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-56 border border-[#3c4b35] bg-[#182214] py-2 pl-8 pr-3 font-mono text-[11px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
          </div>
          {/* status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[11px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="pending_password">Pend. contraseña</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
      </header>

      {/* table */}
      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Persona', 'Email', 'Teléfono', 'País', 'Estado', 'Créditos', 'Empresas', 'Registrado'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">
                    Cargando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">
                    {search || filterStatus !== 'all' ? 'Sin resultados para este filtro' : 'Sin personas registradas'}
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={`${p.firstName} ${p.lastName}`} />
                        <div>
                          <p className="font-mono text-[12px] font-bold text-[#dae6d0]">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="font-mono text-[10px] text-[#3c4b35]">ID: {p.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{p.email}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{p.phone ?? '—'}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{p.address?.country ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${statusColor(p.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusDot(p.status)}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-[12px] font-bold text-[#42ff00]">
                        {p.credits.toFixed(2)}
                      </span>
                      <span className="ml-1 font-mono text-[9px] text-[#3c4b35]">USD</span>
                    </td>
                    <td className="px-5 py-4 text-center font-mono text-[12px] text-[#dae6d0]">
                      {p.companyIds?.length ?? 0}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* footer stats */}
      {!isLoading && personas.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
            Mostrando {filtered.length} de {personas.length} registros
          </p>
          <p className="font-mono text-[10px] text-[#3c4b35]">
            Créditos totales:{' '}
            <span className="text-[#42ff00]">
              {personas.reduce((acc, p) => acc + p.credits, 0).toFixed(2)} USD
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
