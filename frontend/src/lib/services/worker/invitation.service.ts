import workerAxios from '@/lib/axios/worker.axios'

export const invitationService = {
  send: (email: string) =>
    workerAxios.post('/worker/invitations', { email }),

  list: () =>
    workerAxios.get('/worker/invitations'),

  cancel: (id: string) =>
    workerAxios.delete(`/worker/invitations/${id}`),

  resend: (id: string) =>
    workerAxios.post(`/worker/invitations/${id}/resend`),

  validate: (token: string) =>
    workerAxios.get(`/auth/invitation/validate?token=${encodeURIComponent(token)}`),
}
