const express = require('express');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  getUsers,
  updateUserRole,
  getAllPosts,
  deletePostAsAdmin,
  sendNotice
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePostAsAdmin);
router.post('/notices', sendNotice);

module.exports = router;
