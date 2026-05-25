import { USE_MOCK } from '../config'

async function getModule() {
  if (USE_MOCK) {
    return import('./auth.mock')
  }
  return import('./auth.api')
}

export async function login(email: string, password: string) {
  const mod = await getModule()
  return mod.login(email, password)
}

export async function register(data: { name: string; email: string; password: string }) {
  const mod = await getModule()
  return mod.register(data)
}

export async function logout() {
  const mod = await getModule()
  return mod.logout()
}
