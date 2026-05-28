import { USE_MOCK } from '../config'
import type { Contractor } from './contractors.mock'

export type { Contractor }

async function getModule() {
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
  id: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  const mod = await getModule()
  return mod.updateContractorStatus(id, status)
}
