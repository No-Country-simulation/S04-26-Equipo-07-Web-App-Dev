import userAxios from '@/lib/axios/user.axios'

export const paymentService = {
  createPaymentIntent: (amount: number) =>
    userAxios.post('/users/payments/create', { amount }),

  getHistory: () => userAxios.get('/users/payments'),

  getBalance: () => userAxios.get('/users/balance'),
}
