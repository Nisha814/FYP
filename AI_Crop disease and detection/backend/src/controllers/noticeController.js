const Notice = require('../models/Notice');

exports.getMyNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ user: req.user.id })
      .populate('fromAdmin', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notice.countDocuments({ user: req.user.id, isRead: false });

    res.json({ success: true, notices, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching notices' });
  }
};

exports.markNoticeRead = async (req, res) => {
  try {
    const notice = await Notice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating notice' });
  }
};
