import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { requestService } from '@/lib/services/worker/request.service'
import { createSocketClient } from '@/lib/websocket/socket'
import { Client } from '@stomp/stompjs'

export default function WorkerDashboard() {
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  const { data: requests = [] } = useQuery({
    queryKey: ['requests', 'PENDING'],
    queryFn: () => requestService.list('PENDING').then(r => r.data),
    onSuccess: (data: unknown[]) => setPendingCount(data.length),
  } as Parameters<typeof useQuery>[0])

  // escucha actualizaciones en tiempo real via websocket
  useEffect(() => {
    let client: Client
    const setup = async () => {
      client = createSocketClient(() => {
        client.subscribe('/topic/worker/requests', (msg) => {
          const payload = JSON.parse(msg.body)
          if (payload.pendingCount !== undefined) setPendingCount(payload.pendingCount)
        })
      })
      client.activate()
    }
    setup()
    return () => { client?.deactivate() }
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Solicitudes pendientes</p>
          <p className="text-3xl font-bold mt-1">{pendingCount ?? requests.length}</p>
        </div>
      </div>
    </div>
  )
}
