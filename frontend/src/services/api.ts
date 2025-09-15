import axios from 'axios'

// Create axios instances for each microservice
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
  timeout: 10000,
})

export const exerciseApi = axios.create({
  baseURL: import.meta.env.VITE_EXERCISE_SERVICE_URL,
  timeout: 10000,
})

export const routineApi = axios.create({
  baseURL: import.meta.env.VITE_ROUTINE_SERVICE_URL,
  timeout: 10000,
})

export const workoutApi = axios.create({
  baseURL: import.meta.env.VITE_WORKOUT_SERVICE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
const addAuthInterceptor = (apiInstance: ReturnType<typeof axios.create>) => {
  apiInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('fitness_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
}

// Response interceptor for error handling
const addResponseInterceptor = (apiInstance: ReturnType<typeof axios.create>) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('fitness_token')
        localStorage.removeItem('fitness_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

// Apply interceptors to all API instances
[authApi, exerciseApi, routineApi, workoutApi].forEach(api => {
  addAuthInterceptor(api)
  addResponseInterceptor(api)
})