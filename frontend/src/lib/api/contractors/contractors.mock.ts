export type Contractor = {
  id: number
  fullName: string
  email: string
  phone: string
  country: string
  countryCode: string
  step: string
  dateSubmitted: string
  timeInQueue: string
  documents: { name: string; uploaded: boolean; fileName: string | null }[]
  contractAccepted: boolean
  contractSignature: string
  bankName: string
  status: "pending" | "approved" | "rejected"
}

const mockContractors: Contractor[] = [
  {
    id: 1,
    fullName: "Erik Jensen",
    email: "erik@example.com",
    phone: "+45 12 3456 7890",
    country: "Denmark",
    countryCode: "DNK",
    step: "KYC_VERIF",
    dateSubmitted: "2025-05-20",
    timeInQueue: "02:14:45",
    documents: [
      { name: "Identificación Oficial", uploaded: true, fileName: "ine_erik.pdf" },
      { name: "Comprobante de Domicilio", uploaded: true, fileName: "domicilio_erik.pdf" },
      { name: "Cédula Fiscal / RFC", uploaded: true, fileName: "rfc_erik.pdf" },
      { name: "Contrato Firmado", uploaded: true, fileName: "contrato_erik.pdf" },
    ],
    contractAccepted: true,
    contractSignature: "Erik Jensen",
    bankName: "Danske Bank",
    status: "pending",
  },
  {
    id: 2,
    fullName: "Sienna Cheng",
    email: "sienna@example.com",
    phone: "+65 9876 5432",
    country: "Singapore",
    countryCode: "SGP",
    step: "TAX_FORMS",
    dateSubmitted: "2025-05-19",
    timeInQueue: "08:32:12",
    documents: [
      { name: "Identificación Oficial", uploaded: true, fileName: "id_sienna.pdf" },
      { name: "Comprobante de Domicilio", uploaded: true, fileName: "address_sienna.pdf" },
      { name: "W-8BEN", uploaded: false, fileName: null },
    ],
    contractAccepted: false,
    contractSignature: "",
    bankName: "DBS",
    status: "pending",
  },
  {
    id: 3,
    fullName: "Marcus Aurelius",
    email: "marcus@example.com",
    phone: "+39 06 1234 5678",
    country: "Italy",
    countryCode: "ITA",
    step: "PAYMENT_SETUP",
    dateSubmitted: "2025-05-18",
    timeInQueue: "00:45:10",
    documents: [
      { name: "Identificación Oficial", uploaded: true, fileName: "id_marcus.pdf" },
      { name: "Comprobante de Domicilio", uploaded: true, fileName: "address_marcus.pdf" },
      { name: "Datos Bancarios", uploaded: false, fileName: null },
    ],
    contractAccepted: true,
    contractSignature: "Marcus Aurelius",
    bankName: "Unicredit",
    status: "pending",
  },
  {
    id: 4,
    fullName: "Yara Lopez",
    email: "yara@example.com",
    phone: "+55 11 98765 4321",
    country: "Brazil",
    countryCode: "BRA",
    step: "FINAL_SIGN",
    dateSubmitted: "2025-05-17",
    timeInQueue: "14:22:56",
    documents: [
      { name: "Identificación Oficial", uploaded: true, fileName: "rg_yara.pdf" },
      { name: "Comprobante de Domicilio", uploaded: true, fileName: "endereco_yara.pdf" },
      { name: "CPF / CNPJ", uploaded: true, fileName: "cpf_yara.pdf" },
      { name: "Contrato", uploaded: true, fileName: "contrato_yara.pdf" },
      { name: "Comprobante de Cuenta", uploaded: true, fileName: "conta_yara.pdf" },
    ],
    contractAccepted: true,
    contractSignature: "Yara Lopez",
    bankName: "Itaú",
    status: "approved",
  },
  {
    id: 5,
    fullName: "Carlos Mendoza",
    email: "carlos@example.com",
    phone: "+52 55 4321 5678",
    country: "Mexico",
    countryCode: "MEX",
    step: "DOC_UPLOAD",
    dateSubmitted: "2025-05-16",
    timeInQueue: "22:10:05",
    documents: [
      { name: "Identificación Oficial", uploaded: true, fileName: "ine_carlos.pdf" },
      { name: "Comprobante de Domicilio", uploaded: false, fileName: null },
      { name: "Cédula Fiscal / RFC", uploaded: false, fileName: null },
    ],
    contractAccepted: false,
    contractSignature: "",
    bankName: "BBVA",
    status: "rejected",
  },
]

let stored = mockContractors

export function fetchContractors(): Promise<Contractor[]> {
  return Promise.resolve(stored)
}

export function updateContractorStatus(
  id: number,
  status: "pending" | "approved" | "rejected"
): Promise<void> {
  stored = stored.map((c) => (c.id === id ? { ...c, status } : c))
  return Promise.resolve()
}
