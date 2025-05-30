import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface AdminRouteProps {
  children: React.ReactNode
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  // Redirect to dashboard if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  
  // Render children if admin
  return <>{children}</>
}

export default AdminRoute