const Post = require('../models/Post');
const Notification = require('../models/Notification');
const ModeratorActionLog = require('../models/ModeratorActionLog');
const { getIO } = require('../socket');

const emitNotification = (userId, notification) => {
  const io = getIO();
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit('notification:new', notification);
};

exports.getPosts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 30);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('user', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching posts' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, plantType } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    const post = await Post.create({
      user: req.user.id,
      content: content.trim(),
      plantType: plantType || '',
      imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating post' });
  }
};

exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const hasLiked = post.likes.some((likeId) => likeId.toString() === userId);

    if (hasLiked) {
      post.likes = post.likes.filter((likeId) => likeId.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    if (!hasLiked && post.user.toString() !== userId) {
      const notification = await Notification.create({
        user: post.user,
        actor: userId,
        type: 'like',
        post: post._id,
        message: `${req.user.name} liked your post`
      });
      emitNotification(post.user, notification);
    }

    res.json({
      success: true,
      liked: !hasLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating like' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    post.comments.push({
      user: req.user.id,
      text: text.trim()
    });
    await post.save();

    if (post.user.toString() !== req.user.id) {
      const notification = await Notification.create({
        user: post.user,
        actor: req.user.id,
        type: 'comment',
        post: post._id,
        message: `${req.user.name} commented on your post`
      });
      emitNotification(post.user, notification);
    }

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.status(201).json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error adding comment' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.user.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: 'You can edit only your own posts' });
    }

    const { content, plantType } = req.body;
    if (content !== undefined) post.content = content.trim();
    if (plantType !== undefined) post.plantType = plantType;
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name')
      .populate('comments.user', 'name');

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isOwner = post.user.toString() === req.user.id;
    const isModerator = ['expert', 'admin'].includes(req.user.role);

    if (!isOwner && !isModerator) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    if (!isOwner) {
      const notification = await Notification.create({
        user: post.user,
        actor: req.user.id,
        type: 'moderation',
        post: post._id,
        message: `${req.user.name} removed your post (moderation action)`
      });
      emitNotification(post.user, notification);

      await ModeratorActionLog.create({
        moderator: req.user.id,
        targetPost: post._id,
        actionType: 'delete_post',
        notes: 'Post deleted by moderator action'
      });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting post' });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Report reason is required' });
    }

    const alreadyReported = post.reports.some((report) => report.reporter.toString() === req.user.id && report.status === 'open');
    if (alreadyReported) {
      return res.status(400).json({ message: 'You already have an open report for this post' });
    }

    post.reports.push({
      reporter: req.user.id,
      reason: reason.trim(),
      status: 'open'
    });
    await post.save();

    res.status(201).json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error reporting post' });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.status': 'open' })
      .populate('user', 'name role')
      .populate('reports.reporter', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching reported posts' });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { reportId, status } = req.body;
    const report = post.reports.id(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status' });
    }

    report.status = status;
    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();
    await post.save();

    await ModeratorActionLog.create({
      moderator: req.user.id,
      targetPost: post._id,
      actionType: status === 'resolved' ? 'resolve_report' : 'dismiss_report',
      reportId: report._id,
      notes: `Report marked as ${status}`
    });

    res.json({ success: true, message: 'Report updated' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error resolving report' });
  }
};

exports.getModeratorAuditLogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const search = (req.query.search || '').trim();
    const actionType = req.query.actionType || 'all';

    const filter = {};
    if (actionType !== 'all') {
      filter.actionType = actionType;
    }

    const logs = await ModeratorActionLog.find(filter)
      .populate('moderator', 'name role')
      .populate('targetPost', 'content')
      .sort({ createdAt: -1 });

    const searchedLogs = search
      ? logs.filter((log) => {
          const moderatorName = log.moderator?.name?.toLowerCase() || '';
          const action = log.actionType?.toLowerCase() || '';
          const notes = log.notes?.toLowerCase() || '';
          const postContent = log.targetPost?.content?.toLowerCase() || '';
          const searchText = search.toLowerCase();
          return moderatorName.includes(searchText) || action.includes(searchText) || notes.includes(searchText) || postContent.includes(searchText);
        })
      : logs;

    const total = searchedLogs.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;
    const paginatedLogs = searchedLogs.slice(skip, skip + limit);

    res.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasMore: skip + paginatedLogs.length < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching moderator audit logs' });
  }
};
