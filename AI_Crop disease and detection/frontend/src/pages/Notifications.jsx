import { useEffect, useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { notificationService } from '../services/api'
import toast from 'react-hot-toast'
import { getSocket } from '../services/socket'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({ includeArchived: showArchived })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
      setSelectedIds([])
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [showArchived])

  useEffect(() => {
    const socket = getSocket()
    const onNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    }
    socket.on('notification:new', onNewNotification)
    return () => {
      socket.off('notification:new', onNewNotification)
    }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to update notifications')
    }
  }

  const toggleNotificationRead = async (id, nextIsRead) => {
    try {
      const response = await notificationService.updateReadStatus(id, nextIsRead)
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: nextIsRead } : item))
      )
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      toast.error('Failed to update notification state')
    }
  }

  const handleArchiveNotification = async (id) => {
    try {
      const response = await notificationService.archive(id)
      setNotifications((prev) => prev.filter((item) => item._id !== id))
      setUnreadCount(response.data.unreadCount || 0)
      toast.success('Notification archived')
    } catch (error) {
      toast.error('Failed to archive notification')
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id)
      setNotifications((prev) => prev.filter((item) => item._id !== id))
      setUnreadCount(response.data.unreadCount || 0)
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }

  const toggleSelected = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([])
      return
    }
    setSelectedIds(notifications.map((item) => item._id))
  }

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return
    try {
      const response = await notificationService.bulkArchive(selectedIds)
      setNotifications((prev) => prev.filter((item) => !selectedIds.includes(item._id)))
      setSelectedIds([])
      setUnreadCount(response.data.unreadCount || 0)
      toast.success('Selected notifications archived')
    } catch (error) {
      toast.error('Failed to archive selected notifications')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    try {
      const response = await notificationService.bulkDelete(selectedIds)
      setNotifications((prev) => prev.filter((item) => !selectedIds.includes(item._id)))
      setSelectedIds([])
      setUnreadCount(response.data.unreadCount || 0)
      toast.success('Selected notifications deleted')
    } catch (error) {
      toast.error('Failed to delete selected notifications')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Unread: {unreadCount}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
        <button type="button" className="btn-secondary" onClick={() => setShowArchived((prev) => !prev)}>
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>
      {notifications.length > 0 ? (
        <div className="flex items-center gap-3 mb-4">
          <button type="button" className="btn-secondary" onClick={toggleSelectAll}>
            {selectedIds.length === notifications.length ? 'Unselect All' : 'Select All'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleBulkArchive} disabled={selectedIds.length === 0}>
            Archive Selected
          </button>
          <button type="button" className="btn-secondary" onClick={handleBulkDelete} disabled={selectedIds.length === 0}>
            Delete Selected
          </button>
        </div>
      ) : null}

      {notifications.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">
          <FiBell className="mx-auto text-4xl mb-2 text-gray-400" />
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div key={item._id} className={`card ${item.isRead ? 'opacity-80' : 'border-primary-300'}`}>
              <label className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item._id)}
                  onChange={() => toggleSelected(item._id)}
                />
                Select
              </label>
              <p className="text-gray-900">{item.message}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
              <button
                type="button"
                className="mt-2 text-xs text-primary-600 hover:underline"
                onClick={() => toggleNotificationRead(item._id, !item.isRead)}
              >
                Mark as {item.isRead ? 'unread' : 'read'}
              </button>
              {!item.isArchived ? (
                <button
                  type="button"
                  className="mt-2 ml-3 text-xs text-gray-600 hover:underline"
                  onClick={() => handleArchiveNotification(item._id)}
                >
                  Archive
                </button>
              ) : null}
              <button
                type="button"
                className="mt-2 ml-3 text-xs text-red-600 hover:underline"
                onClick={() => handleDeleteNotification(item._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
