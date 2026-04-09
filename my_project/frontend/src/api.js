import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh })
          localStorage.setItem('access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    }
    return Promise.reject(error)
  },
)

export function unwrap(res) {
  const d = res?.data
  if (d && Object.prototype.hasOwnProperty.call(d, 'success')) {
    if (!d.success) {
      const msg = d.error?.message || d.error?.details || 'Request failed'
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
    return d.data
  }
  return d
}

export async function unwrapRequest(promise) {
  const res = await promise
  return unwrap(res)
}

export const fetchProperties = (filters) => api.get('properties/', { params: filters })
export const fetchProperty = (id) => api.get(`properties/${id}/`)
export const createProperty = (payload) => api.post('properties/', payload)

export const fetchAgents = (params) => api.get('agents/', { params })
export const fetchAgent = (id) => api.get(`agents/${id}/`)

export const fetchSales = (params) => api.get('sales/', { params })
export const fetchRentals = (params) => api.get('rentals/', { params })

export const executeQuery = (query) => api.post('query/', { query })

export const fetchDashboardStats = () => api.get('dashboard/stats/')
export const reportSalesByAgent = (params) => api.get('reports/sales-by-agent/', { params })
export const reportRentalsByAgent = (params) => api.get('reports/rentals-by-agent/', { params })
export const reportTopProperties = (params) => api.get('reports/top-properties/', { params })

export const queryA = () => api.get('queries/a/')
export const queryB = () => api.get('queries/b/')
export const queryC = () => api.get('queries/c/')
export const queryD = () => api.get('queries/d/')
export const queryE = () => api.get('queries/e/')
export const queryF = () => api.get('queries/f/')

export const login = (username, password) =>
  axios.post(`${API_BASE_URL}/token/`, { username, password })
