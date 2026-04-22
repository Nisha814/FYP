const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === 'true';
    const filter = { user: req.user.id };
    if (!includeArchived) {
      filter.isArchived = false;
    }

    const notifications = await Notification.find(filter)
      .populate('actor', 'name')
      .populate('post', '_id content')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching notifications' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false, isArchived: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating notifications' });
  }
};

exports.updateNotificationReadStatus = async (req, res) => {
  try {
    const { isRead } = req.body;
    if (typeof isRead !== 'boolean') {
      return res.status(400).json({ message: 'isRead must be a boolean value' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isRead } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({
      success: true,
      notification,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating notification status' });
  }
};

exports.bulkArchiveNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    await Notification.updateMany(
      { _id: { $in: ids }, user: req.user.id },
      { $set: { isArchived: true, archivedAt: new Date() } }
    );

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({ success: true, message: 'Notifications archived', unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error archiving notifications' });
  }
};

exports.bulkDeleteNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    await Notification.deleteMany({ _id: { $in: ids }, user: req.user.id });

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({ success: true, message: 'Notifications deleted', unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting notifications' });
  }
};

exports.archiveNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { isArchived: true, archivedAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({ success: true, notification, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error archiving notification' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
      isArchived: false
    });

    res.json({ success: true, message: 'Notification deleted', unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting notification' });
  }
};
