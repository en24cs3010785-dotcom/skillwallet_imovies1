const Movie = require('../models/Movie');

const getAllMovies = async (req, res, next) => {
  try {
    const { search, genre, certification } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { movieName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') {
      filter.genres = genre;
    }

    if (certification && certification !== 'All') {
      filter.certification = certification;
    }

    const movies = await Movie.find(filter)
      .populate('shows')
      .sort({ releaseDate: -1 });

    return res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).populate({
      path: 'shows',
      populate: { path: 'theatre' },
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const {
      movieName,
      title,
      genres,
      genre,
      runtime,
      duration,
      certification,
      description,
      poster,
      media,
      releaseDate,
    } = req.body;

    const finalName = (movieName || title || '').trim();
    if (!finalName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movieName',
      });
    }

    // Standardize genres
    let finalGenres = [];
    if (Array.isArray(genres)) {
      finalGenres = genres;
    } else if (typeof genres === 'string') {
      finalGenres = genres.split(',').map((g) => g.trim());
    } else if (genre) {
      finalGenres = [genre];
    }

    const movie = await Movie.create({
      movieName: finalName,
      genres: finalGenres,
      runtime: Number(runtime || duration || 120),
      certification: certification || 'UA',
      description: description || '',
      releaseDate: releaseDate || new Date(),
      media: {
        poster: media?.poster || poster || '',
        banner: media?.banner || '',
        trailerUrl: media?.trailerUrl || '',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
