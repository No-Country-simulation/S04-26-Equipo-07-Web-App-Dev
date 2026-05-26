import { createContext, useContext, useState, useMemo, type ReactNode } from "react"
import type { OnboardingData, PersonalInfo, PaymentInfo, OnboardingDocument } from "@/types/onboarding"
import { useUpload } from "@/hooks/useUpload"

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

export function OnboardingProvider({ children, prefilledData }: { children: ReactNode; prefilledData?: Partial<OnboardingData> }) {
  const [currentStep, setCurrentStep] = useState(0)
  const initialData = useMemo(() => mergeInitialData(prefilledData), [])
  const [data, setData] = useState<OnboardingData>(initialData)
  const { upload: cloudinaryUpload, reset: resetUpload } = useUpload()

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
        doc.id === id ? { ...doc, fileName: file.name, uploaded: true, url: result.url } : doc
      ),
    }))
  }

  const removeDocument = (id: string) => {
    setData((prev) => ({
      ...prev,
      documents: prev.documents.map((doc) =>
        doc.id === id ? { ...doc, fileName: null, uploaded: false } : doc
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
