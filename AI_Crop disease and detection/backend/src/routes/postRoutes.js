const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  toggleLikePost,
  addComment,
  updatePost,
  deletePost,
  reportPost,
  getReportedPosts,
  resolveReport,
  getModeratorAuditLogs
} = require('../controllers/postController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

router.use(protect);
router.get('/', getPosts);
router.post('/', upload.single('image'), createPost);
router.get('/moderation/reported', authorizeRoles('admin'), getReportedPosts);
router.patch('/moderation/:id/report', authorizeRoles('admin'), resolveReport);
router.get('/moderation/audit', authorizeRoles('admin'), getModeratorAuditLogs);
router.post('/:id/like', toggleLikePost);
router.post('/:id/comments', addComment);
router.post('/:id/report', reportPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

module.exports = router;
