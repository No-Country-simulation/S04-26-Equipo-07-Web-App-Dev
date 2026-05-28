import workerAxios from '@/lib/axios/worker.axios'

export const workerPaymentService = {
  list: () => workerAxios.get('/worker/payments'),
}
