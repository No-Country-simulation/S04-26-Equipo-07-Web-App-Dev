import axios from 'axios'
import { API } from './config'

export const apiClient = axios.create({
  baseURL: API.baseURL,
  timeout: 10_000,
})
