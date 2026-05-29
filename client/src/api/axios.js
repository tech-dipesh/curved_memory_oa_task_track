import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if(token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// This is intercepting for when user is not authenticated and just redirect 
api.interceptors.response.use(
  res => res,
  err => {
    if(err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
