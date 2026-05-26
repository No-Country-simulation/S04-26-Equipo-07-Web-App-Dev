import workerAxios from '@/lib/axios/worker.axios'

export const workerService = {
  list: () => workerAxios.get('/worker/workers'),
  get: (id: string) => workerAxios.get(`/worker/workers/${id}`),
  create: (data: object) => workerAxios.post('/worker/workers', data),
  assignRoles: (id: string, roleIds: string[]) =>
    workerAxios.put(`/worker/workers/${id}/roles`, { roleIds }),
  deactivate: (id: string) => workerAxios.delete(`/worker/workers/${id}`),
}
