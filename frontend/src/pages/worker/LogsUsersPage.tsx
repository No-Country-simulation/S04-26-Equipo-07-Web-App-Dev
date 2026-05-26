import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { logService } from '@/lib/services/worker/log.service'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

type UserLog = {
  id: string; userId: string; action: string; details: string
  ipAddress: string; timestamp: string
}
type Page<T> = { content: T[]; totalPages: number; totalElements: number }

export default function LogsUsersPage() {
  const [userIdFilter, setUserIdFilter] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 20

  const { data, isLoading } = useQuery<Page<UserLog>>({
    queryKey: ['logs-users', userIdFilter, page],
    queryFn: () =>
      logService.userLogs({ userId: userIdFilter || undefined, page, size: PAGE_SIZE })
        .then(r => r.data),
  })

  const logs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  const handleSearch = () => {
    setPage(0)
    setUserIdFilter(inputValue.trim())
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-[28px] font-bold text-[#f0ffe4]">Logs_Usuarios</h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
          Auditoría de actividad de usuarios — <span className="text-[#dae6d0]">{totalElements}</span> registros
        </p>
      </header>

      {/* search */}
      <div className="mb-6 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3c4b35]" />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Filtrar por User ID..."
            className="w-full border border-[#3c4b35] bg-[#182214] py-2 pl-9 pr-3 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
        >
          Buscar
        </button>
        {userIdFilter && (
          <button
            onClick={() => { setInputValue(''); setUserIdFilter(''); setPage(0) }}
            className="border border-[#3c4b35] px-3 py-2 font-mono text-[10px] uppercase text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Timestamp', 'Usuario ID', 'Acción', 'Detalles', 'IP'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin registros</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-3 font-mono text-[10px] text-[#baccaf] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[#dae6d0]">
                    {log.userId.slice(-12)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="border border-[#42ff00]/30 bg-[#42ff00]/5 px-2 py-0.5 font-mono text-[10px] uppercase text-[#42ff00]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[#baccaf] max-w-xs truncate">
                    {log.details || '—'}
                  </td>
                  <td className="px-5 py-3 font-mono text-[10px] text-[#baccaf]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-[#3c4b35] pt-4">
          <span className="font-mono text-[10px] text-[#baccaf] uppercase tracking-wider">
            Página <span className="text-[#dae6d0]">{page + 1}</span> / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 border border-[#3c4b35] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] disabled:opacity-40"
            >
              <ChevronLeft size={12} /> Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 border border-[#3c4b35] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] disabled:opacity-40"
            >
              Siguiente <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
