export const USE_MOCK = false

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const API = {
  baseURL: BASE_URL,
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  contractors: {
    list: '/contractors',
    detail: (id: string | number) => `/contractors/${id}`,
    status: (id: string | number) => `/contractors/${id}/status`,
  },
  onboarding: {
    submit: '/onboarding',
    upload: '/onboarding/upload',
  },
  invitations: {
    validate: (token: string) => `/auth/invitation/validate?token=${token}`,
    create: '/worker/invitations',
  },
  users: '/users',
}
