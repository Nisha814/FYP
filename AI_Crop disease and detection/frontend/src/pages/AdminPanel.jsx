import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { adminService } from '../services/api'

const AdminPanel = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [noticeType, setNoticeType] = useState('warning')

  const loadData = async () => {
    try {
      const [usersRes, postsRes] = await Promise.all([adminService.getUsers(), adminService.getPosts()])
      setUsers(usersRes.data.users || [])
      setPosts(postsRes.data.posts || [])
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
      toast.success('User role updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post as admin?')) return
    try {
      await adminService.deletePost(postId)
      setPosts((prev) => prev.filter((post) => post._id !== postId))
      toast.success('Post deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    }
  }

  const handleSendNotice = async () => {
    if (!selectedUser || !noticeTitle.trim() || !noticeMessage.trim()) {
      toast.error('Select user and fill title/message')
      return
    }
    try {
      await adminService.sendNotice({
        userId: selectedUser,
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        type: noticeType
      })
      setNoticeTitle('')
      setNoticeMessage('')
      toast.success('Notice sent to user dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notice')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="max-w-3xl mx-auto py-8 px-4"><div className="card text-center py-10 text-gray-600">Admin access only.</div></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Control Panel</h1>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div key={u._id} className="border rounded p-3">
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-gray-600">{u.email}</p>
                <div className="mt-2">
                  <select className="input-field" value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}>
                    <option value="farmer">Farmer</option>
                    <option value="expert">Scientist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Send Notice</h2>
          <select className="input-field mb-3" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Select user</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
          <input className="input-field mb-3" placeholder="Notice title" value={noticeTitle} onChange={(e) => setNoticeTitle(e.target.value)} />
          <textarea className="input-field mb-3 min-h-[120px]" placeholder="Write notice..." value={noticeMessage} onChange={(e) => setNoticeMessage(e.target.value)} />
          <select className="input-field mb-3" value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="violation">Violation</option>
          </select>
          <button type="button" className="btn-primary" onClick={handleSendNotice}>Send Notice</button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Manage Posts</h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {posts.map((post) => (
            <div key={post._id} className="border rounded p-3">
              <p className="font-semibold">{post.user?.name || 'User'} ({post.user?.role || 'unknown'})</p>
              <p className="text-gray-700 mt-1">{post.content}</p>
              <button type="button" className="mt-2 text-sm text-red-600 hover:underline" onClick={() => handleDeletePost(post._id)}>
                Delete Post
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
