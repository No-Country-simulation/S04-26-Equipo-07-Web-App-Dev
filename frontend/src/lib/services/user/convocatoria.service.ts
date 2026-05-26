import userAxios from '@/lib/axios/user.axios'

export const convocatoriaService = {
  list: () => userAxios.get('/convocatorias'),
  listMine: () => userAxios.get('/convocatorias/my'),
  get: (id: string) => userAxios.get(`/convocatorias/${id}`),
  create: (data: object) => userAxios.post('/convocatorias', data),
  close: (id: string) => userAxios.put(`/convocatorias/${id}/close`),
  publish: (id: string) => userAxios.put(`/convocatorias/${id}/publish`),
}
