import { apiClient } from '../client'
import { API } from '../config'
import type { OnboardingData } from '@/types/onboarding'

export async function submitOnboarding(data: OnboardingData) {
  const response = await apiClient.post(API.onboarding.submit, data)
  return response.data
}

export async function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post(API.onboarding.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
