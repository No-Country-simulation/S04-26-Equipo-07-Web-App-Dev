import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

// crea y configura un cliente stomp conectado via sockjs
export function createSocketClient(onConnect?: () => void): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
    reconnectDelay: 5000,
    onConnect,
  })
  return client
}
