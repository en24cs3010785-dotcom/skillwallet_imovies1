const express = require('express');
const router = express.Router();
const {
  getAllTheatres,
  getTheatreById,
  createTheatre,
} = require('../controllers/theatreController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllTheatres);
router.get('/:id', getTheatreById);
router.post('/', protect, adminOnly, createTheatre);

module.exports = router;
