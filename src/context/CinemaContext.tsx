import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import { Movie, Show, Booking } from '../types';

// Fallback seed dataset when local backend is booting or disconnected
const FALLBACK_MOVIES: Movie[] = [
  {
    id: 'm1',
    movieId: 'MOV-DUNE2024',
    title: 'Dune: Part Two',
    movieName: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: 'Sci-Fi',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    duration: 166,
    runtime: 166,
    certification: 'UA',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    media: {
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    },
    rating: 8.6,
    releaseDate: '2024-03-01',
  },
  {
    id: 'm2',
    movieId: 'MOV-OPPN2023',
    title: 'Oppenheimer',
    movieName: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: 'Biography',
    genres: ['Biography', 'Drama', 'History'],
    language: 'English',
    duration: 180,
    runtime: 180,
    certification: 'A',
    poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    media: {
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80',
    },
    rating: 8.9,
    releaseDate: '2023-07-21',
  },
  {
    id: 'm3',
    movieId: 'MOV-INST2024',
    title: 'Interstellar: 10th Anniversary',
    movieName: 'Interstellar: 10th Anniversary',
    description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history.',
    genre: 'Sci-Fi',
    genres: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 169,
    runtime: 169,
    certification: 'UA',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    media: {
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    },
    rating: 8.7,
    releaseDate: '2024-09-27',
  },
  {
    id: 'm4',
    movieId: 'MOV-SPID2023',
    title: 'Spider-Man: Across the Spider-Verse',
    movieName: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
    genre: 'Animation',
    genres: ['Animation', 'Action', 'Adventure'],
    language: 'English',
    duration: 140,
    runtime: 140,
    certification: 'U',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    media: {
      poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    },
    rating: 8.7,
    releaseDate: '2023-06-02',
  },
];

const FALLBACK_SHOWS: Show[] = [
  {
    id: 's1',
    showId: 'SHW-DUNE-EVE',
    movieId: 'm1',
    theatreId: 'th1',
    theatre: {
      id: 'th1',
      theatreId: 'THR-GRAND01',
      theatreName: 'Grand IMAX Downtown',
      location: { city: 'Downtown', address: '450 Cinema Blvd' },
      lowerSeats: 20,
      middleSeats: 30,
      balconySeats: 10,
      lowerSeatPrice: 150,
      middleSeatPrice: 250,
      balconySeatPrice: 400,
    },
    theatreName: 'Grand IMAX Downtown',
    theatreLocation: '450 Cinema Blvd, Downtown',
    screen: 'Screen 1 - Laser IMAX',
    showdate: '2026-10-30',
    date: '2026-10-30',
    showtime: '18:45',
    time: '18:45',
    price: 250,
    tickets: {
      bookedSeats: ['L3', 'L4', 'M10', 'B2'],
    },
    bookedSeats: ['L3', 'L4', 'M10', 'B2'],
  },
  {
    id: 's2',
    showId: 'SHW-OPPN-MAT',
    movieId: 'm2',
    theatreId: 'th1',
    theatre: {
      id: 'th1',
      theatreId: 'THR-GRAND01',
      theatreName: 'Grand IMAX Downtown',
      location: { city: 'Downtown', address: '450 Cinema Blvd' },
      lowerSeats: 20,
      middleSeats: 30,
      balconySeats: 10,
      lowerSeatPrice: 150,
      middleSeatPrice: 250,
      balconySeatPrice: 400,
    },
    theatreName: 'Grand IMAX Downtown',
    theatreLocation: '450 Cinema Blvd, Downtown',
    screen: 'Screen 2 - Dolby Atmos VIP',
    showdate: '2026-10-30',
    date: '2026-10-30',
    showtime: '20:15',
    time: '20:15',
    price: 250,
    tickets: {
      bookedSeats: ['B1', 'M5'],
    },
    bookedSeats: ['B1', 'M5'],
  },
  {
    id: 's3',
    showId: 'SHW-INST-NIG',
    movieId: 'm3',
    theatreId: 'th2',
    theatre: {
      id: 'th2',
      theatreId: 'THR-STAR02',
      theatreName: 'Starlight Multiplex West',
      location: { city: 'West Mall', address: '88 West Mall Rd' },
      lowerSeats: 20,
      middleSeats: 30,
      balconySeats: 10,
      lowerSeatPrice: 120,
      middleSeatPrice: 220,
      balconySeatPrice: 350,
    },
    theatreName: 'Starlight Multiplex West',
    theatreLocation: '88 West Mall Rd, West Mall',
    screen: 'Audi 2 - Standard 4K',
    showdate: '2026-10-30',
    date: '2026-10-30',
    showtime: '21:30',
    time: '21:30',
    price: 220,
    tickets: {
      bookedSeats: [],
    },
    bookedSeats: [],
  },
];

