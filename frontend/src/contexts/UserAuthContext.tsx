import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '@/lib/services/user/auth.service'
import userAxios from '@/lib/axios/user.axios'

interface UserAuthContextType {
  token: string | null
  userId: string | null
  credits: number
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshCredits: () => Promise<void>
  isAuthenticated: boolean
}

const UserAuthContext = createContext<UserAuthContextType | null>(null)

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('user_token'))
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('user_id'))
  const [credits, setCredits] = useState<number>(() =>
    Number(localStorage.getItem('user_credits') ?? 0)
  )

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authService.login({ email, password })
    localStorage.setItem('user_token', data.token)
    localStorage.setItem('user_id', data.id)
    localStorage.setItem('user_credits', String(data.credits))
    setToken(data.token)
    setUserId(data.id)
    setCredits(data.credits)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_credits')
    setToken(null)
    setUserId(null)
    setCredits(0)
  }, [])

  const refreshCredits = useCallback(async () => {
    try {
      const { data } = await userAxios.get<{ credits: number }>('/users/balance')
      const newCredits = data.credits ?? 0
      localStorage.setItem('user_credits', String(newCredits))
      setCredits(newCredits)
    } catch {
      // silently ignore — stale value stays
    }
  }, [])

  return (
    <UserAuthContext.Provider
      value={{ token, userId, credits, login, logout, refreshCredits, isAuthenticated: !!token }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider')
  return ctx
}
