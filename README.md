# IMovies – Movie Ticket Booking Made Simple 🎬🎟️

An online full-stack movie ticket reservation platform built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js). Features real-time seat availability tracking, atomic concurrency safety to prevent double booking, JWT authentication with role-based access control (User/Admin), and a modern cinema dark-themed UI.

---

## 🌟 Key Features

- **JWT Authentication & Authorization**: Secure signup, login, password hashing with `bcryptjs`, and protected routes using role-based access control (`customer` vs. `admin`).
- **Interactive Seat Map**: Real-time 6x10 auditorium seat matrix with live visual states (Available, Selected, Already Booked) and zero overflow on 360px mobile viewports.
- **Concurrency & Double-Booking Protection**: Atomic MongoDB updates (`$nin` and `$addToSet`) ensure that two concurrent customers cannot reserve the same seat.
- **Isolated Seat Cancellation**: Cancelling a booking releases seats strictly on the booked `showId`, preserving seat states on all other screenings.
- **Movie Catalog & Live Filters**: Real-time keyword search and filtering by genre and language with empty states.
- **Showtime & Theatre Selector**: Grouped screenings by theatre, auditorium format (IMAX, Dolby Atmos), date, and time.
- **Digital Ticket Pass**: Instant booking confirmation with unique receipt ID, barcode representation, and seat breakdown.
- **My Bookings & Cancellation**: View active reservations and cancel bookings to automatically return seats to the public pool.
- **Admin Dashboard**: Secure management interface for admins to add new movies, update metadata, and delete titles.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **React.js 19** (Vite SPA)
- **Tailwind CSS v4** (Custom Cinema Dark palette)
- **React Router DOM v7** (Declarative URL routing & route guards)
- **Axios** (Configured with request JWT interceptor & 401 redirect)
- **Lucide React** (Modern cinema and interface icons)

### Backend (`/server`)
- **Node.js** (v16+) & **Express.js**
- **MongoDB** & **Mongoose ODM**
- **JSON Web Token (JWT)**
- **Bcrypt.js** (Salted password hashing)
- **CORS** & **Dotenv**

---

## 📁 Project Architecture & Directory Layout

```
imovies-booking/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User and Admin authentication & profiles
│   │   ├── movieController.js    # Movie catalog with Mongoose virtual shows
│   │   ├── showController.js     # Showtimes with dynamic seat map generation
│   │   ├── theatreController.js  # Theatres with tiered seating (L, M, B)
│   │   ├── bookingController.js  # Atomic seat booking ($nin, $addToSet) & cancellation
│   │   └── favoriteController.js # Movie bookmarking / favorites management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token validator
│   │   ├── adminMiddleware.js    # Strict Admin collection check
│   │   └── errorMiddleware.js    # Centralized error & 404 handlers
│   ├── models/
│   │   ├── User.js               # User model: username, email, password (no role field)
│   │   ├── Admin.js              # Separate Admin model: username, email, password
│   │   ├── Movie.js              # movieId, movieName, genres, runtime, certification, media
│   │   ├── Theatre.js            # theatreId, location, lower/middle/balcony seats & prices
│   │   ├── Show.js               # showId, showdate, showtime, tickets: { bookedSeats }
│   │   ├── Booking.js            # bookingId, ticketsData: { seats, totalAmount }, status
│   │   └── Favorite.js           # user, userEmail, movie, movieId (compound unique index)
│   ├── seeds/
│   │   └── seedData.js           # Seeds complete ER database with demo dataset
│   └── utils/
│       ├── genId.js              # Collision-free UUID generator: genId(prefix)
│       └── seats.js              # Seat map builder and server-authoritative pricer
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── movieRoutes.js        # /api/movies
│   │   ├── showRoutes.js         # /api/shows
│   │   └── bookingRoutes.js      # /api/bookings
│   ├── seeds/
│   │   └── seedData.js           # Automated seeder with sample movies & showtimes
│   ├── .env.example              # Server environment template
│   ├── package.json              # Server dependencies
│   └── server.js                 # Server entry point
│
└── client/
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.ts  # Base URL & JWT request interceptor
    │   ├── components/
    │   │   ├── Navbar.tsx        # Responsive navbar with single-line branding & mobile drawer
    │   │   ├── Footer.tsx        # Cinema footer
    │   │   ├── MovieCard.tsx     # Poster card with rating and quick book
    │   │   ├── SeatGrid.tsx      # Responsive 6x10 auditorium seat matrix
    │   │   ├── ProtectedRoute.tsx# Route guard for user/admin routes
    │   │   └── Loader.tsx        # Film-reel spinner
    │   ├── context/
    │   │   ├── AuthContext.tsx   # Global auth state (token, user, login, logout)
    │   │   └── CinemaContext.tsx # Catalog, showtime, and booking state
    │   ├── pages/
    │   │   ├── Home.tsx          # Hero banner & trending releases
    │   │   ├── Movies.tsx        # Search, filter, and empty states
    │   │   ├── MovieDetails.tsx  # Movie metadata & theatre showtimes
    │   │   ├── SeatSelection.tsx # Screen layout, live seat map, pricing tally
    │   │   ├── BookingConfirmation.tsx # Printable ticket pass with barcode
    │   │   ├── MyBookings.tsx    # Reservation history & cancellation
    │   │   ├── Login.tsx         # User login form with inline validation
    │   │   ├── Register.tsx      # Account creation form with inline validation
    │   │   └── AdminDashboard.tsx# Movie CRUD management (admin only)
    │   ├── App.tsx               # React Router mapping
    │   └── main.tsx              # React entry point
    ├── .env.example              # Client environment template
    ├── package.json              # Client dependencies ("imovies-client")
    └── vite.config.ts
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a free MongoDB Atlas connection URI

### 1. Configure and Run Backend
```bash
# 1. Enter server directory
cd server

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Seed initial database records
npm run seed

