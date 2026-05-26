import workerAxios from '@/lib/axios/worker.axios'

export const logService = {
  userLogs: (params?: { userId?: string; page?: number; size?: number }) =>
    workerAxios.get('/worker/logs/users', { params }),
  workerLogs: (params?: { workerId?: string; page?: number; size?: number }) =>
    workerAxios.get('/worker/logs/workers', { params }),
}
