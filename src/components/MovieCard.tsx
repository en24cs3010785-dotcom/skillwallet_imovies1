import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-red-500/50 transition-all duration-300 group flex flex-col">
      <div className="relative h-72 sm:h-80 overflow-hidden bg-slate-950">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          {movie.rating.toFixed(1)}
        </div>
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-red-600/90 text-white text-xs font-semibold uppercase tracking-wider">
          {movie.genre}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-white text-lg line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {movie.duration} min
          </span>
          <span>•</span>
          <span>{movie.language}</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-grow">
          {movie.description}
        </p>

        <Link
          to={`/movie/${movie.id}`}
          className="mt-4 w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md transition-colors text-center"
        >
          Select Showtimes
        </Link>
      </div>
    </div>
  );
}
