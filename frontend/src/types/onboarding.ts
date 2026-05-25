export type PersonalInfo = {
  fullName: string
  email: string
  phone: string
  phoneCode: string
  dateOfBirth: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type OnboardingDocument = {
  id: string
  name: string
  fileName: string | null
  uploaded: boolean
}

export type ContractInfo = {
  accepted: boolean
  signature: string
  signedAt: string | null
}

export type PaymentInfo = {
  bankName: string
  accountType: string
  accountNumber: string
  routingNumber: string
  currency: string
}

export type OnboardingData = {
  personalInfo: PersonalInfo
  documents: OnboardingDocument[]
  contract: ContractInfo
  payment: PaymentInfo
}

export type StepInfo = {
  id: number
  label: string
  description: string
}
