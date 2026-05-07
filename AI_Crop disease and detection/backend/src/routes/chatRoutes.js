const express = require('express');
const { protect } = require('../middleware/auth');
const { askAssistant } = require('../controllers/chatController');

const router = express.Router();
router.use(protect);
router.post('/', askAssistant);

module.exports = router;
