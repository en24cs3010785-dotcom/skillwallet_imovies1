const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const clientUrl = allowedOrigins.join(', ');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like Postman (no origin) and any listed frontend origin
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎟️ IMovies Movie Ticket Booking API is online (ER Diagram Spec v2)!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: Date.now(),
  });
});

// Mount Routes matching ER spec
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/theatres', require('./routes/theatreRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎬 IMovies Server listening on http://localhost:${PORT}`);
  console.log(`📡 CORS Client Origin: ${clientUrl}`);
});
