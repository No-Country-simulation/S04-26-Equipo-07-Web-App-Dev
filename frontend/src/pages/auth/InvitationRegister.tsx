import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { OnboardingProvider, useOnboarding } from '@/modules/onboarding/hooks/useOnboarding'
import PersonalInfoStep from '../onboarding/steps/PersonalInfoStep'
import DocumentsStep from '../onboarding/steps/DocumentsStep'
import ContractStep from '../onboarding/steps/ContractStep'
import PaymentStep from '../onboarding/steps/PaymentStep'
import ReviewStep from '../onboarding/steps/ReviewStep'
import { ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react'
import { personalInfoSchema, contractSchema, paymentSchema } from '@/stores/onboardingSchemas'
import { onboardingService } from '@/lib/services/user/onboarding.service'

const steps = [
  { id: 0, label: 'Personal', description: 'Información personal' },
  { id: 1, label: 'Documentos', description: 'Identificación y RFC' },
  { id: 2, label: 'Contrato', description: 'Firma digital' },
  { id: 3, label: 'Pago', description: 'Método de cobro' },
  { id: 4, label: 'Revisión', description: 'Confirmar datos' },
]

const stepComponents = [PersonalInfoStep, DocumentsStep, ContractStep, PaymentStep, ReviewStep]

function InvitationRegisterContent({ invitationToken }: { invitationToken: string }) {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, data, setInvitationToken, resetOnboarding } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setInvitationToken(invitationToken)
  }, [invitationToken, setInvitationToken])

  const { personalInfo, documents, contract, payment } = data
  const allDocsUploaded = documents.every((d) => d.uploaded)

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return personalInfoSchema.safeParse(personalInfo).success
      case 1: return allDocsUploaded
      case 2: return contractSchema.safeParse(contract).success
      case 3: return paymentSchema.safeParse(payment).success
      case 4: return true
      default: return false
    }
  }

  const canGoNext = isStepValid()
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // construye el payload de registro completo
      const [firstName, ...rest] = personalInfo.fullName.trim().split(' ')
      const lastName = rest.join(' ') || firstName

      // convierte documentUrls a un mapa {docId: url}
      const documentUrls: Record<string, string> = {}
      for (const doc of documents) {
        if (doc.url) documentUrls[doc.id] = doc.url
      }

      await onboardingService.register({
        invitationToken,
        firstName,
        lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        birthDate: personalInfo.dateOfBirth,
        document: {
          type: 'ID',
          number: '',
        },
        address: {
          country: personalInfo.country,
          city: personalInfo.city,
          street: personalInfo.address,
        },
        documentUrls,
        contractSignature: contract.signature,
        contractSignedAt: contract.signedAt,
        paymentInfo: {
          bankName: payment.bankName,
          accountType: payment.accountType,
          accountNumber: payment.accountNumber,
          routingNumber: payment.routingNumber,
          currency: payment.currency,
        },
      })

      resetOnboarding()
      navigate('/register/success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrarse, intenta de nuevo.'
      setSubmitError(message)
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 0) return
    setCurrentStep(currentStep - 1)
  }

  const StepComponent = stepComponents[currentStep]

  return (
    <div className="min-h-screen bg-secondary">
      <header className="fixed top-0 w-full z-50 rounded-none h-18 bg-surface/80 backdrop-blur-md border-b border-color-border">
        <div className="max-w-300 mx-auto px-8 md:px-32 flex justify-between items-center h-full">
          <div className="font-display text-heading-sm tracking-tighter text-white">
            North<span className="gradient-text">Pay</span>
          </div>
          <span className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container">
            Registro · {currentStep + 1}/{steps.length}
          </span>
        </div>
      </header>

      <main className="pt-18 max-w-300 mx-auto px-8 md:px-32 py-16">
        {/* indicadores de paso */}
        <div className="mb-16">
          <div className="flex items-center justify-between relative">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1 relative">
                <div className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-caption-mono text-sm border transition-all duration-300 ${
                      i < currentStep
                        ? 'bg-primary-container text-black border-primary-container'
                        : i === currentStep
                          ? 'border-primary-container text-primary-container bg-primary-container/10'
                          : 'border-color-border text-on-surface-variant bg-color-surface'
                    }`}
                  >
                    {i < currentStep ? '✓' : String(step.id + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-3 text-center hidden md:block">
                    <span
                      className={`font-caption-mono text-caption-mono uppercase tracking-widest ${
                        i <= currentStep ? 'text-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 transition-colors duration-300 ${
                      i < currentStep ? 'bg-primary-container' : 'bg-color-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-color-border bg-surface p-8 md:p-12">
          <div className="mb-8 pb-6 border-b border-color-border">
            <h2 className="font-display text-heading-lg text-white">
              {steps[currentStep].label}
            </h2>
            <p className="font-body text-body text-on-surface-variant mt-2">
              {steps[currentStep].description}
            </p>
          </div>

          <StepComponent />

          {submitError && (
            <div className="flex items-start gap-3 border border-red-500/30 bg-red-500/10 p-4 mt-6">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="font-caption-mono text-caption-mono text-red-400 text-xs">{submitError}</p>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-8 border-t border-color-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 border border-color-border text-on-surface-variant hover:text-white hover:border-white transition-all font-caption-mono text-caption-mono uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext || submitting}
              className={`flex items-center gap-2 px-8 py-3 font-caption-mono text-caption-mono uppercase tracking-widest transition-all ${
                canGoNext && !submitting
                  ? 'bg-primary-container text-black hover:bg-primary-fixed'
                  : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Enviando...
                </>
              ) : isLastStep ? (
                <>
                  Finalizar
                  <ChevronRight size={14} />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// wrapper que valida el token antes de mostrar el wizard
export default function InvitationRegister() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token de invitación requerido. Usa el enlace que recibiste por correo.')
      setValidating(false)
      return
    }
    onboardingService.validateInvitation(token)
      .then(({ email: invEmail }) => {
        setEmail(invEmail)
        setValidating(false)
      })
      .catch(() => {
        setError('Invitación inválida o expirada. Contacta al administrador para solicitar una nueva.')
        setValidating(false)
      })
  }, [token])

  if (validating) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary-container" />
          <p className="font-caption-mono text-caption-mono uppercase tracking-widest text-on-surface-variant text-sm">
            Validando invitación...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-8">
        <div className="max-w-md w-full border border-red-500/30 bg-surface p-8 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <h2 className="font-display text-heading-sm text-white">Enlace inválido</h2>
          </div>
          <p className="font-body text-body text-on-surface-variant">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="font-caption-mono text-caption-mono uppercase tracking-widest text-primary-container hover:text-primary-fixed transition-colors text-xs"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <OnboardingProvider initialToken={token} initialEmail={email}>
      <InvitationRegisterContent invitationToken={token} />
    </OnboardingProvider>
  )
}
