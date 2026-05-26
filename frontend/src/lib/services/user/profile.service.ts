import userAxios from '@/lib/axios/user.axios'

export const profileService = {
  getProfile: () => userAxios.get('/users/me'),
  updateProfile: (data: object) => userAxios.put('/users/me', data),
}
