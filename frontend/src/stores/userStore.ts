import { create } from 'zustand'
import { userAPI, User } from '@/services/api'
import toast from 'react-hot-toast'

interface UserState {
  users: User[]
  currentUser: User | null
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  isLoading: boolean
  error: string | null

  // Actions
  fetchUsers: (page?: number, limit?: number) => Promise<void>
  fetchUserById: (id: string) => Promise<User | null>
  updateUser: (id: string, data: { username?: string, email?: string, role?: 'user' | 'admin', isActive?: boolean }) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  updateProfile: (data: { username?: string, email?: string }) => Promise<void>
  clearError: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  },
  isLoading: false,
  error: null,

  fetchUsers: async (page = 1, limit = 10) => {
    try {
      set({ isLoading: true, error: null })

      const response = await userAPI.getAllUsers(page, limit)
      const { users, pagination } = response.data.data!

      set({
        users,
        pagination,
        isLoading: false
      })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch users'
      set({
        error: message,
        isLoading: false
      })
      toast.error(message)
    }
  },

  fetchUserById: async (id) => {
    try {
      set({ isLoading: true, error: null })

      const response = await userAPI.getUserById(id)
      const { user } = response.data.data!

      set({
        currentUser: user,
        isLoading: false
      })

      return user
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user'
      set({
        error: message,
        isLoading: false
      })
      toast.error(message)
      return null
    }
  },

  updateUser: async (id, data) => {
    try {
      set({ isLoading: true, error: null })

      const response = await userAPI.updateUser(id, data)
      const { user } = response.data.data!

      // Update user in list if exists
      const updatedUsers = get().users.map(u =>
        u._id === id ? user : u
      )

      set({
        users: updatedUsers,
        currentUser: user,
        isLoading: false
      })

      toast.success('User updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user'
      set({
        error: message,
        isLoading: false
      })
      toast.error(message)
    }
  },

  deleteUser: async (id) => {
    try {
      set({ isLoading: true, error: null })

      await userAPI.deleteUser(id)

      // Remove user from list
      const updatedUsers = get().users.filter(u => u._id !== id)

      set({
        users: updatedUsers,
        isLoading: false
      })

      toast.success('User deleted successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user'
      set({
        error: message,
        isLoading: false
      })
      toast.error(message)
    }
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null })

      const response = await userAPI.updateProfile(data)
      const { user } = response.data.data!

      set({
        currentUser: user,
        isLoading: false
      })

      toast.success('Profile updated successfully')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile'
      set({
        error: message,
        isLoading: false
      })
      toast.error(message)
    }
  },

  clearError: () => set({ error: null })
}))
