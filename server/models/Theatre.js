const mongoose = require('mongoose');
const { genId } = require('../utils/genId');

const theatreSchema = new mongoose.Schema(
  {
    theatreId: {
      type: String,
      unique: true,
      required: true,
      default: () => genId('THR'),
    },
    theatreName: {
      type: String,
      required: [true, 'Please enter theatre name'],
      trim: true,
    },
    adminName: {
      type: String,
      required: [true, 'Please specify the theatre administrator name'],
      trim: true,
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please specify city'],
        trim: true,
      },
      address: {
        type: String,
        required: [true, 'Please specify address'],
        trim: true,
      },
    },
    lowerSeats: {
      type: Number,
      required: true,
      min: [0, 'Lower seats cannot be negative'],
      default: 20,
    },
    middleSeats: {
      type: Number,
      required: true,
      min: [0, 'Middle seats cannot be negative'],
      default: 30,
    },
    balconySeats: {
      type: Number,
      required: true,
      min: [0, 'Balcony seats cannot be negative'],
      default: 10,
    },
    lowerSeatPrice: {
      type: Number,
      required: true,
      min: [0, 'Lower seat price cannot be negative'],
      default: 150,
    },
    middleSeatPrice: {
      type: Number,
      required: true,
      min: [0, 'Middle seat price cannot be negative'],
      default: 250,
    },
    balconySeatPrice: {
      type: Number,
      required: true,
      min: [0, 'Balcony seat price cannot be negative'],
      default: 400,
    },
    createdBy: {
      type: String, // adminEmail
      required: [true, 'CreatedBy admin email is required'],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward compatibility virtuals
theatreSchema.virtual('name').get(function () {
  return this.theatreName;
});
theatreSchema.virtual('totalSeats').get(function () {
  return (this.lowerSeats || 0) + (this.middleSeats || 0) + (this.balconySeats || 0);
});

theatreSchema.index({ theatreId: 1 });
theatreSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Theatre', theatreSchema);
