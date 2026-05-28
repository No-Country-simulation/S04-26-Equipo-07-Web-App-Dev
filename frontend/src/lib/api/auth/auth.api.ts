import { apiClient } from '../client'
import { API } from '../config'

export async function login(email: string, password: string) {
  const { data } = await apiClient.post(API.auth.login, { email, password })
  localStorage.setItem('auth', data.token)
  return data
}

export async function register(data: { name: string; email: string; password: string }) {
  const response = await apiClient.post(API.auth.register, data)
  return response.data
}

export async function logout() {
  localStorage.removeItem('auth')
}
