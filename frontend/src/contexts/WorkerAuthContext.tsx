import { createContext, useContext, useState, useCallback,  } from 'react'
import { workerAuthService } from '@/lib/services/worker/auth.service'

interface WorkerAuthContextType {
  token: string | null
  workerId: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const WorkerAuthContext = createContext<WorkerAuthContextType | null>(null)

export function WorkerAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('worker_token'))
  const [workerId, setWorkerId] = useState<string | null>(() => localStorage.getItem('worker_id'))

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await workerAuthService.login({ email, password })
    localStorage.setItem('worker_token', data.token)
    localStorage.setItem('worker_id', data.id)
    setToken(data.token)
    setWorkerId(data.id)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('worker_token')
    localStorage.removeItem('worker_id')
    setToken(null)
    setWorkerId(null)
  }, [])

  return (
    <WorkerAuthContext.Provider
      value={{ token, workerId, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </WorkerAuthContext.Provider>
  )
}

export function useWorkerAuth() {
  const ctx = useContext(WorkerAuthContext)
  if (!ctx) throw new Error('useWorkerAuth must be used within WorkerAuthProvider')
  return ctx
}
