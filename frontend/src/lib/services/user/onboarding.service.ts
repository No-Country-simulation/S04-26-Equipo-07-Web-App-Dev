import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

// cliente sin auth — el token de invitacion actua como mecanismo de seguridad
const publicApi = axios.create({ baseURL: BASE })

export const onboardingService = {
  /**
   * Sube un documento al backend (que lo guarda en Cloudinary).
   * Usa el token de invitacion como autenticacion publica.
   */
  uploadDocument: async (
    invitationToken: string,
    documentType: string,
    file: File,
  ): Promise<{ url: string; documentType: string }> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await publicApi.post(
      `/auth/upload-document?token=${encodeURIComponent(invitationToken)}&documentType=${encodeURIComponent(documentType)}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  /**
   * Valida el token de invitacion y retorna el email asociado.
   */
  validateInvitation: async (token: string): Promise<{ valid: boolean; email: string }> => {
    const { data } = await publicApi.get(
      `/auth/invitation/validate?token=${encodeURIComponent(token)}`,
    )
    return data
  },

  /**
   * Registra al usuario con toda la informacion del onboarding.
   */
  register: async (payload: object): Promise<unknown> => {
    const { data } = await publicApi.post('/auth/register', payload)
    return data
  },
}
