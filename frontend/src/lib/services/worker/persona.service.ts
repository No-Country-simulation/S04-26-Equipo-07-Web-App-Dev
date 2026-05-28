import workerAxios from '@/lib/axios/worker.axios'

export const personaService = {
  list: () => workerAxios.get('/worker/persons'),
  get: (id: string) => workerAxios.get(`/worker/persons/${id}`),
}
