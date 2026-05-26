import userAxios from '@/lib/axios/user.axios'

export const authService = {
  login: (data: { email: string; password: string }) =>
    userAxios.post('/auth/login', data),

  setPassword: (data: { token: string; password: string; confirmPassword: string }) =>
    userAxios.post('/auth/set-password', data),

  register: (data: object) =>
    userAxios.post('/auth/register', data),
}
