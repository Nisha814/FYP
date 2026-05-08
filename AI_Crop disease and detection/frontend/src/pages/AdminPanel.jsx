import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/api'
import { 
  FiUsers, 
  FiFileText, 
  FiAlertTriangle, 
  FiMessageSquare,
  FiMail,
  FiTrash2,
  FiEdit
} from 'react-icons/fi'

const AdminPanel = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [noticeType, setNoticeType] = useState('info')
  const [noticeMode, setNoticeMode] = useState('private')
  const [activeTab, setActiveTab] = useState('users')

  const loadData = async () => {
    try {
      const [usersRes, postsRes, analyticsRes] = await Promise.all([
        adminService.getUsers(), 
        adminService.getPosts(),
        adminService.getAnalytics()
      ])
      setUsers(usersRes.data.users || [])
      setPosts(postsRes.data.posts || [])
      setAnalytics(analyticsRes.data.analytics)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin data')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRoleChange = async (userId, role) => {
    try {
      const response = await adminService.updateUserRole(userId, role)
      setUsers((prev) => prev.map((u) => (u._id === userId ? response.data.user : u)))
      toast.success('User role updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await adminService.deletePost(postId)
      setPosts((prev) => prev.filter((post) => post._id !== postId))
      toast.success('Post deleted successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    }
  }

  const handleSendNotice = async () => {
    if (noticeMode === 'private' && !selectedUser) {
      toast.error('Please select a user for private notice')
      return
    }
    if (!noticeTitle.trim() || !noticeMessage.trim()) {
      toast.error('Please fill in both title and message')
      return
    }
    try {
      if (noticeMode === 'private') {
        await adminService.sendNotice({
          userId: selectedUser,
          title: noticeTitle.trim(),
          message: noticeMessage.trim(),
          type: noticeType
        })
        toast.success('Private notice sent successfully')
      } else {
        const res = await adminService.sendPublicNotice({
          title: noticeTitle.trim(),
          message: noticeMessage.trim(),
          type: noticeType
        })
        toast.success(`Public notice sent to ${res.data.count} users`)
      }
      setNoticeTitle('')
      setNoticeMessage('')
      setSelectedUser('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notice')
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card text-center py-16 max-w-md">
          <FiAlertTriangle className="mx-auto text-5xl text-orange-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, posts, and send notices</p>
        </div>

        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.userCount}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiUsers className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Posts</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.activePosts}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiFileText className="text-2xl text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Open Reports</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{analytics.openReports}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <FiAlertTriangle className="text-2xl text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Chat Messages</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{analytics.chatMessageCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FiMessageSquare className="text-2xl text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'users', label: 'Manage Users', icon: FiUsers },
              { id: 'notices', label: 'Send Notices', icon: FiMail },
              { id: 'posts', label: 'Manage Posts', icon: FiFileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <span className="text-sm text-gray-500">{users.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{u.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {u.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="input-field py-1 px-3 text-sm"
                        >
                          <option value="farmer">Farmer</option>
                          <option value="expert">Scientist</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Notice</h2>
              
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setNoticeMode('private')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    noticeMode === 'private'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Private Notice
                </button>
                <button
                  onClick={() => setNoticeMode('public')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    noticeMode === 'public'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Public Notice
                </button>
              </div>

              <div className="space-y-4">
                {noticeMode === 'private' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select User
                    </label>
                    <select
                      className="input-field"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                    >
                      <option value="">-- Choose a user --</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter notice title"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notice Type
                  </label>
                  <select
                    className="input-field"
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="violation">Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    className="input-field min-h-[150px]"
                    placeholder="Write your notice..."
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="w-full btn-primary py-3"
                  onClick={handleSendNotice}
                >
                  {noticeMode === 'private' ? 'Send Private Notice' : 'Send Public Notice'}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-6">
                <FiMail className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Notice Tips</h3>
              </div>
              <div className="space-y-4 text-gray-600">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">Private Notices</p>
                  <p className="text-sm text-blue-700">Send notices to individual users privately.</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">Public Notices</p>
                  <p className="text-sm text-green-700">Broadcast notices to all users at once.</p>
                </div>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-900 mb-1">Notice Types</p>
                  <ul className="text-sm text-orange-700 list-disc ml-4">
                    <li>Info: General information</li>
                    <li>Warning: Important alerts</li>
                    <li>Violation: Rule violations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Post Management</h2>
              <span className="text-sm text-gray-500">{posts.length} posts</span>
            </div>
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {(post.user?.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {post.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {post.user?.role || 'user'} • {new Date(post.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-700">{post.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post._id)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
