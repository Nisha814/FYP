// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Password validation
export const validatePassword = (password) => {
  // At least 6 characters
  return password.length >= 6
}

// Image file validation
export const validateImageFile = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('Please select an image file')
    return { valid: false, errors }
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Please upload a JPEG, PNG, or GIF image.')
  }
  
  // Check file size (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Form validation
export const validateRegisterForm = (formData) => {
  const errors = {}
  
  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }
  
  if (!formData.email || !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.password || !validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters'
  }
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

// Login form validation
export const validateLoginForm = (email, password) => {
  const errors = {}
  
  if (!email || !validateEmail(email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!password) {
    errors.password = 'Password is required'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

