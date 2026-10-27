const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.post('/toggle', protect, toggleFavorite);
router.get('/', protect, getMyFavorites);
router.get('/check/:movieId', protect, checkFavorite);

module.exports = router;
