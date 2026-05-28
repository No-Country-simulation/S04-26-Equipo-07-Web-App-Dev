import axios from 'axios'
import { API } from './config'

export const apiClient = axios.create({
  baseURL: API.baseURL,
  timeout: 10_000,
})


// Interceptor que inyecta el token si existe
// para onboarding submit

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('invitation_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})