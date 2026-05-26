export const USE_MOCK = true

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const API = {
  baseURL: BASE_URL,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  contractors: {
    list: '/contractors',
    detail: (id: number) => `/contractors/${id}`,
    status: (id: number) => `/contractors/${id}/status`,
  },
  onboarding: {
    submit: '/onboarding',
    upload: '/onboarding/upload',
  },
  invitations: {
    validate: (token: string) => `/invitations/${token}`,
    create: '/invitations',
  },
  users: '/users',
}
