import axios from 'axios'

// instancia axios para peticiones de usuarios autenticados
const userAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default userAxios