// Turns any Axios/JS error into a clear message for the user
const getApiErrorMessage = (err: any, fallback: string): string => {
  if (!err?.isAxiosError) return err?.message || fallback;
  if (err.response) {
    if (err.response.status === 401) return 'Please log in as a customer to book tickets.';
    return err.response.data?.message || `${fallback} (server responded ${err.response.status} at ${err.config?.baseURL ?? ''}${err.config?.url ?? ''})`;
  }
  if (err.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  return 'Cannot reach the server. Start the backend (port 5000) and check CLIENT_URL in server/.env.';
};

interface CinemaContextType {
  movies: Movie[];
  shows: Show[];
  bookings: Booking[];
  loadingMovies: boolean;
  refreshMovies: () => Promise<void>;
  refreshShows: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  addBooking: (showId: string, seats: string[], userId: string, userName: string) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<void>;
  addMovie: (movie: Omit<Movie, 'id'>) => Promise<void>;
  deleteMovie: (movieId: string) => Promise<void>;
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

export const CinemaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>(FALLBACK_MOVIES);
  const [shows, setShows] = useState<Show[]>(FALLBACK_SHOWS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingMovies, setLoadingMovies] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch movies from real API
  const refreshMovies = async () => {
    try {
      setLoadingMovies(true);
      const { data } = await API.get('/movies');
      if (data.success && data.data.length > 0) {
        setMovies(
          data.data.map((m: any) => ({
            id: m._id || m.id,
            movieId: m.movieId,
            title: m.movieName || m.title,
            movieName: m.movieName || m.title,
            description: m.description,
            genre: m.genres?.[0] || m.genre || 'Action',
            genres: m.genres || (m.genre ? [m.genre] : []),
            language: m.language || 'English',
            duration: m.runtime || m.duration || 120,
            runtime: m.runtime || m.duration || 120,
            certification: m.certification || 'UA',
            poster: m.media?.poster || m.poster,
            media: m.media,
            rating: m.rating || 8.5,
            releaseDate: m.releaseDate,
          }))
        );
      }
    } catch {
      // Keep fallback movies if API is unavailable
    } finally {
      setLoadingMovies(false);
    }
  };

  // Fetch current user bookings
  const refreshBookings = async () => {
    try {
      const { data } = await API.get('/bookings/my-bookings');
      if (data.success) {
        setBookings(
          data.data.map((b: any) => ({
            id: b._id || b.id,
            bookingId: b.bookingId,
            userId: b.user?._id || b.user,
            userName: b.user?.username || b.user?.name || b.userEmail || 'Customer',
            userEmail: b.userEmail,
            showId: b.show?._id || b.show?.id || b.show,
            movieId: b.show?.movie?._id || b.show?.movie?.id || b.show?.movie,
            movieTitle: b.show?.movie?.movieName || b.show?.movie?.title || 'Movie',
            theatreId: b.show?.theatre?._id || b.show?.theatre,
            theatreName: b.show?.theatre?.theatreName || b.show?.theatre?.name || 'Multiplex',
            screen: b.show?.screen || 'Screen 1',
            date: b.show?.showdate || b.show?.date || 'Today',
            time: b.show?.showtime || b.show?.time || '18:00',
            ticketsData: b.ticketsData,
            seats: b.ticketsData?.seats?.map((s: any) => s.seatId) || b.seats || [],
            totalAmount: b.ticketsData?.totalAmount ?? b.totalAmount ?? 0,
            status: b.status,
            createdAt: b.createdAt,
          }))
        );
      }
    } catch {
      // User may not be logged in or server offline
    }
  };

  // Fetch all scheduled shows from real API
  const refreshShows = async () => {
    try {
      const { data } = await API.get('/shows');
      if (data.success && data.data.length > 0) {
        setShows(
          data.data.map((s: any) => ({
            id: s._id || s.id,
            showId: s.showId,
            movieId: s.movie?._id || s.movie?.id || s.movieId,
            theatreId: s.theatre?._id || s.theatreId,
            theatre: s.theatre,
            theatreName: s.theatre?.theatreName || s.theatreName || 'Multiplex Cinema',
            theatreLocation: s.theatre?.location ? `${s.theatre.location.address}, ${s.theatre.location.city}` : '',
            screen: s.screen || 'Screen 1',
            showdate: s.showdate,
            date: s.showdate || 'Today',
            showtime: s.showtime,
            time: s.showtime || '18:00',
            price: s.theatre?.middleSeatPrice || 250,
            tickets: s.tickets,
            bookedSeats: s.tickets?.bookedSeats || s.bookedSeats || [],
            seatMap: s.seatMap,
          }))
        );
      }
    } catch {
      // Keep fallback shows
    }
  };

  useEffect(() => {
    refreshMovies();
    refreshShows();
  }, []);

  // Reload (or clear) the bookings whenever the logged-in user changes
  useEffect(() => {
    if (user) {
      refreshBookings();
    } else {
      setBookings([]);
    }
  }, [user?.id]);

  const addBooking = async (
    showId: string,
    seats: string[],
    userId: string,
    userName: string
  ): Promise<Booking> => {
    try {
      const { data } = await API.post('/bookings', { showId, seats });
      if (data.success) {
        const b = data.data;
        const newBooking: Booking = {
          id: b._id || b.id,
          bookingId: b.bookingId,
          userId,
          userName: userName || b.userEmail,
          userEmail: b.userEmail,
          showId: b.show?._id || showId,
          movieId: b.show?.movie?._id || '',
          movieTitle: b.show?.movie?.movieName || b.show?.movie?.title || 'Booked Movie',
          theatreId: b.show?.theatre?._id || '',
          theatreName: b.show?.theatre?.theatreName || b.show?.theatre?.name || 'Theatre',
          screen: b.show?.screen || 'Screen 1',
          date: b.show?.showdate || b.show?.date || 'Today',
          time: b.show?.showtime || b.show?.time || '',
          ticketsData: b.ticketsData,
          seats: b.ticketsData?.seats?.map((s: any) => s.seatId) || seats,
          totalAmount: b.ticketsData?.totalAmount ?? b.totalAmount ?? 0,
          status: 'confirmed',
          createdAt: b.createdAt,
        };

        setBookings((prev) => [newBooking, ...prev]);
        return newBooking;
      }
      throw new Error(data.message || 'Booking failed');
    } catch (err: any) {
      // No fake "offline" bookings: if the server did not confirm it, it did not happen
      throw new Error(getApiErrorMessage(err, 'Failed to book seats'));
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      await refreshBookings();
    } catch {
      // Local optimistic update & seat release
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    }
  };

  const addMovie = async (movieData: Omit<Movie, 'id'>) => {
    try {
      await API.post('/movies', movieData);
      await refreshMovies();
    } catch {
      const newMovie: Movie = {
        ...movieData,
        id: `m_${Date.now()}`,
      };
      setMovies((prev) => [newMovie, ...prev]);
    }
  };

  const deleteMovie = async (movieId: string) => {
    try {
      await API.delete(`/movies/${movieId}`);
      await refreshMovies();
    } catch {
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    }
  };

  return (
    <CinemaContext.Provider
      value={{
        movies,
        shows,
        bookings,
        loadingMovies,
        refreshMovies,
        refreshShows,
        refreshBookings,
        addBooking,
        cancelBooking,
        addMovie,
        deleteMovie,
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = (): CinemaContextType => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
};
