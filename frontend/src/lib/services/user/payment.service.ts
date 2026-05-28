import userAxios from '@/lib/axios/user.axios'

export const paymentService = {
  createPaymentIntent: (amount: number) =>
    userAxios.post<{ clientSecret: string; paymentId: string }>('/users/payments/create', { amount }),

  // crea sesion de checkout de stripe y retorna la url de redireccion
  createCheckoutSession: (amount: number) =>
    userAxios.post<{ url: string; paymentId: string }>('/users/payments/checkout', { amount }),

  // verifica el pago con stripe y acredita al usuario (fallback para dev sin webhook listener)
  verifyPayment: (paymentId: string) =>
    userAxios.post<{ status: string; credits: number; alreadyProcessed: boolean }>(
      `/users/payments/${paymentId}/verify`
    ),

  getHistory: () => userAxios.get('/users/payments'),

  getBalance: () => userAxios.get('/users/balance'),
}
