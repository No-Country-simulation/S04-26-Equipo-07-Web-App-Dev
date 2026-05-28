import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react"
import type { OnboardingData, PersonalInfo, PaymentInfo, OnboardingDocument } from "@/types/onboarding"
import { onboardingService } from "@/lib/services/user/onboarding.service"

// Se mantiene la información de manera persistente durante el proceso de onboarding, incluso si el usuario recarga la página.
const STORAGE_KEY = 'onboarding_state'

const defaultDocuments: OnboardingDocument[] = [
  { id: "id", name: "Identificación Oficial", fileName: null, uploaded: false },
  { id: "address", name: "Comprobante de Domicilio", fileName: null, uploaded: false },
  { id: "tax", name: "Cédula Fiscal / RFC", fileName: null, uploaded: false },
]

const defaultInitialData: OnboardingData = {
  personalInfo: {
    fullName: "", email: "", phone: "", phoneCode: "+52", dateOfBirth: "",
    address: "", city: "", state: "", zipCode: "", country: "México",
  },
  documents: defaultDocuments,
  contract: { accepted: false, signature: "", signedAt: null },
  payment: {
    bankName: "", accountType: "checking", accountNumber: "", routingNumber: "", currency: "MXN",
  },
}

function mergeInitialData(prefilled?: Partial<OnboardingData>): OnboardingData {
  if (!prefilled) return defaultInitialData
  return {
    ...defaultInitialData,
    personalInfo: { ...defaultInitialData.personalInfo, ...prefilled.personalInfo },
  }
}

type OnboardingContextType = {
  currentStep: number
  setCurrentStep: (step: number) => void
  data: OnboardingData
  // token de invitacion — requerido para el flujo de registro
  invitationToken: string
  setInvitationToken: (token: string) => void
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  // sube el archivo al backend (Cloudinary) y guarda la URL en el estado
  uploadDocument: (id: string, file: File) => Promise<void>
  // solo elimina el estado local sin borrar de Cloudinary
  removeDocument: (id: string) => void
  acceptContract: (signature: string) => void
  updatePayment: (info: Partial<PaymentInfo>) => void
  resetOnboarding: () => void
  // error de upload para mostrar feedback al usuario
  uploadError: string | null
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({
  children,
  prefilledData,
  initialToken = "",
  initialEmail = "",
}: {
  children: ReactNode
  prefilledData?: Partial<OnboardingData>
  initialToken?: string
  initialEmail?: string
}) {
  const computedInitialData = useMemo(() => {
    const base = mergeInitialData(prefilledData)
    if (initialEmail) {
      base.personalInfo.email = initialEmail
    }
    return base
  }, [prefilledData, initialEmail])

  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved).currentStep ?? 0 : 0
    } catch {
      return 0
    }
  })

  const [invitationToken, setInvitationToken] = useState(initialToken)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved).data ?? computedInitialData : computedInitialData
    } catch {
      return computedInitialData
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, data }))
    } catch {
      // sessionStorage puede fallar en modo privado o si está lleno
    }
  }, [currentStep, data])

  const updatePersonalInfo = (info: Partial<PersonalInfo>) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...info },
    }))
  }

  // sube el archivo al backend y almacena la URL cloudinary en el documento
  const uploadDocument = async (id: string, file: File) => {
    setUploadError(null)
    // optimistic UI — muestra el nombre del archivo de inmediato
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, fileName: file.name, uploaded: false } : doc
      ),
    }))

    try {
      const result = await onboardingService.uploadDocument(invitationToken, id, file)
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((doc) =>
          doc.id === id
            ? { ...doc, fileName: file.name, uploaded: true, url: result.url }
            : doc
        ),
      }))
    } catch {
      // revert optimistic update y muestra error
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((doc) =>
          doc.id === id ? { ...doc, fileName: null, uploaded: false, url: undefined } : doc
        ),
      }))
      setUploadError("Error al subir el archivo. Intenta de nuevo.")
    }
  }

  const removeDocument = (id: string) => {
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, fileName: null, uploaded: false, url: undefined } : doc
      ),
    }))
  }

  const acceptContract = (signature: string) => {
    setData((prev) => ({
      ...prev,
      contract: {
        accepted: true,
        signature,
        signedAt: new Date().toISOString(),
      },
    }))
  }

  const updatePayment = (info: Partial<PaymentInfo>) => {
    setData((prev) => ({
      ...prev,
      payment: { ...prev.payment, ...info },
    }))
  }

  const resetOnboarding = () => {
    setCurrentStep(0)
    setData(computedInitialData)
    setInvitationToken("")
    setUploadError(null)
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        data,
        invitationToken,
        setInvitationToken,
        updatePersonalInfo,
        uploadDocument,
        removeDocument,
        acceptContract,
        updatePayment,
        resetOnboarding,
        uploadError,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider")
  return ctx
}