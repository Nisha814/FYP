import { useCallback, useEffect, useRef, useState } from 'react'
import { FiHeart, FiMessageCircle, FiImage, FiSend, FiEdit2, FiTrash2, FiFlag } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { socialService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const Social = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [plantType, setPlantType] = useState('')
  const [image, setImage] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [pagination, setPagination] = useState({ page: 1, hasMore: true })
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingPostId, setEditingPostId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editPlantType, setEditPlantType] = useState('')
  const [reportReasons, setReportReasons] = useState({})
  const observerRef = useRef(null)

  useEffect(() => {
    loadPosts(1, true)
  }, [])

  const loadPosts = async (page = 1, replace = false) => {
    try {
      if (page > 1) setLoadingMore(true)
      const response = await socialService.getPosts({ page, limit: 5 })
      const nextPosts = response.data.posts || []
      setPosts((prev) => (replace ? nextPosts : [...prev, ...nextPosts]))
      setPagination({
        page: response.data.pagination?.page || page,
        hasMore: response.data.pagination?.hasMore || false
      })
    } catch (error) {
      toast.error('Failed to load social posts')
    } finally {
      setLoadingMore(false)
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      toast.error('Write something before posting')
      return
    }

    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      if (plantType.trim()) formData.append('plantType', plantType.trim())
      if (image) formData.append('image', image)

      const response = await socialService.createPost(formData)
      setPosts((prev) => [response.data.post, ...prev])
      setContent('')
      setPlantType('')
      setImage(null)
      toast.success('Post shared with the community')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post')
    }
  }

  const loadMorePosts = useCallback(async () => {
    if (!pagination.hasMore || loadingMore) return
    await loadPosts(pagination.page + 1, false)
  }, [pagination, loadingMore])

  useEffect(() => {
    if (!observerRef.current) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMorePosts()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [loadMorePosts])

  const handleToggleLike = async (postId) => {
    try {
      const response = await socialService.toggleLike(postId)
      const { liked } = response.data
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id !== postId) return post
          const likes = post.likes || []
          const withoutUser = likes.filter((likeId) => likeId !== user?.id)
          return {
            ...post,
            likes: liked ? [...withoutUser, user?.id] : withoutUser
          }
        })
      )
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleAddComment = async (postId) => {
    const text = commentDrafts[postId]?.trim()
    if (!text) return

    try {
      const response = await socialService.addComment(postId, text)
      setPosts((prev) => prev.map((post) => (post._id === postId ? response.data.post : post)))
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    }
  }

  const startEditPost = (post) => {
    setEditingPostId(post._id)
    setEditContent(post.content || '')
    setEditPlantType(post.plantType || '')
  }

  const handleSavePostEdit = async (postId) => {
    if (!editContent.trim()) {
      toast.error('Post content cannot be empty')
      return
    }
    try {
      const response = await socialService.updatePost(postId, {
        content: editContent.trim(),
        plantType: editPlantType.trim()
      })
      setPosts((prev) => prev.map((p) => (p._id === postId ? response.data.post : p)))
      setEditingPostId(null)
      toast.success('Post updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await socialService.deletePost(postId)
      setPosts((prev) => prev.filter((post) => post._id !== postId))
      toast.success('Post deleted')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    }
  }

  const handleReportPost = async (postId) => {
    const reason = reportReasons[postId]?.trim()
    if (!reason) {
      toast.error('Please provide a report reason')
      return
    }
    try {
      await socialService.reportPost(postId, reason)
      setReportReasons((prev) => ({ ...prev, [postId]: '' }))
      toast.success('Post reported to moderators')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to report post')
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
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Plant Community</h1>
      <p className="text-gray-600 mb-6">Share updates, ask questions, and help other growers.</p>

      <form onSubmit={handleCreatePost} className="card mb-6 space-y-4">
        <textarea
          className="input-field min-h-[100px]"
          placeholder="Share what is happening in your farm or garden..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="text"
            className="input-field"
            placeholder="Plant type (optional)"
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
          />
          <label className="input-field flex items-center justify-between cursor-pointer">
            <span className="text-sm text-gray-600 truncate">{image ? image.name : 'Attach image (optional)'}</span>
            <FiImage className="text-gray-500" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </label>
        </div>
        <button type="submit" className="btn-primary inline-flex items-center">
          <FiSend className="mr-2" /> Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card text-center text-gray-500 py-10">No posts yet. Be the first to share.</div>
        ) : (
          posts.map((post) => {
            const likedByMe = (post.likes || []).includes(user?.id)
            const isOwner = post.user?._id === user?.id
            const isModerator = ['expert', 'admin'].includes(user?.role)
            const canDelete = isOwner || isModerator
            return (
              <div key={post._id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{post.user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  {post.plantType ? (
                    <span className="px-2 py-1 text-xs rounded bg-primary-100 text-primary-700">{post.plantType}</span>
                  ) : null}
                </div>
                {editingPostId === post._id ? (
                  <div className="space-y-2 mb-3">
                    <textarea
                      className="input-field min-h-[90px]"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={editPlantType}
                      onChange={(e) => setEditPlantType(e.target.value)}
                      placeholder="Plant type"
                    />
                    <div className="flex gap-2">
                      <button className="btn-primary" type="button" onClick={() => handleSavePostEdit(post._id)}>
                        Save
                      </button>
                      <button className="btn-secondary" type="button" onClick={() => setEditingPostId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                )}
                {post.imageUrl ? (
                  <img
                    src={`${API_BASE}${post.imageUrl}`}
                    alt="post"
                    className="w-full max-h-80 object-cover rounded-lg mb-3"
                  />
                ) : null}
                <div className="flex items-center gap-4 mb-3">
                  <button
                    className={`inline-flex items-center text-sm ${likedByMe ? 'text-red-600' : 'text-gray-600'}`}
                    onClick={() => handleToggleLike(post._id)}
                  >
                    <FiHeart className="mr-1" /> {(post.likes || []).length}
                  </button>
                  <span className="inline-flex items-center text-sm text-gray-600">
                    <FiMessageCircle className="mr-1" /> {(post.comments || []).length}
                  </span>
                </div>
                {(isOwner || canDelete) && editingPostId !== post._id ? (
                  <div className="flex gap-2 mb-3">
                    {isOwner ? (
                      <button
                        type="button"
                        className="inline-flex items-center text-sm text-blue-600"
                        onClick={() => startEditPost(post)}
                      >
                        <FiEdit2 className="mr-1" /> Edit
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className="inline-flex items-center text-sm text-red-600"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
                <div className="space-y-2 mb-3">
                  {(post.comments || []).slice(-3).map((comment) => (
                    <div key={comment._id} className="bg-gray-50 rounded p-2 text-sm">
                      <span className="font-semibold">{comment.user?.name || 'User'}: </span>
                      <span className="text-gray-700">{comment.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Write a comment..."
                    value={commentDrafts[post._id] || ''}
                    onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                  />
                  <button className="btn-secondary" onClick={() => handleAddComment(post._id)} type="button">
                    Comment
                  </button>
                </div>
                {!isOwner ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Report reason (if needed)"
                      value={reportReasons[post._id] || ''}
                      onChange={(e) => setReportReasons((prev) => ({ ...prev, [post._id]: e.target.value }))}
                    />
                    <button className="btn-secondary inline-flex items-center" type="button" onClick={() => handleReportPost(post._id)}>
                      <FiFlag className="mr-1" /> Report
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
      <div ref={observerRef} className="h-8" />
      {loadingMore ? <p className="text-center text-gray-500 mt-2">Loading more posts...</p> : null}
      {!pagination.hasMore && posts.length > 0 ? (
        <p className="text-center text-gray-400 mt-2">You have reached the end.</p>
      ) : null}
    </div>
  )
}

export default Social
