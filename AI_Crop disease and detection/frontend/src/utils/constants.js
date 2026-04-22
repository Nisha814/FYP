// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Image Configuration
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

// Plant Types
export const PLANT_TYPES = [
  'Tomato',
  'Potato',
  'Corn',
  'Wheat',
  'Rice',
  'Soybean',
  'Cotton',
  'Pepper',
  'Cucumber',
  'Other'
]

// Disease Types (for reference)
export const DISEASE_TYPES = [
  'Healthy',
  'Early Blight',
  'Late Blight',
  'Bacterial Spot',
  'Leaf Mold',
  'Septoria Leaf Spot',
  'Spider Mites',
  'Target Spot',
  'Yellow Leaf Curl Virus',
  'Mosaic Virus'
]

// Treatment Types
export const TREATMENT_TYPES = {
  FERTILIZER: 'fertilizer',
  PESTICIDE: 'pesticide',
  ORGANIC: 'organic',
  CULTURAL: 'cultural'
}

// User Roles
export const USER_ROLES = {
  FARMER: 'farmer',
  EXPERT: 'expert',
  ADMIN: 'admin'
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PREDICT: '/predict',
  HISTORY: '/history',
  ANALYTICS: '/analytics',
  PROFILE: '/profile'
}

