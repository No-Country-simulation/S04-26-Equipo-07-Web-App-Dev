import axios from 'axios'

// instancia axios para peticiones de trabajadores autenticados
const workerAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

workerAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('worker_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default workerAxios
