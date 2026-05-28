import workerAxios from '@/lib/axios/worker.axios'

export const requestService = {
  list: (status?: string) =>
    workerAxios.get('/worker/requests', { params: status ? { status } : {} }),

  get: (id: string) => workerAxios.get(`/worker/requests/${id}`),

  assign: (id: string) =>
    workerAxios.put(`/worker/requests/${id}/assign`),

  reviewDocument: (id: string, key: string, data: object) =>
    workerAxios.put(`/worker/requests/${id}/documents/${key}/review`, data),

  updateStatus: (id: string, data: object) =>
    workerAxios.put(`/worker/requests/${id}/status`, data),

  deleteRejected: (id: string) =>
    workerAxios.delete(`/worker/requests/${id}`),
}
