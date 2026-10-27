import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Film, Ticket } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function BookingConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { bookings } = useCinema();

  const booking = bookings.find((b) => b.id === bookingId || b.bookingId === bookingId);

  if (!booking) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="text-lg font-bold text-white">Booking Record Not Found</h3>
        <Link to="/" className="text-sm text-red-500 hover:underline mt-2 inline-block">
          Return Home
        </Link>
      </div>
    );
  }

  const seatsList = booking.ticketsData?.seats?.length
    ? booking.ticketsData.seats
    : booking.seats.map((s) => ({
        seatId: s,
        tier: s.startsWith('B') ? 'balcony' : s.startsWith('M') ? 'middle' : 'lower',
        price: 0,
      }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
        <p className="text-sm text-slate-400 mt-1">
          Your admission ticket is confirmed. Present this pass at the cinema kiosk.
        </p>
      </div>

      {/* Digital Cinema Pass */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-red-700 to-rose-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold font-['Space_Grotesk'] text-lg">
            <Film className="w-5 h-5" /> IMOVIES DIGITAL PASS
          </div>
          <span className="font-mono text-xs bg-red-950/60 px-2.5 py-1 rounded-md border border-red-500/30">
            {booking.bookingId}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{booking.movieTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {booking.theatreName} • {booking.screen || 'Screen 1'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400">Date & Showtime:</div>
              <div className="text-white font-semibold mt-1">
                {booking.date} at {booking.time}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400">Reserved Seats:</div>
              <div className="text-amber-400 font-bold font-mono text-sm mt-1">
                {booking.seats.join(', ')}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400">User / Account:</div>
              <div className="text-white font-semibold mt-1">
                {booking.userName || booking.userEmail || 'Customer'}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400">Total Billed:</div>
              <div className="text-emerald-400 font-bold text-sm mt-1">
                ${booking.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Seat Breakdown by Tier */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-red-400" /> Tier Breakdown
            </div>
            <div className="flex flex-wrap gap-2">
              {seatsList.map((st, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono flex items-center gap-1.5"
                >
                  <span className="text-white font-bold">{st.seatId}</span>
                  <span className="text-[10px] text-slate-400 uppercase">({st.tier})</span>
                  {st.price > 0 && <span className="text-emerald-400">${st.price}</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Barcode */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-xs text-slate-500 tracking-widest">
            |||| | ||||| || |||||||| |||| | |||| |||||| ||||
            <div className="mt-1 text-[10px] text-slate-400">{booking.bookingId}</div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <Link
            to="/my-bookings"
            className="text-xs font-semibold text-slate-300 hover:text-white"
          >
            View in My Bookings
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
