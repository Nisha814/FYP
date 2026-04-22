// Get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return ''
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${baseUrl}${imagePath}`
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token')
}

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token')
}

// Handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || 'An error occurred'
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection.'
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred'
  }
}

// Generate random ID (for testing)
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Check if image URL is valid
export const isValidImageUrl = (url) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

