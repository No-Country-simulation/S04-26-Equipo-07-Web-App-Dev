import workerAxios from '@/lib/axios/worker.axios'
import { apiClient } from '../client'
import { API } from '../config'
import type { InvitationData } from './invitations.mock'

export async function validateToken(token: string): Promise<InvitationData> {
  try {
    const { data } = await apiClient.get(API.invitations.validate(token))
    return {
      valid: true,
      prefilled: { email: data.email },
    }
  } catch (err: any) {
    if (err.response?.data?.error) {
      return { valid: false, message: err.response.data.error }
    }
    throw err
  }
}

export async function createInvitation(email: string): Promise<{ link: string }> {
  const { data } = await workerAxios.post(API.invitations.create, { email })
  return data
}
