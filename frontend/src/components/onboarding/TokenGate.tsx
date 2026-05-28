import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { validateToken } from '@/lib/api/invitations'
import type { InvitationData } from '@/lib/api/invitations'
import OnboardingPage from '@/pages/onboarding/Onboarding'
import { OnboardingProvider } from '@/modules/onboarding/hooks/useOnboarding'
import type { OnboardingData } from '@/types/onboarding'

type TokenState = 'loading' | 'valid' | 'invalid'

export default function TokenGate() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<TokenState>('loading')
  const [prefilled, setPrefilled] = useState<Partial<OnboardingData> | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setState('invalid')
      setErrorMsg('No se encontró un token de acceso.')
      return
    }
    validateToken(token)
      .then((result: InvitationData) => {
        if (result.valid) {
          sessionStorage.setItem('invitation_token', token)
          setPrefilled(result.prefilled ? { personalInfo: result.prefilled as any } : null)
          setState('valid')
        } else {
          setState('invalid')
          setErrorMsg(result.message || 'Enlace inválido o expirado.')
        }
      })
      .catch(() => {
        setState('invalid')
        setErrorMsg('Error al validar el enlace. Intenta de nuevo.')
      })
  }, [token])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-full max-w-lg px-8 space-y-6">
          <Skeleton className="h-8 w-48 bg-[#3c4b35]" />
          <Skeleton className="h-4 w-64 bg-[#3c4b35]" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-12 w-full bg-[#3c4b35]" />
            <Skeleton className="h-12 w-full bg-[#3c4b35]" />
            <Skeleton className="h-12 w-3/4 bg-[#3c4b35]" />
          </div>
        </div>
      </div>
    )
  }

  if (state === 'invalid') {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md border border-[#ffb4ab]/50 bg-[#ffb4ab]/5 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[#ffb4ab] flex items-center justify-center">
            <span className="text-[#ffb4ab] text-2xl font-bold">!</span>
          </div>
          <h1 className="font-display text-heading-lg text-[#f0ffe4] mb-4">
            Enlace no válido
          </h1>
          <p className="font-body text-body text-on-surface-variant mb-8">
            {errorMsg}
          </p>
          <p className="font-caption-mono text-caption-mono text-on-surface-variant">
            Contacta con la empresa para recibir un nuevo enlace de onboarding.
          </p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingProvider prefilledData={prefilled ?? undefined}>
      <OnboardingPage inner />
    </OnboardingProvider>
  )
}
