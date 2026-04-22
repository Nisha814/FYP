import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/api'
import { FiUser, FiMail, FiMapPin, FiSave, FiEdit2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    role: ''
  })
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile()
      const userData = response.data.user
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        location: userData.location || '',
        role: userData.role || ''
      })
    } catch (error) {
      toast.error('Failed to load profile')
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await userService.updateProfile({
        name: formData.name,
        location: formData.location
      })
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <FiEdit2 className="mr-1" />
              Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMail className="inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="input-field bg-gray-100 cursor-not-allowed"
              value={formData.email}
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMapPin className="inline mr-2" />
              Location
            </label>
            <input
              type="text"
              name="location"
              className="input-field"
              placeholder="City, Country"
              value={formData.location}
              onChange={handleChange}
              disabled={!editing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              className="input-field bg-gray-100 cursor-not-allowed capitalize"
              value={formData.role}
              disabled
            />
            <p className="mt-1 text-xs text-gray-500">Role cannot be changed</p>
          </div>

          {editing && (
            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                <FiSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  loadProfile()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Account Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <p className="text-sm text-gray-600 mb-1">Member Since</p>
          <p className="text-lg font-semibold text-gray-900">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600 mb-1">Account Type</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">{formData.role}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <p className="text-lg font-semibold text-green-600">Active</p>
        </div>
      </div>
    </div>
  )
}

export default Profile

