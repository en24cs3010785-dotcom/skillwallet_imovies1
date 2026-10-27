const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { genId } = require('../utils/genId');

dotenv.config();

const User = require('../models/User');
const Admin = require('../models/Admin');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB for seeding (ER Spec v2)...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Purging stale collections...');

    await User.deleteMany();
    await Admin.deleteMany();
    await Movie.deleteMany();
    await Theatre.deleteMany();
    await Show.deleteMany();
    await Booking.deleteMany();
    await Favorite.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Seed Customer User (No role field)
    const user = await User.create({
      username: 'AlexMorgan',
      email: 'customer@imovies.com',
      password: hashedPassword,
    });
    console.log(`✓ Seeded User: ${user.username} (${user.email})`);

    // 2. Seed Admin (Separate Admin collection)
    const admin = await Admin.create({
      username: 'CinemaAdmin',
      email: 'admin@imovies.com',
      password: hashedPassword,
    });
    console.log(`✓ Seeded Admin: ${admin.username} (${admin.email})`);

    // 3. Seed Movies with ER attributes
    const movies = await Movie.insertMany([
      {
        movieId: genId('MOV'),
        movieName: 'Dune: Part Two',
        genres: ['Sci-Fi', 'Adventure'],
        releaseDate: new Date('2024-03-01'),
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        runtime: 166,
        certification: 'UA',
        media: {
          poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=80',
          trailerUrl: 'https://youtube.com/watch?v=Way9Dexny3w',
        },
      },
      {
        movieId: genId('MOV'),
        movieName: 'Oppenheimer',
        genres: ['Biography', 'Drama'],
        releaseDate: new Date('2023-07-21'),
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        runtime: 180,
        certification: 'A',
        media: {
          poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1600&auto=format&fit=crop&q=80',
          trailerUrl: 'https://youtube.com/watch?v=uYPbbksJxIg',
        },
      },
      {
        movieId: genId('MOV'),
        movieName: 'Interstellar: 10th Anniversary',
        genres: ['Sci-Fi', 'Drama'],
        releaseDate: new Date('2024-09-27'),
        description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history.',
        runtime: 169,
        certification: 'UA',
        media: {
          poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
          trailerUrl: '',
        },
      },
      {
        movieId: genId('MOV'),
        movieName: 'Spider-Man: Across the Spider-Verse',
        genres: ['Animation', 'Action'],
        releaseDate: new Date('2023-06-02'),
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
        runtime: 140,
        certification: 'U',
        media: {
          poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
          banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600&auto=format&fit=crop&q=80',
          trailerUrl: '',
        },
      },
    ]);
    console.log(`✓ Seeded ${movies.length} Movies (with Mongoose virtual shows)`);

    // 4. Seed Theatres with tier seats and prices
    const theatres = await Theatre.insertMany([
      {
        theatreId: genId('THR'),
        theatreName: 'PVR IMAX Downtown',
        adminName: admin.username,
        location: {
          city: 'Metropolis',
          address: '450 Cinema Boulevard, Downtown',
        },
        lowerSeats: 20,
        middleSeats: 30,
        balconySeats: 10,
        lowerSeatPrice: 160,
        middleSeatPrice: 280,
        balconySeatPrice: 450,
        createdBy: admin.email,
      },
      {
        theatreId: genId('THR'),
        theatreName: 'INOX Megaplex West',
        adminName: admin.username,
        location: {
          city: 'Metropolis',
          address: '88 West Mall Road, Avenue 4',
        },
        lowerSeats: 25,
        middleSeats: 35,
        balconySeats: 15,
        lowerSeatPrice: 140,
        middleSeatPrice: 240,
        balconySeatPrice: 390,
        createdBy: admin.email,
      },
    ]);
    console.log(`✓ Seeded ${theatres.length} Theatres (with lower/middle/balcony tiers)`);

    // Use LOCAL date/time (not UTC) and schedule today's shows in the future,
    // otherwise booking is rejected with "showtime has already passed".
    const pad = (n) => String(n).padStart(2, '0');
    const slot = (hoursFromNow) => {
      const d = new Date(Date.now() + hoursFromNow * 3600000);
      d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
      return {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      };
    };
    const slotA = slot(2);
    const slotB = slot(4);
    const slotC = slot(6);
    const slotD = slot(26);

    // 5. Seed Shows with tickets.bookedSeats and unique slot index
    const shows = await Show.insertMany([
      {
        showId: genId('SHW'),
        movie: movies[0]._id,
        movieId: movies[0].movieId,
        theatre: theatres[0]._id,
        theatreName: theatres[0].theatreName,
        adminEmail: admin.email,
        showdate: slotA.date,
        showtime: slotA.time,
        tickets: {
          bookedSeats: ['L1', 'L2', 'M14', 'M15', 'B3'],
        },
      },
      {
        showId: genId('SHW'),
        movie: movies[0]._id,
        movieId: movies[0].movieId,
        theatre: theatres[0]._id,
        theatreName: theatres[0].theatreName,
        adminEmail: admin.email,
        showdate: slotB.date,
        showtime: slotB.time,
        tickets: {
          bookedSeats: ['M1', 'M2'],
        },
      },
      {
        showId: genId('SHW'),
        movie: movies[1]._id,
        movieId: movies[1].movieId,
        theatre: theatres[1]._id,
        theatreName: theatres[1].theatreName,
        adminEmail: admin.email,
        showdate: slotC.date,
        showtime: slotC.time,
        tickets: {
          bookedSeats: ['B1', 'B2'],
        },
      },
      {
        showId: genId('SHW'),
        movie: movies[2]._id,
        movieId: movies[2].movieId,
        theatre: theatres[1]._id,
        theatreName: theatres[1].theatreName,
        adminEmail: admin.email,
        showdate: slotD.date,
        showtime: slotD.time,
        tickets: {
          bookedSeats: [],
        },
      },
    ]);
    console.log(`✓ Seeded ${shows.length} Shows (with unique theatre/date/time slots)`);

    // 6. Seed a Booking with ticketsData schema
    const booking = await Booking.create({
      bookingId: genId('BKG'),
      show: shows[0]._id,
      showId: shows[0].showId,
      user: user._id,
      userEmail: user.email,
      ticketsData: {
        seats: [
          { seatId: 'L1', tier: 'lower', price: theatres[0].lowerSeatPrice },
          { seatId: 'L2', tier: 'lower', price: theatres[0].lowerSeatPrice },
        ],
        totalAmount: theatres[0].lowerSeatPrice * 2,
      },
      status: 'confirmed',
    });
    console.log(`✓ Seeded Booking: ${booking.bookingId} ($${booking.ticketsData.totalAmount})`);

    // 7. Seed Favorite with unique compound index
    await Favorite.create({
      user: user._id,
      userEmail: user.email,
      movie: movies[0]._id,
      movieId: movies[0].movieId,
    });
    console.log(`✓ Seeded Favorite Movie for ${user.email}`);

    console.log('\n======================================================');
    console.log('🎉 IMOVIES ER DIAGRAM DATABASE SUCCESSFULLY SEEDED!');
    console.log('======================================================');
    console.log('Admin Account:    admin@imovies.com    | password123 (Admin Model)');
    console.log('Customer Account: customer@imovies.com | password123 (User Model, no role field)');
    console.log('Seat ID Scheme:   L1..L20 (Lower), M1..M30 (Middle), B1..B10 (Balcony)');
    console.log('======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
