export interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  role?: 'customer' | 'admin';
  isAdmin?: boolean;
}

export interface Movie {
  id: string;
  movieId?: string;
  movieName?: string;
  title: string;
  description: string;
  genres?: string[];
  genre?: string;
  language?: string;
  runtime?: number;
  duration: number;
  certification?: 'U' | 'UA' | 'A' | 'S';
  media?: {
    poster: string;
    banner?: string;
    trailerUrl?: string;
  };
  poster: string;
  rating: number;
  releaseDate: string;
}

export interface Theatre {
  id: string;
  theatreId?: string;
  theatreName?: string;
  name?: string;
  adminName?: string;
  location: {
    city: string;
    address: string;
  };
  lowerSeats?: number;
  middleSeats?: number;
  balconySeats?: number;
  lowerSeatPrice?: number;
  middleSeatPrice?: number;
  balconySeatPrice?: number;
  createdBy?: string;
}

export interface SeatItem {
  seatId: string;
  tier: 'lower' | 'middle' | 'balcony' | 'standard';
  price: number;
}

export interface Show {
  id: string;
  showId?: string;
  movieId: string;
  movie?: any;
  theatreId: string;
  theatre?: Theatre;
  theatreName: string;
  theatreLocation?: string;
  screen?: string;
  showdate?: string;
  date: string;
  showtime?: string;
  time: string;
  price?: number;
  tickets?: {
    bookedSeats: string[];
  };
  bookedSeats: string[];
  seatMap?: {
    lower: SeatItem[];
    middle: SeatItem[];
    balcony: SeatItem[];
  };
}

export interface Booking {
  id: string;
  bookingId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  showId: string;
  show?: any;
  movieId?: string;
  movieTitle?: string;
  theatreId?: string;
  theatreName?: string;
  screen?: string;
  date?: string;
  time?: string;
  ticketsData?: {
    seats: SeatItem[];
    totalAmount: number;
  };
  seats: string[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  userEmail: string;
  movieId: string;
  movie?: Movie;
}
