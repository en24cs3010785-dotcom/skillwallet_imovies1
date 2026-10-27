import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, MapPin, XCircle, CheckCircle2 } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function MyBookings() {
  const { bookings, cancelBooking } = useCinema();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Ticket className="w-7 h-7 text-red-500" />
        <h1 className="text-3xl font-extrabold text-white">My Movie Tickets</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">You haven&apos;t reserved any movie tickets yet.</p>
          <Link
            to="/movies"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white inline-block"
          >
            Browse Movies Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-red-400">{booking.bookingId}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-lg">{booking.movieTitle}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {booking.theatreName} ({booking.screen || 'Audi 1'})
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500">Showtime:</span>
                    <div className="text-white font-medium mt-0.5">
                      {booking.date} at {booking.time}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Seats:</span>
                    <div className="text-amber-400 font-bold font-mono mt-0.5">
                      {booking.seats.join(', ')}
                    </div>
                  </div>
                </div>

                {booking.ticketsData?.seats && booking.ticketsData.seats.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {booking.ticketsData.seats.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300"
                      >
                        {s.seatId} ({s.tier})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total: </span>
                  <span className="font-bold text-emerald-400 font-mono">${booking.totalAmount.toFixed(2)}</span>
                </div>

                {booking.status === 'confirmed' ? (
                  <button
                    onClick={() => {
                      if (window.confirm('Cancel this booking and release seats?')) {
                        cancelBooking(booking.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Ticket
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 italic">Seats Released</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
