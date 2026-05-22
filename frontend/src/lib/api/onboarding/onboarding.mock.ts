import type { OnboardingData } from '@/types/onboarding'

export async function submitOnboarding(_data: OnboardingData) {
  await new Promise((r) => setTimeout(r, 800))
  return { success: true, id: Date.now() }
}

export async function uploadDocument(file: File) {
  await new Promise((r) => setTimeout(r, 500))
  return { url: URL.createObjectURL(file), fileName: file.name }
}
