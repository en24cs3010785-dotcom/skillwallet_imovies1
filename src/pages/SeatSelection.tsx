import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, AlertCircle, Clock, ShieldCheck, Tag } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import { useAuth } from '../context/AuthContext';
import SeatGrid from '../components/SeatGrid';
import API from '../api/axiosInstance';
import { Show, Movie } from '../types';

export default function SeatSelection() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { shows, movies, addBooking } = useCinema();
  const { user } = useAuth();

  const [currentShow, setCurrentShow] = useState<Show | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingShow, setFetchingShow] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync with API or context
  useEffect(() => {
    let isMounted = true;
    const fetchShowDetails = async () => {
      setFetchingShow(true);
      try {
        if (showId) {
          const { data } = await API.get(`/shows/${showId}`);
          if (data.success && data.data && isMounted) {
            const s = data.data;
            const mappedShow: Show = {
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
            };
            setCurrentShow(mappedShow);

            if (s.movie) {
              setCurrentMovie({
                id: s.movie._id || s.movie.id,
                movieId: s.movie.movieId,
                title: s.movie.movieName || s.movie.title,
                movieName: s.movie.movieName,
                description: s.movie.description,
                genre: s.movie.genres?.[0] || 'Drama',
                genres: s.movie.genres,
                duration: s.movie.runtime || 120,
                runtime: s.movie.runtime,
                poster: s.movie.media?.poster || s.movie.poster || '',
                rating: s.movie.rating || 8.5,
                releaseDate: s.movie.releaseDate || '',
                certification: s.movie.certification || 'UA',
              });
            }
          }
        }
      } catch {
        // Fallback to local context show
        const fallbackShow = shows.find((s) => s.id === showId);
        if (fallbackShow && isMounted) {
          setCurrentShow(fallbackShow);
          const fallbackMovie = movies.find((m) => m.id === fallbackShow.movieId);
          if (fallbackMovie) setCurrentMovie(fallbackMovie);
        }
      } finally {
        if (isMounted) setFetchingShow(false);
      }
    };

    fetchShowDetails();
    return () => {
      isMounted = false;
    };
  }, [showId, shows, movies, refreshKey]);

  const show = currentShow || shows.find((s) => s.id === showId);
  const movie = currentMovie || (show ? movies.find((m) => m.id === show.movieId) : null);

  if (fetchingShow) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading auditorium layout and showtime details...</p>
      </div>
    );
  }

  if (!show || !movie) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="text-lg font-bold text-white">Showtime Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">The screening ID may be invalid or expired.</p>
        <button onClick={() => navigate('/movies')} className="text-sm text-red-500 hover:underline cursor-pointer">
          Return to Movies
        </button>
      </div>
    );
  }

  // Check if showtime has passed (strict bug fix)
  const isPastShowtime = (() => {
    const rawDate = show.showdate || show.date;
    const rawTime = show.showtime || show.time;
    if (!rawDate || !rawTime || rawDate === 'Today') return false;
    try {
      const [year, month, day] = rawDate.split('-').map(Number);
      const [hours, minutes] = rawTime.split(':').map(Number);
      if (year && month && day && hours !== undefined && minutes !== undefined) {
        return new Date(year, month - 1, day, hours, minutes) < new Date();
      }
    } catch {
      return false;
    }
    return false;
  })();

  const getSeatPrice = (seatId: string) => {
    const clean = seatId.toUpperCase();
    if (clean.startsWith('B')) return show.theatre?.balconySeatPrice ?? 400;
    if (clean.startsWith('M')) return show.theatre?.middleSeatPrice ?? 250;
    if (clean.startsWith('L')) return show.theatre?.lowerSeatPrice ?? 150;
    return show.price || 200;
  };

  const totalEstimatedPrice = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s), 0);

  const toggleSeat = (seatCode: string) => {
    if (isPastShowtime) return;
    setErrorMsg(null);
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
    } else {
      setSelectedSeats([...selectedSeats, seatCode]);
    }
  };

  const handleConfirm = async () => {
    if (isPastShowtime) {
      setErrorMsg('This showtime has already passed. Reservations are closed.');
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: `/booking/seats/${showId}` } });
      return;
    }

    // Disable confirm button / prevent empty submissions
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat from the auditorium grid to continue.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const booking = await addBooking(show.id, selectedSeats, user.id, user.username);
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (err: any) {
      const msg: string = err.message || 'Seat reservation failed. Please try again.';
      setErrorMsg(msg);
      // Seats taken by someone else: clear the selection and reload the latest seat map
      if (/just booked|already|reserved/i.test(msg)) {
        setSelectedSeats([]);
        setRefreshKey((k) => k + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeBookedSeats = show.tickets?.bookedSeats || show.bookedSeats || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Show Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{movie.title}</h1>
            {movie.certification && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-950/80 text-red-300 border border-red-800/60">
                {movie.certification}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {show.theatreName} • {show.screen || 'Main Audi'} • {show.showdate || show.date} at {show.showtime || show.time}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isPastShowtime ? (
            <span className="px-3 py-1 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Screening Expired
            </span>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden sm:inline">Pricing Tiers:</span>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 font-mono text-[11px]">
                  Balcony: ${show.theatre?.balconySeatPrice ?? 400}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-500/30 text-blue-300 font-mono text-[11px]">
                  Middle: ${show.theatre?.middleSeatPrice ?? 250}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                  Lower: ${show.theatre?.lowerSeatPrice ?? 150}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPastShowtime && (
        <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>This show has already screened. Ticket booking is closed for this timeslot.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Auditorium Seat Grid */}
      <SeatGrid
        bookedSeats={activeBookedSeats}
        selectedSeats={selectedSeats}
        onToggleSeat={toggleSeat}
        seatMap={show.seatMap}
        theatre={show.theatre}
      />

      {/* Floating Summary Bar */}
      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left w-full sm:w-auto">
          <div className="text-xs text-slate-400 font-medium">Selected Seats ({selectedSeats.length}):</div>
          <div className="text-base font-bold text-red-400 font-mono mt-0.5">
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected (Click seats above)'}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Total Billed:</div>
            <div className="text-2xl font-extrabold text-white">
              ${totalEstimatedPrice.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0 || loading || isPastShowtime}
            title={selectedSeats.length === 0 ? 'Select at least 1 seat to continue' : 'Confirm reservation'}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            <span>
              {loading
                ? 'Securing Seats...'
                : selectedSeats.length === 0
                ? 'Select a Seat to Book'
                : `Confirm Booking (${selectedSeats.length} Seats)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
