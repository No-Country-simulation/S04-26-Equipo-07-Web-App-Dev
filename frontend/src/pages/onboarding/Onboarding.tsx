import { OnboardingProvider, useOnboarding } from "@/modules/onboarding/hooks/useOnboarding"
import PersonalInfoStep from "./steps/PersonalInfoStep"
import DocumentsStep from "./steps/DocumentsStep"
import ContractStep from "./steps/ContractStep"
import PaymentStep from "./steps/PaymentStep"
import ReviewStep from "./steps/ReviewStep"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { personalInfoSchema, contractSchema, paymentSchema } from "@/stores/onboardingSchemas"
import { submitOnboarding } from "@/lib/api/onboarding"

const steps = [
  { id: 0, label: "Personal", description: "Información personal" },
  { id: 1, label: "Documentos", description: "Identificación y RFC" },
  { id: 2, label: "Contrato", description: "Firma digital" },
  { id: 3, label: "Pago", description: "Método de cobro" },
  { id: 4, label: "Revisión", description: "Confirmar datos" },
]

const stepComponents = [
  PersonalInfoStep,
  DocumentsStep,
  ContractStep,
  PaymentStep,
  ReviewStep,
]

function OnboardingContent() {
  const navigate = useNavigate()
  const { currentStep, setCurrentStep, data, resetOnboarding } = useOnboarding()
  const [submitting, setSubmitting] = useState(false)

  const { personalInfo, documents, contract, payment } = data
  const allDocsUploaded = documents.every((d) => d.uploaded)

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return personalInfoSchema.safeParse(personalInfo).success
      case 1:
        return allDocsUploaded
      case 2:
        return contractSchema.safeParse(contract).success
      case 3:
        return paymentSchema.safeParse(payment).success
      case 4:
        return true
      default:
        return false
    }
  }

  const canGoNext = isStepValid()
  const isLastStep = currentStep === steps.length - 1

  const handleNext = async () => {
    if (isLastStep) {
      setSubmitting(true)
      try {
        await submitOnboarding(data)
        resetOnboarding()
        navigate("/onboarding/success")
      } catch {
        setSubmitting(false)
      }
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/")
      return
    }
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
            Onboarding · {currentStep + 1}/{steps.length}
          </span>
        </div>
      </header>

      <main className="pt-18 max-w-300 mx-auto px-8 md:px-32 py-16">
        <div className="mb-16">
          <div className="flex items-center justify-between relative">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1 relative">
                <div className="flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 flex items-center justify-center font-caption-mono text-sm border transition-all duration-300 ${
                      i < currentStep
                        ? "bg-primary-container text-black border-primary-container"
                        : i === currentStep
                          ? "border-primary-container text-primary-container bg-primary-container/10"
                          : "border-color-border text-on-surface-variant bg-color-surface"
                    }`}
                  >
                    {i < currentStep ? "✓" : String(step.id + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-3 text-center hidden md:block">
                    <span
                      className={`font-caption-mono text-caption-mono uppercase tracking-widest ${
                        i <= currentStep ? "text-primary-container" : "text-on-surface-variant"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 transition-colors duration-300 ${
                      i < currentStep ? "bg-primary-container" : "bg-color-border"
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

          <div className="flex justify-between mt-10 pt-8 border-t border-color-border">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-color-border text-on-surface-variant hover:text-white hover:border-white transition-all font-caption-mono text-caption-mono uppercase tracking-widest"
            >
              <ChevronLeft size={14} />
              {currentStep === 0 ? "Salir" : "Anterior"}
            </button>

            <button
              onClick={handleNext}
              disabled={!canGoNext || submitting}
              className={`flex items-center gap-2 px-8 py-3 font-caption-mono text-caption-mono uppercase tracking-widest transition-all ${
                canGoNext && !submitting
                  ? "bg-primary-container text-black hover:bg-primary-fixed"
                  : "bg-surface-variant text-on-surface-variant cursor-not-allowed"
              }`}
            >
              {submitting ? (
                "Enviando..."
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

export default function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  )
}
