export async function login(email: string, password: string) {
  await new Promise((r) => setTimeout(r, 1000))
  if (email === 'user@company.com' && password === 'password') {
    localStorage.setItem('auth', 'true')
    return { token: 'mock-token-123', user: { email } }
  }
  throw new Error('Credenciales inválidas')
}

export async function register(_data: { name: string; email: string; password: string }) {
  await new Promise((r) => setTimeout(r, 1000))
  return { success: true }
}

export async function logout() {
  localStorage.removeItem('auth')
}
