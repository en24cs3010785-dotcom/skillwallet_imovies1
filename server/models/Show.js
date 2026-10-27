const mongoose = require('mongoose');
const { genId } = require('../utils/genId');

const showSchema = new mongoose.Schema(
  {
    showId: {
      type: String,
      unique: true,
      required: true,
      default: () => genId('SHW'),
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Show must be linked to a Movie'],
    },
    movieId: {
      type: String,
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Show must be linked to a Theatre'],
    },
    theatreName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    showdate: {
      type: String, // "YYYY-MM-DD"
      required: [true, 'Show date is required (YYYY-MM-DD)'],
    },
    showtime: {
      type: String, // "HH:mm"
      required: [true, 'Show time is required (HH:mm)'],
    },
    tickets: {
      bookedSeats: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward compatibility virtuals for existing frontend
showSchema.virtual('date').get(function () {
  return this.showdate;
});
showSchema.virtual('time').get(function () {
  return this.showtime;
});
showSchema.virtual('bookedSeats').get(function () {
  return this.tickets?.bookedSeats || [];
});

// CRITICAL: Unique compound index on (theatre, showdate, showtime) to stop duplicate slots
showSchema.index({ theatre: 1, showdate: 1, showtime: 1 }, { unique: true });
showSchema.index({ movie: 1, showdate: 1 });
showSchema.index({ showId: 1 });

module.exports = mongoose.model('Show', showSchema);
