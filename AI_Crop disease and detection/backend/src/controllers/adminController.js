const User = require('../models/User');
const Post = require('../models/Post');
const Notice = require('../models/Notice');
const ChatMessage = require('../models/ChatMessage');
const Prediction = require('../models/Prediction');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email role location createdAt').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching users' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'expert', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: Date.now() },
      { new: true }
    ).select('name email role location createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating user role' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name role')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching posts' });
  }
};

exports.deletePostAsAdmin = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting post' });
  }
};

exports.sendNotice = async (req, res) => {
  try {
    const { userId, title, message, type, relatedPost } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    const notice = await Notice.create({
      user: userId,
      title: title.trim(),
      message: message.trim(),
      type: type || 'info',
      relatedPost,
      fromAdmin: req.user.id
    });

    res.status(201).json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending notice' });
  }
};

exports.sendPublicNotice = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'title and message are required' });
    }

    const users = await User.find().select('_id');
    
    const notices = await Notice.insertMany(
      users.map(user => ({
        user: user._id,
        title: title.trim(),
        message: message.trim(),
        type: type || 'info',
        isPublic: true,
        fromAdmin: req.user.id
      }))
    );

    res.status(201).json({ success: true, notices, count: notices.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending public notice' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const activePosts = await Post.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const totalReports = await Post.aggregate([
      { $unwind: '$reports' },
      { $count: 'total' }
    ]);
    const openReports = await Post.aggregate([
      { $unwind: '$reports' },
      { $match: { 'reports.status': 'open' } },
      { $count: 'total' }
    ]);
    const predictionCount = await Prediction.countDocuments();
    const chatMessageCount = await ChatMessage.countDocuments();

    res.json({
      success: true,
      analytics: {
        userCount,
        postCount,
        activePosts,
        totalReports: totalReports.length > 0 ? totalReports[0].total : 0,
        openReports: openReports.length > 0 ? openReports[0].total : 0,
        predictionCount,
        chatMessageCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching analytics' });
  }
};
