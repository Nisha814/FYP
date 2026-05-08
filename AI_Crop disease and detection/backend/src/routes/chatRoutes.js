const express = require('express');
const { protect } = require('../middleware/auth');
const { askAssistant, getChatHistory, clearChatHistory } = require('../controllers/chatController');

const router = express.Router();
router.use(protect);
router.post('/', askAssistant);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

module.exports = router;