# 5. Start development server
npm run dev
```

### 2. Configure and Run Frontend
In a second terminal window:
```bash
# 1. Enter client directory (or root)
npm install

# 2. Create .env file
cp .env.example .env

# 3. Start Vite dev server
npm run dev
```

Open **`http://localhost:5173`** (or `http://localhost:3000`) in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `password123` | Full access + Admin Dashboard (`/admin`) |
| **Customer** | `customer@imovies.com` | `password123` | Browsing, seat selection, booking tickets |

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/auth/profile` | View profile of current user | Bearer JWT |
| `GET` | `/api/movies` | Get movies (search, genre filter) | Public |
| `GET` | `/api/movies/:id` | Get movie details | Public |
| `POST` | `/api/movies` | Create new movie | Admin JWT |
| `PUT` | `/api/movies/:id` | Update movie details | Admin JWT |
| `DELETE`| `/api/movies/:id` | Delete movie | Admin JWT |
| `GET` | `/api/shows` | Get all active showtimes | Public |
| `GET` | `/api/shows/movie/:movieId` | Get shows for movie by date | Public |
| `GET` | `/api/shows/:id` | Get show details & dynamic seat map | Public |
| `POST` | `/api/shows` | Create showtime screening | Admin JWT |
| `GET` | `/api/theatres` | Get all cinema theatres & tiers | Public |
| `POST` | `/api/theatres` | Register a new cinema theatre | Admin JWT |
| `POST` | `/api/bookings` | Reserve seats (atomic concurrency guard) | Bearer JWT |
| `GET` | `/api/bookings/my-bookings` | List user's tickets | Bearer JWT |
| `PUT` | `/api/bookings/:id/cancel` | Cancel booking & release seats strictly | Bearer JWT |
| `POST` | `/api/favorites/toggle` | Toggle bookmark on movie | Bearer JWT |
| `GET` | `/api/favorites/my-favorites` | List user's favorited movies | Bearer JWT |
| `GET` | `/api/favorites/check/:movieId`| Check if movie is favorited | Bearer JWT |

---

## 🌐 Production Deployment Guide

### Database: MongoDB Atlas
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an **M0 Free Cluster**.
2. Under **Security → Database Access**, create a user (e.g. `imovies_admin`) with a secure password.
3. Under **Security → Network Access**, add IP `0.0.0.0/0` (allow all traffic).
4. Copy the connection string into your backend `.env`:
   ```
   MONGO_URI=mongodb+srv://imovies_admin:<password>@cluster0.mongodb.net/imovies_db?retryWrites=true&w=majority
   ```

### Backend: Render or Railway
1. Push repository to GitHub.
2. In Render, create a new **Web Service** with Root Directory set to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Configure Environment Variables:
   - `PORT=5000`
   - `MONGO_URI=<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET=<Your strong random key>`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_URL=https://your-frontend.vercel.app`
6. Deploy!

### Frontend: Vercel or Netlify
1. Create a new project in Vercel pointing to the client repository.
2. Framework Preset: **Vite**.
3. Set Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
4. Deploy!

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
