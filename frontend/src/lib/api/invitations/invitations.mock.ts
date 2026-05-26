import type { PersonalInfo } from '@/types/onboarding'

export type InvitationData = {
  valid: boolean
  prefilled?: Partial<PersonalInfo>
  message?: string
}

export async function validateToken(token: string): Promise<InvitationData> {
  await new Promise((r) => setTimeout(r, 1200))
  if (!token || token.length < 5) {
    return { valid: false, message: 'Enlace inválido o expirado.' }
  }
  return {
    valid: true,
    prefilled: {
      fullName: '',
      email: '',
      phone: '',
      country: 'México',
    },
  }
}

export async function createInvitation(_email: string): Promise<{ link: string }> {
  await new Promise((r) => setTimeout(r, 600))
  const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  return { link: `${window.location.origin}/onboarding/${token}` }
}
