const User = require('../models/User');
const Post = require('../models/Post');
const Notice = require('../models/Notice');

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
