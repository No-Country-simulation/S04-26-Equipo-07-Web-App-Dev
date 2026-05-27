import userAxios from '@/lib/axios/user.axios'
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export const convocatoriaService = {
  list: () => userAxios.get('/convocatorias'),
  listMine: () => userAxios.get('/convocatorias/my'),
  get: (id: string) => userAxios.get(`/convocatorias/${id}`),
  create: (data: object) => userAxios.post('/convocatorias', data),
  update: (id: string, data: object) => userAxios.put(`/convocatorias/${id}`, data),
  close: (id: string) => userAxios.put(`/convocatorias/${id}/close`),
  publish: (id: string) => userAxios.put(`/convocatorias/${id}/publish`),
  finalize: (id: string) =>
    userAxios.put<{ status: string; creditsReturned: number; newBalance: number }>(
      `/convocatorias/${id}/finalize`
    ),
  getApplications: (id: string) => userAxios.get(`/convocatorias/${id}/applications`),
  costEstimate: (startDate: string, endDate: string) =>
    userAxios.get<{ cost: number; days: number }>('/convocatorias/cost-estimate', {
      params: { startDate, endDate },
    }),
  // public — no token needed
  incrementView: (id: string) =>
    axios.post(`${BASE}/convocatorias/${id}/view`),
  apply: (id: string, formData: FormData) =>
    axios.post(`${BASE}/convocatorias/${id}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}
