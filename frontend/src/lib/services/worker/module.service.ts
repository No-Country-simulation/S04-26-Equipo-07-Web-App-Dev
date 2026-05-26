import workerAxios from '@/lib/axios/worker.axios'

export const moduleService = {
  list: (group?: string) =>
    workerAxios.get('/worker/modules', { params: group ? { group } : {} }),
  create: (data: object) =>
    workerAxios.post('/worker/modules', data),
  update: (id: string, data: object) =>
    workerAxios.put(`/worker/modules/${id}`, data),
  delete: (id: string) =>
    workerAxios.delete(`/worker/modules/${id}`),
}
