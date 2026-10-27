const mongoose = require('mongoose');
const { genId } = require('../utils/genId');

const seatTicketSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ['lower', 'middle', 'balcony', 'standard'],
      default: 'middle',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true,
      default: () => genId('BKG'),
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Booking must be associated with a Show'],
    },
    showId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a registered User'],
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    ticketsData: {
      seats: {
        type: [seatTicketSchema],
        required: true,
        validate: {
          validator: (v) => Array.isArray(v) && v.length > 0,
          message: 'A booking must contain at least one seat in ticketsData.seats',
        },
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward compatibility virtuals for existing frontend
bookingSchema.virtual('seats').get(function () {
  return this.ticketsData?.seats?.map((s) => s.seatId) || [];
});
bookingSchema.virtual('totalAmount').get(function () {
  return this.ticketsData?.totalAmount || 0;
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ userEmail: 1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ bookingId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
