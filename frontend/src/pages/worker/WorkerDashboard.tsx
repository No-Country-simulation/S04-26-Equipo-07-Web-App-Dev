import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestService } from '@/lib/services/worker/request.service'
import { workerService } from '@/lib/services/worker/worker.service'
import { roleService } from '@/lib/services/worker/role.service'
import { logService } from '@/lib/services/worker/log.service'
import { createSocketClient } from '@/lib/websocket/socket'
import { Client } from '@stomp/stompjs'
import { TrendingUp, ShieldCheck, Users, ClipboardList, RefreshCw } from 'lucide-react'

type WorkerLog = {
  id: string; workerId: string; action: string
  details: string; ipAddress: string; timestamp: string
}

// maps action keywords to display colors for the terminal-style log
function actionColor(action: string): string {
  const a = action.toUpperCase()
  if (a.includes('LOGIN') || a.includes('AUTH') || a.includes('SESSION')) return 'text-[#42ff00]'
  if (a.includes('ERROR') || a.includes('FAIL') || a.includes('DENY') || a.includes('REJECT')) return 'text-[#ffb4ab]'
  if (a.includes('APPROVE') || a.includes('APROV')) return 'text-[#42ff00]'
  return 'text-[#baccaf]'
}

function LiveLogs() {
  const { data, isLoading } = useQuery<{ content: WorkerLog[] }>({
    queryKey: ['dashboard-live-logs'],
    queryFn: () => logService.workerLogs({ page: 0, size: 15 }).then(r => r.data),
    // polls every 15 seconds to refresh log entries
    refetchInterval: 15_000,
  })

  const logs = data?.content ?? []
  const logsRef = useRef<HTMLDivElement>(null)

  // scroll to top whenever new entries arrive
  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = 0
  }, [logs.length])

  return (
    <div className="col-span-12 border border-[#3c4b35] bg-[#182214] p-6 lg:col-span-8">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#f0ffe4]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#42ff00]" />
          Registros_Sistema_En_Vivo
        </h4>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf] opacity-50">
          NODE: SA-EAST-1
        </span>
      </div>
      <div
        ref={logsRef}
        className="h-36 overflow-y-auto bg-black/40 p-3 font-mono text-[11px] leading-6 opacity-80 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35] [&::-webkit-scrollbar-track]:bg-[#141e10]"
      >
        {isLoading && (
          <p className="text-[#3c4b35]">Cargando registros...</p>
        )}
        {!isLoading && logs.length === 0 && (
          <p className="text-[#3c4b35]">Sin registros disponibles.</p>
        )}
        {logs.map(log => {
          const ts = new Date(log.timestamp).toLocaleTimeString('en-GB', { hour12: false })
          const color = actionColor(log.action)
          const shortId = log.workerId?.slice(-8) ?? 'SYSTEM'
          const detail = log.details ? ` — ${log.details}` : ''
          return (
            <p key={log.id}>
              <span className={color}>[{ts}]</span>{' '}
              <span className="text-[#dae6d0]">{log.action}</span>
              <span className="text-[#3c4b35]"> #{shortId}</span>
              {detail}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({
  label, value, sub, icon: Icon, accent = false,
}: {
  label: string; value: string | number; sub: string
  icon: React.ElementType; accent?: boolean
}) {
  return (
    <div
      className={`group relative col-span-12 overflow-hidden border bg-[#182214] p-6 transition-colors hover:border-[#42ff00] md:col-span-6 lg:col-span-3 ${
        accent ? 'border-[#42ff00]' : 'border-[#3c4b35]'
      }`}
      style={accent ? { boxShadow: '0 0 12px rgba(66,255,0,0.15)' } : undefined}
    >
      <div className="relative z-10">
        <p className={`mb-4 font-mono text-[10px] uppercase tracking-wider ${accent ? 'text-[#42ff00]' : 'text-[#baccaf]'}`}>
          {label}
        </p>
        <h3 className={`text-[42px] font-bold tracking-tighter ${accent ? 'text-[#42ff00]' : 'text-[#f0ffe4]'}`}>
          {typeof value === 'number' ? String(value).padStart(2, '0') : value}
        </h3>
        <div className={`mt-2 flex items-center gap-1 font-mono text-[10px] ${accent ? 'text-[#baccaf]' : 'text-[#42ff00]'}`}>
          <TrendingUp size={10} />
          <span>{sub}</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-[0.06] transition-opacity group-hover:opacity-[0.12]">
        <Icon size={128} />
      </div>
    </div>
  )
}

export default function WorkerDashboard() {
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const { data: pending = [] } = useQuery<unknown[]>({
    queryKey: ['requests', 'PENDING'],
    queryFn: () => requestService.list('PENDING').then(r => r.data),
  })

  const { data: workers = [] } = useQuery<unknown[]>({
    queryKey: ['workers'],
    queryFn: () => workerService.list().then(r => r.data),
  })

  const { data: roles = [] } = useQuery<unknown[]>({
    queryKey: ['roles'],
    queryFn: () => roleService.list().then(r => r.data),
  })

  const { data: all = [] } = useQuery<unknown[]>({
    queryKey: ['requests'],
    queryFn: () => requestService.list().then(r => r.data),
  })

  const pendingCountVal = pending.length

  // websocket para actualizaciones en tiempo real
  useEffect(() => {
    let client: Client
    const setup = async () => {
      client = createSocketClient(() => {
        client.subscribe('/topic/worker/requests', (msg) => {
          const payload = JSON.parse(msg.body)
          if (payload.pendingCount !== undefined) {
            setPendingCount(payload.pendingCount)
            setLastUpdate(new Date().toLocaleTimeString('es-AR'))
          }
        })
      })
      client.activate()
    }
    setup()
    return () => { client?.deactivate() }
  }, [])

  const approved = (all as { status: string }[]).filter(r => r.status === 'APPROVED').length
  const inReview = (all as { status: string }[]).filter(r => r.status === 'IN_REVIEW').length

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4] md:text-[32px]">Dashboard_Operacional</h2>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-[#baccaf]">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              ESTADO_SISTEMA: <span className="text-[#42ff00]">ÓPTIMO</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-[#3c4b35]" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              WEBSOCKET: <span className="text-[#42ff00]">CONECTADO</span>
            </span>
            {lastUpdate && (
              <>
                <span className="h-1 w-1 rounded-full bg-[#3c4b35]" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">
                  ULT_ACT: {lastUpdate}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 border border-[#3c4b35] bg-[#232d1e] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#dae6d0] transition-all hover:border-[#42ff00]"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </header>

      <section className="mb-10 grid grid-cols-12 gap-6">
        <StatCard
          label="Aprobaciones Pendientes"
          value={pendingCount ?? pendingCountVal}
          sub="Requieren acción inmediata"
          icon={ShieldCheck}
          accent
        />
        <StatCard
          label="En Revisión"
          value={inReview}
          sub="Asignadas a trabajadores"
          icon={ClipboardList}
        />
        <StatCard
          label="Aprobadas Total"
          value={approved}
          sub="Onboardings completados"
          icon={TrendingUp}
        />
        <StatCard
          label="Trabajadores Activos"
          value={workers.length}
          sub={`${roles.length} roles configurados`}
          icon={Users}
        />
      </section>

      <div className="grid grid-cols-12 gap-6">
        <LiveLogs />
        <div className="col-span-12 flex flex-col items-center justify-center border border-[#3c4b35] bg-[#182214] p-6 text-center lg:col-span-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            Distribución Solicitudes
          </p>
          <div className="relative mx-auto mb-4 h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="#3c4b35" strokeWidth="6" />
              <circle
                cx="48" cy="48" r="40"
                fill="transparent" stroke="#42ff00"
                strokeWidth="6"
                strokeDasharray={251.2}
                strokeDashoffset={all.length > 0 ? 251.2 - (approved / all.length) * 251.2 : 251.2}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-[#42ff00]">
              {all.length > 0 ? Math.round((approved / all.length) * 100) : 0}%
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            TASA_APROBACIÓN
          </p>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #141e10; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4b35; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #42ff00; }
      `}</style>
    </div>
  )
}
