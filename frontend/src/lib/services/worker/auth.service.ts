import workerAxios from '@/lib/axios/worker.axios'

export const workerAuthService = {
  login: (data: { email: string; password: string }) =>
    workerAxios.post('/worker/auth/login', data),
}
