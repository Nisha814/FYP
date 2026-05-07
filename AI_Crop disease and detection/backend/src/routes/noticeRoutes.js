const express = require('express');
const { protect } = require('../middleware/auth');
const { getMyNotices, markNoticeRead } = require('../controllers/noticeController');

const router = express.Router();
router.use(protect);
router.get('/', getMyNotices);
router.patch('/:id/read', markNoticeRead);

module.exports = router;
