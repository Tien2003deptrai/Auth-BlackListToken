import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { FiMenu, FiX, FiHome, FiUser, FiUsers, FiLogOut } from 'react-icons/fi'

const Layout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Auth System</h1>
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary-600 border-b-2 border-primary-600 px-1 pt-1 text-sm font-medium"
                    : "text-gray-500 hover:text-primary-600 px-1 pt-1 text-sm font-medium"
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary-600 border-b-2 border-primary-600 px-1 pt-1 text-sm font-medium"
                    : "text-gray-500 hover:text-primary-600 px-1 pt-1 text-sm font-medium"
                }
              >
                Profile
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    isActive
                      ? "text-primary-600 border-b-2 border-primary-600 px-1 pt-1 text-sm font-medium"
                      : "text-gray-500 hover:text-primary-600 px-1 pt-1 text-sm font-medium"
                  }
                >
                  Users
                </NavLink>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-primary-600 px-1 pt-1 text-sm font-medium"
              >
                Logout
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <FiX className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <FiMenu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <NavLink
                to="/dashboard"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive
                    ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                    : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
                }
              >
                <div className="flex items-center">
                  <FiHome className="mr-2" /> Dashboard
                </div>
              </NavLink>
              <NavLink
                to="/profile"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  isActive
                    ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                    : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
                }
              >
                <div className="flex items-center">
                  <FiUser className="mr-2" /> Profile
                </div>
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink
                  to="/users"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "bg-primary-50 border-l-4 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
                      : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium"
                  }
                >
                  <div className="flex items-center">
                    <FiUsers className="mr-2" /> Users
                  </div>
                </NavLink>
              )}
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleLogout()
                }}
                className="border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 text-base font-medium w-full text-left"
              >
                <div className="flex items-center">
                  <FiLogOut className="mr-2" /> Logout
                </div>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Auth System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
