import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '@/lib/services/worker/request.service'
import { createSocketClient } from '@/lib/websocket/socket'
import { Client } from '@stomp/stompjs'
import { Button } from '@/components/ui/button'

export default function SolicitudesPage() {
  const qc = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: () => requestService.list().then(r => r.data),
  })

  const assign = useMutation({
    mutationFn: (id: string) => requestService.assign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  const approve = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      requestService.updateStatus(id, { status: 'APPROVED', notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  const reject = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      requestService.updateStatus(id, { status: 'REJECTED', notes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  // recibe actualizaciones en tiempo real
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Solicitudes</h1>
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r: {
            id: string; userId: string; status: string; assignedWorkerId?: string
          }) => (
            <div key={r.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Solicitud #{r.id.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">Usuario: {r.userId}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  r.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  r.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  r.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {r.status}
                </span>
              </div>

              {r.status === 'PENDING' && !r.assignedWorkerId && (
                <Button size="sm" onClick={() => assign.mutate(r.id)} disabled={assign.isPending}>
                  Tomar solicitud
                </Button>
              )}

              {r.status === 'IN_REVIEW' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => approve.mutate({ id: r.id, notes: 'documentos verificados' })}
                    disabled={approve.isPending}
                  >
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => reject.mutate({ id: r.id, notes: 'documentos no validos' })}
                    disabled={reject.isPending}
                  >
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin solicitudes</p>
          )}
        </div>
      )}
    </div>
  )
}
