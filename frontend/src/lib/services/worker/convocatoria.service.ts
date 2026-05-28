import workerAxios from '@/lib/axios/worker.axios'

export const convocatoriaWorkerService = {
  list: () => workerAxios.get('/convocatorias'),
  get: (id: string) => workerAxios.get(`/convocatorias/${id}`),
  publish: (id: string) => workerAxios.put(`/convocatorias/${id}/publish`),
  close: (id: string) => workerAxios.put(`/convocatorias/${id}/close`),
  getApplications: (id: string) => workerAxios.get(`/convocatorias/${id}/applications`),
  getLogs: () => workerAxios.get('/logs/users'),
}
