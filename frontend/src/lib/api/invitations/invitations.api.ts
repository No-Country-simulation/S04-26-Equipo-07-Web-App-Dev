import { apiClient } from '../client'
import { API } from '../config'
import type { InvitationData } from './invitations.mock'

export async function validateToken(token: string): Promise<InvitationData> {
  const { data } = await apiClient.get(API.invitations.validate(token))
  return data
}

export async function createInvitation(email: string): Promise<{ link: string }> {
  const { data } = await apiClient.post(API.invitations.create, { email })
  return data
}
