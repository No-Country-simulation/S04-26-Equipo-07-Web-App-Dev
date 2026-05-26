import workerAxios from '@/lib/axios/worker.axios'

export const roleService = {
  list: () => workerAxios.get('/worker/roles'),
  get: (id: string) => workerAxios.get(`/worker/roles/${id}`),
  create: (data: object) => workerAxios.post('/worker/roles', data),
  update: (id: string, data: object) => workerAxios.put(`/worker/roles/${id}`, data),
  delete: (id: string) => workerAxios.delete(`/worker/roles/${id}`),
}
