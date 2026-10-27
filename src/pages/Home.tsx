import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const { movies } = useCinema();

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-700/50 text-red-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              MERN CINEMA EXPERIENCE • REAL-TIME SEATS
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight font-['Space_Grotesk']">
              Movie Ticket Booking <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400">
                Made Simple & Seamless.
              </span>
            </h1>

            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Explore blockbusters, pick showtimes, and book seats in real-time with zero double-booking risk.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/movies"
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-xl shadow-red-900/30 flex items-center gap-2 transition-all"
              >
                Explore Now Showing <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Releases Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Now Showing in Theatres</h2>
            <p className="text-sm text-slate-400 mt-1">Select a movie to pick showtimes and auditorium seats</p>
          </div>
          <Link
            to="/movies"
            className="text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>
    </div>
  );
}
