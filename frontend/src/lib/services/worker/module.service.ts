import workerAxios from '@/lib/axios/worker.axios'

export const moduleService = {
  list: (group?: string) =>
    workerAxios.get('/worker/modules', { params: group ? { group } : {} }),
}
