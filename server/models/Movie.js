const mongoose = require('mongoose');
const { genId } = require('../utils/genId');

const movieSchema = new mongoose.Schema(
  {
    movieId: {
      type: String,
      unique: true,
      required: true,
      default: () => genId('MOV'),
    },
    movieName: {
      type: String,
      required: [true, 'Please enter movie name'],
      trim: true,
    },
    genres: {
      type: [String],
      default: [],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    runtime: {
      type: Number, // Duration in minutes
      required: [true, 'Please specify runtime in minutes'],
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'S'],
      default: 'UA',
    },
    media: {
      poster: {
        type: String,
        required: [true, 'Please provide poster image URL'],
      },
      banner: {
        type: String,
        default: '',
      },
      trailerUrl: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to Show model (shows -> NOT stored in document)
movieSchema.virtual('shows', {
  ref: 'Show',
  localField: '_id',
  foreignField: 'movie',
});

// Backward compatibility virtuals for existing frontend views
movieSchema.virtual('title').get(function () {
  return this.movieName;
});
movieSchema.virtual('duration').get(function () {
  return this.runtime;
});
movieSchema.virtual('poster').get(function () {
  return this.media?.poster || '';
});
movieSchema.virtual('genre').get(function () {
  return Array.isArray(this.genres) ? this.genres.join(', ') : '';
});

// Indexing for search
movieSchema.index({ movieName: 'text', description: 'text' });
movieSchema.index({ movieId: 1 });

module.exports = mongoose.model('Movie', movieSchema);
