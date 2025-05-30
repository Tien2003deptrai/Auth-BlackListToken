import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, User, userAPI } from '@/services/api'
import toast from 'react-hot-toast'
import TokenService from '@/services/TokenService'  // import TokenService

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.login({ email, password })
          const { tokens, user } = response.data.data!

          // Dùng TokenService lưu token
          TokenService.accessToken = tokens.accessToken
          TokenService.refreshToken = tokens.refreshToken

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success('Logged in successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed'
          set({ error: message, isAuthenticated: false, isLoading: false })
          toast.error(message)
        }
      },

      register: async (username, email, password) => {
        try {
          set({ isLoading: true, error: null })

          const response = await authAPI.register({ username, email, password })
          const { tokens, user } = response.data.data!

          TokenService.accessToken = tokens.accessToken
          TokenService.refreshToken = tokens.refreshToken

          set({
            user,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success('Account created successfully')
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message, isAuthenticated: false, isLoading: false })
          toast.error(message)
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true })

          await authAPI.logout()

          // Xóa token qua TokenService
          TokenService.accessToken = null
          TokenService.refreshToken = null

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })

          toast.success('Logged out successfully')
        } catch (error) {
          TokenService.accessToken = null
          TokenService.refreshToken = null

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      checkAuth: async () => {
        const accessToken = TokenService.accessToken
        const refreshToken = TokenService.refreshToken

        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false, user: null })
          return
        }

        set({ isLoading: true })

        try {
          const response = await userAPI.getCurrentUser()
          const { user } = response.data.data!

          set({
            user,
            isAuthenticated: true
          })
        } catch (error: any) {
          if (error.response?.status === 401) {
            try {
              const refreshResponse = await authAPI.refreshToken(refreshToken)
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data!

              TokenService.accessToken = newAccessToken
              TokenService.refreshToken = newRefreshToken

              const userResponse = await userAPI.getCurrentUser()
              const { user } = userResponse.data.data!

              set({
                user,
                isAuthenticated: true
              })
            } catch {
              TokenService.accessToken = null
              TokenService.refreshToken = null

              set({
                user: null,
                isAuthenticated: false
              })
            }
          } else {
            TokenService.accessToken = null
            TokenService.refreshToken = null

            set({
              user: null,
              isAuthenticated: false
            })
          }
        } finally {
          set({ isLoading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // storage: createJSONStorage(() => localStorage) // tùy anh muốn customize storage hay không
    }
  )
)
