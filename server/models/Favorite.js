const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
    },
    movieId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index on (userEmail, movieId)
favoriteSchema.index({ userEmail: 1, movieId: 1 }, { unique: true });
favoriteSchema.index({ user: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);
