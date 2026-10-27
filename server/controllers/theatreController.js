const Theatre = require('../models/Theatre');

const getAllTheatres = async (req, res, next) => {
  try {
    const theatres = await Theatre.find().sort({ theatreName: 1 });
    return res.status(200).json({
      success: true,
      count: theatres.length,
      data: theatres,
    });
  } catch (error) {
    next(error);
  }
};

const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    return res.status(200).json({ success: true, data: theatre });
  } catch (error) {
    next(error);
  }
};

const createTheatre = async (req, res, next) => {
  try {
    const {
      theatreName,
      adminName,
      city,
      address,
      lowerSeats,
      middleSeats,
      balconySeats,
      lowerSeatPrice,
      middleSeatPrice,
      balconySeatPrice,
    } = req.body;

    const theatre = await Theatre.create({
      theatreName,
      adminName: adminName || req.user.username,
      location: {
        city: city || 'Metropolis',
        address: address || 'Main Road',
      },
      lowerSeats: Number(lowerSeats) || 20,
      middleSeats: Number(middleSeats) || 30,
      balconySeats: Number(balconySeats) || 10,
      lowerSeatPrice: Number(lowerSeatPrice) || 150,
      middleSeatPrice: Number(middleSeatPrice) || 250,
      balconySeatPrice: Number(balconySeatPrice) || 400,
      createdBy: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTheatres,
  getTheatreById,
  createTheatre,
};
