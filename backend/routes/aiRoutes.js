const express = require('express');
const router = express.Router();
const { chatWithGrok, processVideo } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes are protected
router.use(protect);

// POST /api/ai/chat
router.post('/chat', chatWithGrok);

// POST /api/ai/process
router.post('/process', processVideo);

module.exports = router;
