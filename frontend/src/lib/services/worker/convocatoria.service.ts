import workerAxios from '@/lib/axios/worker.axios'

export const convocatoriaWorkerService = {
  list: () => workerAxios.get('/convocatorias'),
  publish: (id: string) => workerAxios.put(`/convocatorias/${id}/publish`),
  close: (id: string) => workerAxios.put(`/convocatorias/${id}/close`),
}
