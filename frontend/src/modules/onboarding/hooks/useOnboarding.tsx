import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react"
import type { OnboardingData, PersonalInfo, PaymentInfo, OnboardingDocument } from "@/types/onboarding"
import { useUpload } from "@/hooks/useUpload"

//Se agrega un estado de carga para mantener la información de manera persistente durante el proceso de onboarding, incluso si el usuario recarga la página.
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
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  uploadDocument: (id: string, file: File) => Promise<void>
  removeDocument: (id: string) => void
  acceptContract: (signature: string) => void
  updatePayment: (info: Partial<PaymentInfo>) => void
  resetOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({
  children,
  prefilledData,
}: {
  children: ReactNode
  prefilledData?: Partial<OnboardingData>
}) {
  const initialData = useMemo(() => mergeInitialData(prefilledData), [])

  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved).currentStep ?? 0 : 0
    } catch {
      return 0
    }
  })

  const [data, setData] = useState<OnboardingData>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved).data ?? initialData : initialData
    } catch {
      return initialData
    }
  })

  const { upload: cloudinaryUpload, reset: resetUpload } = useUpload()

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

  const uploadDocument = async (id: string, file: File) => {
    resetUpload()
    const result = await cloudinaryUpload(file)
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id
          ? { ...doc, fileName: file.name, uploaded: true, url: result?.url }
          : doc
      ),
    }))
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
    setData(initialData)
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
        updatePersonalInfo,
        uploadDocument,
        removeDocument,
        acceptContract,
        updatePayment,
        resetOnboarding,
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