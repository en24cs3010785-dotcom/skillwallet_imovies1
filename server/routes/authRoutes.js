const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  registerAdmin,
  getProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/register', registerAdmin);
router.get('/profile', protect, getProfile);

module.exports = router;
