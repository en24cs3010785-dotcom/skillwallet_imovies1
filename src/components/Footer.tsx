import React from 'react';
import { Film } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <Film className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">IMovies</span>
          <span className="text-xs text-slate-500">| Movie Ticket Booking Made Simple</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            MERN Cinema Platform
          </span>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} IMovies Entertainment Inc.
        </div>
      </div>
    </footer>
  );
}
