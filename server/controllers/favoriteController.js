const Favorite = require('../models/Favorite');
const Movie = require('../models/Movie');

const toggleFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!movieId) {
      return res.status(400).json({ success: false, message: 'movieId is required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const existing = await Favorite.findOne({ userEmail, movieId: movie.movieId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return res.status(200).json({
        success: true,
        isFavorited: false,
        message: 'Movie removed from favorites',
      });
    }

    const fav = await Favorite.create({
      user: userId,
      userEmail,
      movie: movie._id,
      movieId: movie.movieId,
    });

    return res.status(201).json({
      success: true,
      isFavorited: true,
      message: 'Movie added to favorites',
      data: fav,
    });
  } catch (error) {
    next(error);
  }
};

const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('movie')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

const checkFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const fav = await Favorite.findOne({
      user: req.user.id,
      $or: [{ movie: movieId }, { movieId: movieId }],
    });

    return res.status(200).json({
      success: true,
      isFavorited: !!fav,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleFavorite,
  getMyFavorites,
  checkFavorite,
};
