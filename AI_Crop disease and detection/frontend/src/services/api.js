import axios from 'axios'

// DEV: same-origin `/api` is proxied by Vite → avoids cross-origin cookie/CORS friction.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api')

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const shouldRefresh = error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes('/auth/')

    if (shouldRefresh) {
      originalRequest._retry = true
      try {
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  setToken: () => {},
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh')
}

export const predictionService = {
  createPrediction: (formData) => api.post('/predictions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPredictions: () => api.get('/predictions'),
  getPrediction: (id) => api.get(`/predictions/${id}`),
  deletePrediction: (id) => api.delete(`/predictions/${id}`),
  getAnalytics: () => api.get('/predictions/analytics/stats')
}

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data)
}

export const socialService = {
  getPosts: (params = {}) => api.get('/posts', { params }),
  createPost: (formData) => api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  toggleLike: (postId) => api.post(`/posts/${postId}/like`),
  addComment: (postId, text) => api.post(`/posts/${postId}/comments`, { text }),
  updatePost: (postId, payload) => api.put(`/posts/${postId}`, payload),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  reportPost: (postId, reason) => api.post(`/posts/${postId}/report`, { reason }),
  getReportedPosts: () => api.get('/posts/moderation/reported'),
  resolveReport: (postId, reportId, status) => api.patch(`/posts/moderation/${postId}/report`, { reportId, status }),
  getModeratorAuditLogs: (params = {}) => api.get('/posts/moderation/audit', { params })
}

export const chatService = {
  ask: (message, plantType) => api.post('/chat', { message, plantType })
}

export const noticeService = {
  getMyNotices: () => api.get('/notices'),
  markRead: (id) => api.patch(`/notices/${id}/read`)
}

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getPosts: () => api.get('/admin/posts'),
  deletePost: (postId) => api.delete(`/admin/posts/${postId}`),
  sendNotice: (payload) => api.post('/admin/notices', payload)
}

export const notificationService = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  bulkArchive: (ids) => api.patch('/notifications/bulk-archive', { ids }),
  bulkDelete: (ids) => api.delete('/notifications/bulk-delete', { data: { ids } }),
  updateReadStatus: (id, isRead) => api.patch(`/notifications/${id}`, { isRead }),
  archive: (id) => api.patch(`/notifications/${id}/archive`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
}

export default api


