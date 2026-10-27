const Show = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie = require('../models/Movie');
const { buildSeatMap } = require('../utils/seats');

const getAllShows = async (req, res, next) => {
  try {
    const shows = await Show.find()
      .populate('theatre')
      .populate('movie')
      .sort({ showdate: 1, showtime: 1 });

    return res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

const getShowsByMovie = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { date } = req.query;

    const query = {
      $or: [{ movie: movieId }, { movieId: movieId }],
    };
    if (date) {
      query.showdate = date;
    }

    const shows = await Show.find(query)
      .populate('theatre')
      .populate('movie')
      .sort({ showtime: 1 });

    return res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    // Attach full seat map with tiers and prices
    const seatMap = show.theatre ? buildSeatMap(show.theatre) : null;

    return res.status(200).json({
      success: true,
      data: {
        ...show.toObject(),
        seatMap,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createShow = async (req, res, next) => {
  try {
    const {
      movie,
      movieId,
      theatre,
      theatreId,
      showdate,
      date,
      showtime,
      time,
      adminEmail,
    } = req.body;

    const movieDoc = await Movie.findById(movie || movieId);
    if (!movieDoc) {
      return res.status(400).json({ success: false, message: 'Valid movie is required' });
    }

    const theatreDoc = await Theatre.findById(theatre || theatreId);
    if (!theatreDoc) {
      return res.status(400).json({ success: false, message: 'Valid theatre is required' });
    }

    const finalDate = showdate || date;
    const finalTime = showtime || time;

    // Check duplicate slot
    const existing = await Show.findOne({
      theatre: theatreDoc._id,
      showdate: finalDate,
      showtime: finalTime,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `This theatre slot (${theatreDoc.theatreName} on ${finalDate} at ${finalTime}) is already booked for another screening!`,
      });
    }

    const show = await Show.create({
      movie: movieDoc._id,
      movieId: movieDoc.movieId,
      theatre: theatreDoc._id,
      theatreName: theatreDoc.theatreName,
      adminEmail: adminEmail || req.user.email,
      showdate: finalDate,
      showtime: finalTime,
      tickets: {
        bookedSeats: [],
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShows,
  getShowsByMovie,
  getShowById,
  createShow,
  deleteShow,
};
