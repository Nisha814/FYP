import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiShield } from 'react-icons/fi'
import { socialService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ModeratorDashboard = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditSearch, setAuditSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [auditPage, setAuditPage] = useState(1)
  const [auditLimit, setAuditLimit] = useState(10)
  const [auditPagination, setAuditPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })

  const loadReports = async () => {
    try {
      const [reportResponse, auditResponse] = await Promise.all([
        socialService.getReportedPosts(),
        socialService.getModeratorAuditLogs({
          search: auditSearch,
          actionType: actionFilter,
          page: auditPage,
          limit: auditLimit
        })
      ])
      const response = reportResponse
      setPosts(response.data.posts || [])
      setAuditLogs(auditResponse.data.logs || [])
      setAuditPagination(
        auditResponse.data.pagination || {
          page: 1,
          totalPages: 1,
          total: 0
        }
      )
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reported posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [auditSearch, actionFilter, auditPage, auditLimit])

  const resolveReport = async (postId, reportId, status) => {
    try {
      await socialService.resolveReport(postId, reportId, status)
      setPosts((prev) =>
        prev
          .map((post) => {
            if (post._id !== postId) return post
            return {
              ...post,
              reports: (post.reports || []).map((report) =>
                report._id === reportId
                  ? { ...report, status, reviewedBy: user?.id, reviewedAt: new Date().toISOString() }
                  : report
              )
            }
          })
          .filter((post) => post.reports?.some((report) => report.status === 'open'))
      )
      setAuditLogs((prev) => [
        {
          _id: `${Date.now()}-${reportId}`,
          actionType: status === 'resolved' ? 'resolve_report' : 'dismiss_report',
          moderator: { name: user?.name, role: user?.role },
          targetPost: { content: 'Recently reviewed post' },
          createdAt: new Date().toISOString()
        },
        ...prev
      ])
      loadReports()
      toast.success('Report updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update report')
    }
  }

  if (!['expert', 'admin'].includes(user?.role)) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="card text-center py-10 text-gray-600">Moderator access only.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderator Dashboard</h1>
      <p className="text-gray-600 mb-6">Review reported community posts.</p>

      {posts.length === 0 ? (
        <div className="card text-center py-10 text-gray-500">
          <FiShield className="mx-auto text-4xl mb-2 text-gray-400" />
          No open reports.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const openReports = (post.reports || []).filter((report) => report.status === 'open')
            return (
              <div key={post._id} className="card">
                <p className="font-semibold text-gray-900 mb-1">Post by {post.user?.name}</p>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                <div className="space-y-3">
                  {openReports.map((report) => (
                    <div key={report._id} className="border rounded p-3 bg-gray-50">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">Reporter:</span> {report.reporter?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">Reason:</span> {report.reason}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          className="btn-primary text-sm"
                          type="button"
                          onClick={() => resolveReport(post._id, report._id, 'resolved')}
                        >
                          Resolve
                        </button>
                        <button
                          className="btn-secondary text-sm"
                          type="button"
                          onClick={() => resolveReport(post._id, report._id, 'dismissed')}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Moderator Audit Log</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            className="input-field"
            placeholder="Search by moderator, action, notes..."
            value={auditSearch}
            onChange={(e) => {
              setAuditSearch(e.target.value)
              setAuditPage(1)
            }}
          />
          <select
            className="input-field"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setAuditPage(1)
            }}
          >
            <option value="all">All actions</option>
            <option value="delete_post">Delete post</option>
            <option value="resolve_report">Resolve report</option>
            <option value="dismiss_report">Dismiss report</option>
          </select>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <select
            className="input-field max-w-[180px]"
            value={auditLimit}
            onChange={(e) => {
              setAuditLimit(Number(e.target.value))
              setAuditPage(1)
            }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <span className="text-sm text-gray-600">Total: {auditPagination.total}</span>
        </div>
        {auditLogs.length === 0 ? (
          <div className="card text-gray-500">No audit actions yet.</div>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log._id} className="card">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{log.moderator?.name || 'Moderator'}</span> performed{' '}
                  <span className="font-semibold">{log.actionType.replace('_', ' ')}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAuditPage((prev) => Math.max(prev - 1, 1))}
            disabled={auditPagination.page <= 1}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {auditPagination.page} of {auditPagination.totalPages || 1}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setAuditPage((prev) => Math.min(prev + 1, auditPagination.totalPages || 1))}
            disabled={auditPagination.page >= (auditPagination.totalPages || 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModeratorDashboard
