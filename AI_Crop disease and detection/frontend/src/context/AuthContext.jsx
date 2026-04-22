import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (!user) return undefined

    // Refresh proactively before short-lived access token expires.
    const refreshInterval = setInterval(async () => {
      try {
        await authService.refresh()
      } catch (error) {
        setUser(null)
      }
    }, 10 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [user])

  useEffect(() => {
    if (!user) return undefined

    const refreshSession = async () => {
      try {
        await authService.refresh()
      } catch (error) {
        setUser(null)
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }

    const handleFocus = () => {
      refreshSession()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const loadUser = async () => {
    try {
      const response = await authService.getMe()
      setUser(response.data.user)
    } catch (error) {
      try {
        await authService.refresh()
        const response = await authService.getMe()
        setUser(response.data.user)
      } catch (refreshError) {
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { user } = response.data
      setUser(user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { user } = response.data
      setUser(user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Ignore request failure and clear local auth state.
    }
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


