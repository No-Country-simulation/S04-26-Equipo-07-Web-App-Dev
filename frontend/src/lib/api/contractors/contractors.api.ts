import { apiClient } from '../client'
import { API } from '../config'
import type { Contractor } from './contractors.mock'

const DOC_NAMES: Record<string, string> = {
  dni_url: 'Identificación Oficial',
  address_url: 'Comprobante de Domicilio',
  tax_url: 'Cédula Fiscal / RFC',
}

type BackendContractor = {
  id: string
  fullName: string
  email: string
  country: string
  status: string
  documents: Record<string, string>
  contractSigned: boolean
  signature: string
  paymentMethod: Record<string, string>
  createdAt?: string
  phone?: string
}

function toFrontendContractor(bc: BackendContractor): Contractor {
  const docs = Object.entries(bc.documents || {}).map(([key, url]) => ({
    name: DOC_NAMES[key] || key,
    uploaded: !!url,
    fileName: url ? url.split('/').pop() || 'documento' : null,
  }))

  return {
    id: bc.id,
    fullName: bc.fullName,
    email: bc.email,
    phone: bc.phone || '',
    country: bc.country,
    countryCode: bc.country?.slice(0, 3).toUpperCase() || '',
    step: 'DOC_UPLOAD',
    dateSubmitted: bc.createdAt ? bc.createdAt.split('T')[0] : '',
    timeInQueue: '—',
    documents: docs,
    contractAccepted: bc.contractSigned,
    contractSignature: bc.signature || '',
    bankName: bc.paymentMethod?.bankName || '',
    status: (bc.status === 'PENDING_VERIFICATION' ? 'pending' : bc.status?.toLowerCase()) as Contractor['status'],
  }
}

export async function fetchContractors(): Promise<Contractor[]> {
  const { data } = await apiClient.get(API.contractors.list)
  return (Array.isArray(data) ? data : []).map(toFrontendContractor)
}

export async function updateContractorStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<void> {
  await apiClient.put(API.contractors.status(id), { status })
}
