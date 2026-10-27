const express = require('express');
const router = express.Router();
const {
  getAllShows,
  getShowsByMovie,
  getShowById,
  createShow,
  deleteShow,
} = require('../controllers/showController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllShows);
router.get('/movie/:movieId', getShowsByMovie);
router.get('/:id', getShowById);
router.post('/', protect, adminOnly, createShow);
router.delete('/:id', protect, adminOnly, deleteShow);

module.exports = router;
