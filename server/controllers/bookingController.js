const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { buildSeatMap, priceOf } = require('../utils/seats');

/**
 * @route POST /api/bookings
 * @desc  Create a seat reservation with atomic concurrency guard and server-side pricing
 */
const createBooking = async (req, res, next) => {
  let reservedSeats = [];
  let reservedShowId = null;

  try {
    const { showId, seats } = req.body;

    // Only customers can book (admin ids do not exist in the User collection)
    if (req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot book tickets. Please log in as a customer.' });
    }

    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide showId and an array of seats (e.g. ["L1","M5"])' });
    }

    if (!mongoose.Types.ObjectId.isValid(showId)) {
      return res.status(400).json({ success: false, message: 'This showtime is not available on the server. Refresh the page and pick a showtime again.' });
    }

    // Clean + validate seat ids (strings, no duplicates)
    const cleanSeats = [...new Set(seats.map((s) => String(s).trim().toUpperCase()))];
    if (cleanSeats.length !== seats.length) {
      return res.status(400).json({ success: false, message: 'Duplicate seats in request' });
    }

    const show = await Show.findById(showId).populate('theatre').populate('movie');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    if (!show.theatre) {
      return res.status(400).json({ success: false, message: 'The theatre for this show no longer exists' });
    }

    // Every seat must exist in this theatre's seat map
    const map = buildSeatMap(show.theatre);
    const validIds = new Set([...map.lower, ...map.middle, ...map.balcony].map((s) => s.seatId));
    const invalid = cleanSeats.filter((s) => !validIds.has(s));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid seat(s) for this theatre: ${invalid.join(', ')}` });
    }

    // No booking for past shows
    const [year, month, day] = String(show.showdate).split('-').map(Number);
    const [hours, minutes] = String(show.showtime).split(':').map(Number);
    if (year && month && day && !Number.isNaN(hours) && !Number.isNaN(minutes)) {
      if (new Date(year, month - 1, day, hours, minutes) < new Date()) {
        return res.status(400).json({ success: false, message: 'This showtime has already passed. Please select an upcoming screening.' });
      }
    }

    // ATOMIC reservation: succeeds only if NONE of the seats is already booked
    const updatedShow = await Show.findOneAndUpdate(
      { _id: show._id, 'tickets.bookedSeats': { $nin: cleanSeats } },
      { $addToSet: { 'tickets.bookedSeats': { $each: cleanSeats } } },
      { new: true }
    );
    if (!updatedShow) {
      return res.status(409).json({ success: false, message: 'One or more selected seats were just booked by someone else. Please pick different seats.' });
    }
    reservedSeats = cleanSeats;
    reservedShowId = show._id;

    // Server-computed pricing (never trust the client)
    const seatsData = cleanSeats.map((seatId) => ({ seatId, ...priceOf(seatId, show.theatre) }));
    const totalAmount = seatsData.reduce((sum, item) => sum + item.price, 0);

    const booking = await Booking.create({
      show: show._id,
      showId: show.showId || String(show._id),
      user: req.user.id,
      userEmail: req.user.email,
      ticketsData: { seats: seatsData, totalAmount },
      status: 'confirmed',
    });
    reservedSeats = []; // booking saved: keep the seats reserved

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'show',
      populate: [
        { path: 'movie', select: 'movieName title media runtime certification genres' },
        { path: 'theatre', select: 'theatreName location lowerSeatPrice middleSeatPrice balconySeatPrice' },
      ],
    });

    return res.status(201).json({ success: true, message: 'Tickets booked successfully! Enjoy the show.', data: populatedBooking });
  } catch (error) {
    console.error('[createBooking] failed:', error);
    // ROLLBACK: if anything failed after reserving, release the seats again
    if (reservedSeats.length > 0 && reservedShowId) {
      await Show.updateOne({ _id: reservedShowId }, { $pull: { 'tickets.bookedSeats': { $in: reservedSeats } } }).catch(() => {});
    }
    next(error);
  }
};

/**
 * @route GET /api/bookings/my-bookings
 * @desc  Fetch current user reservations
 */
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'movieName title media runtime certification genres' },
          { path: 'theatre', select: 'theatreName location' },
        ],
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/bookings/:id/cancel
 * @desc  Cancel reservation and release reserved seats from show
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only cancel your own bookings',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Release seats strictly on this show's tickets.bookedSeats
    const seatIds = booking.ticketsData?.seats?.map((s) => s.seatId) || [];
    await Show.findByIdAndUpdate(booking.show, {
      $pull: { 'tickets.bookedSeats': { $in: seatIds } },
    });

    return res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled and seats have been released.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
};
