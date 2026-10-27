import React, { useState } from 'react';
import { Search, X, Film } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const { movies } = useCinema();
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'All' || m.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Explore Movies</h1>
      <p className="text-slate-400 text-sm mb-8">Search titles or filter by your favorite genre</p>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="sm:col-span-2 relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search movie title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div>
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-red-500 transition-colors cursor-pointer"
          >
            {['All', 'Sci-Fi', 'Biography', 'Animation', 'Action', 'Drama'].map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All Genres' : `Genre: ${g}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 rounded-2xl border border-slate-800 max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Film className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            We could not find any films matching &quot;{searchQuery || genreFilter}&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setGenreFilter('All');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMovies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
    </div>
  );
}
