import workerAxios from '@/lib/axios/worker.axios'

export const invitationService = {
  send: (email: string) =>
    workerAxios.post('/worker/invitations', { email }),

  validate: (token: string) =>
    workerAxios.get(`/api/auth/invitation/validate?token=${token}`),
}
