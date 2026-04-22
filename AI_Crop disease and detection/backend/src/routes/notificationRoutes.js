const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAllAsRead,
  updateNotificationReadStatus,
  archiveNotification,
  deleteNotification,
  bulkArchiveNotifications,
  bulkDeleteNotifications
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/bulk-archive', bulkArchiveNotifications);
router.delete('/bulk-delete', bulkDeleteNotifications);
router.patch('/:id', updateNotificationReadStatus);
router.patch('/:id/archive', archiveNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
