import { USE_MOCK } from '../config'
import type { OnboardingData } from '@/types/onboarding'

async function getModule() {
  if (USE_MOCK) {
    return import('./onboarding.mock')
  }
  return import('./onboarding.api')
}

export async function submitOnboarding(data: OnboardingData) {
  const mod = await getModule()
  return mod.submitOnboarding(data)
}

export async function uploadDocument(file: File) {
  const mod = await getModule()
  return mod.uploadDocument(file)
}
