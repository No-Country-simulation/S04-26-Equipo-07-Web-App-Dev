import { USE_MOCK } from '../config'
import type { InvitationData } from './invitations.mock'

export type { InvitationData }

async function getModule() {
  if (USE_MOCK) {
    return import('./invitations.mock')
  }
  return import('./invitations.api')
}

export async function validateToken(token: string): Promise<InvitationData> {
  const mod = await getModule()
  return mod.validateToken(token)
}

export async function createInvitation(email: string): Promise<{ link: string }> {
  const mod = await getModule()
  return mod.createInvitation(email)
}
