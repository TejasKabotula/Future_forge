const express = require('express');
const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

console.log('LOADING AUTH ROUTES...');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/quiz-result', protect, require('../controllers/authController').saveQuizResult);

// Duplicate as POST for debugging
router.post('/profile-post', protect, updateProfile);
router.post('/profile-no-auth', updateProfile);

module.exports = router;
