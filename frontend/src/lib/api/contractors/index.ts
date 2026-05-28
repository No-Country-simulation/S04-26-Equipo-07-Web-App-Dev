import { USE_MOCK } from '../config'
import type { Contractor } from './contractors.mock'

export type { Contractor }

type ContractorsModule = {
  fetchContractors: () => Promise<Contractor[]>
  updateContractorStatus: (id: string | number, status: 'pending' | 'approved' | 'rejected') => Promise<void>
}

async function getModule(): Promise<ContractorsModule> {
  if (USE_MOCK) {
    return import('./contractors.mock')
  }
  return import('./contractors.api')
}

export async function fetchContractors(): Promise<Contractor[]> {
  const mod = await getModule()
  return mod.fetchContractors()
}

export async function updateContractorStatus(
  id: string | number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  const mod = await getModule()
  return mod.updateContractorStatus(id, status)
}
