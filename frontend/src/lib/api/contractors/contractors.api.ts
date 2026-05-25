import { apiClient } from '../client'
import { API } from '../config'
import type { Contractor } from './contractors.mock'

export async function fetchContractors(): Promise<Contractor[]> {
  const { data } = await apiClient.get(API.contractors.list)
  return data
}

export async function updateContractorStatus(
  id: number,
  status: 'pending' | 'approved' | 'rejected'
): Promise<void> {
  await apiClient.patch(API.contractors.status(id), { status })
}
