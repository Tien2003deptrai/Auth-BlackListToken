import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import TokenService from './TokenService' // TokenService theo mẫu tôi đã gửi trước đó
import { useAuthStore } from '@/stores/authStore'

// Tạo axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor thêm accessToken từ TokenService
api.interceptors.request.use(
  (config) => {
    const token = TokenService.accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor xử lý refresh token, tránh gọi nhiều lần cùng lúc
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = TokenService.refreshToken
      if (!refreshToken) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('/api/auth/refresh-token', { refreshToken })
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens

        TokenService.accessToken = accessToken
        TokenService.refreshToken = newRefreshToken

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        processQueue(null, accessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// Các API service giữ nguyên
export const authAPI = {
  register: (data: RegisterData): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post('/auth/register', data),

  login: (data: LoginData): Promise<AxiosResponse<ApiResponse<AuthData>>> =>
    api.post('/auth/login', data),

  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/logout', {
      refreshToken: TokenService.refreshToken,
    }),

  refreshToken: (refreshToken: string): Promise<AxiosResponse<ApiResponse<TokenData>>> =>
    api.post('/auth/refresh-token', { refreshToken }),
}

export const userAPI = {
  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    api.get('/users/profile'),

  updateProfile: (data: UpdateProfileData): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    api.put('/users/profile', data),

  getAllUsers: (page = 1, limit = 10): Promise<AxiosResponse<ApiResponse<UsersListData>>> =>
    api.get(`/users?page=${page}&limit=${limit}`),

  getUserById: (id: string): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    api.get(`/users/${id}`),

  updateUser: (id: string, data: UpdateUserData): Promise<AxiosResponse<ApiResponse<UserData>>> =>
    api.put(`/users/${id}`, data),

  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/users/${id}`),
}

// Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export interface AuthData {
  user: User
  tokens: TokenData
}

export interface TokenData {
  accessToken: string
  refreshToken: string
}

export interface User {
  _id: string;       // ID MongoDB thường có _id
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  // ... các trường khác nếu có
}

export interface UserData {
  user: User
}

export interface UsersListData {
  users: User[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UpdateProfileData {
  username?: string
  email?: string
}

export interface UpdateUserData {
  username?: string
  email?: string
  role?: 'user' | 'admin'
  isActive?: boolean
}

export default api
