import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, MapPin, ChevronRight, Heart, Calendar } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosInstance';

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const { movies, shows } = useCinema();
  const { user } = useAuth();

  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(false);

  const movie = movies.find((m) => m.id === id || m.movieId === id);
  const movieShows = shows.filter((s) => s.movieId === id || (movie && s.movieId === movie.id));

  // Check if movie is favorited
  useEffect(() => {
    let isMounted = true;
    const checkFavStatus = async () => {
      if (!user || !id) return;
      try {
        const { data } = await API.get(`/favorites/check/${id}`);
        if (data.success && isMounted) {
          setIsFavorited(data.isFavorited);
        }
      } catch {
        // Ignore if unauthenticated or offline
      }
    };

    checkFavStatus();
    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) return;
    setFavLoading(true);
    try {
      const { data } = await API.post('/favorites/toggle', { movieId: movie?.id || id });
      if (data.success) {
        setIsFavorited(data.isFavorited);
      }
    } catch {
      // Optimistic toggle
      setIsFavorited(!isFavorited);
    } finally {
      setFavLoading(false);
    }
  };

  if (!movie) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-400">
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm mb-4">The selected film is not in our active directory.</p>
        <Link to="/movies" className="text-sm text-red-500 hover:underline">
          Return to Movies Catalog
        </Link>
      </div>
    );
  }

  const genresList = movie.genres && movie.genres.length > 0 ? movie.genres : [movie.genre || 'Action'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Movie Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-sm mx-auto md:max-w-none group">
            <img src={movie.poster} alt={movie.title} className="w-full h-96 object-cover" />
            {movie.certification && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-red-600/90 text-white shadow">
                {movie.certification}
              </span>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {genresList.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-red-950/80 border border-red-700/50 text-red-300 text-xs font-semibold uppercase font-mono"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {user && (
                <button
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                    isFavorited
                      ? 'bg-rose-950/80 border-rose-600 text-rose-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {movie.title || movie.movieName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" /> {(movie.rating || 8.5).toFixed(1)} / 10
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> {movie.runtime || movie.duration || 120} min
              </span>
              {movie.releaseDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(movie.releaseDate).getFullYear() || movie.releaseDate}
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed pt-2">
              {movie.description}
            </p>
          </div>
        </div>
      </div>

      {/* Available Showtimes Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Available Theatres & Showtimes</h2>
        {movieShows.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-sm">
            No showtimes currently scheduled for this title.
          </div>
        ) : (
          <div className="space-y-4">
            {movieShows.map((show) => (
              <div
                key={show.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="text-lg font-bold text-white">{show.theatreName}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {show.theatreLocation || 'Auditorium Hall'}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                      {show.screen || 'Screen 1'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {show.showdate || show.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-400">Tiers from</div>
                    <div className="text-lg font-extrabold text-emerald-400">
                      ${(show.theatre?.lowerSeatPrice || show.price || 150).toFixed(2)}
                    </div>
                  </div>

                  <Link
                    to={`/booking/seats/${show.id}`}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <span>{show.showtime || show.time}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
