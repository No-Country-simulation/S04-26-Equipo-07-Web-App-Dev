import userAxios from '@/lib/axios/user.axios'

export const companyService = {
  list: () => userAxios.get('/companies'),
  get: (id: string) => userAxios.get(`/companies/${id}`),
  create: (data: object) => userAxios.post('/companies', data),
  update: (id: string, data: object) => userAxios.put(`/companies/${id}`, data),
}
