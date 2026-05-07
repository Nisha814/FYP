import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiHome, FiCamera, FiClock, FiBarChart2, FiUsers, FiBell, FiMessageCircle, FiShield, FiUser, FiLogOut } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { notificationService } from '../services/api'
import { getSocket } from '../services/socket'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadNotificationCount = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0)
        return
      }
      try {
        const response = await notificationService.getNotifications()
        setUnreadCount(response.data.unreadCount || 0)
      } catch (error) {
        setUnreadCount(0)
      }
    }
    loadNotificationCount()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return undefined
    const socket = getSocket()
    const onNewNotification = () => {
      setUnreadCount((prev) => prev + 1)
    }
    socket.on('notification:new', onNewNotification)
    return () => {
      socket.off('notification:new', onNewNotification)
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
              🌱 CropGuard AI
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiHome className="mr-1" /> Dashboard
                </Link>
                <Link
                  to="/predict"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiCamera className="mr-1" /> Predict
                </Link>
                <Link
                  to="/history"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiClock className="mr-1" /> History
                </Link>
                <Link
                  to="/analytics"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiBarChart2 className="mr-1" /> Analytics
                </Link>
                <Link
                  to="/social"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiUsers className="mr-1" /> Social
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <FiMessageCircle className="mr-1" /> Chat
                </Link>
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <FiShield className="mr-1" /> Admin
                  </Link>
                ) : null}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center text-sm text-gray-700 hover:text-primary-600"
                >
                  <FiUser className="mr-1" />
                  {user?.name}
                </Link>
                <Link to="/notifications" className="relative flex items-center text-sm text-gray-700 hover:text-primary-600">
                  <FiBell className="mr-1" />
                  Alerts
                  {unreadCount > 0 ? (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  ) : null}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-gray-700 hover:text-red-600"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar


