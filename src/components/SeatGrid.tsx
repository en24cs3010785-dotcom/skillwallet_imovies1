import React from 'react';
import { SeatItem, Theatre } from '../types';

interface SeatGridProps {
  bookedSeats: string[];
  selectedSeats: string[];
  onToggleSeat: (seatCode: string) => void;
  seatMap?: {
    lower: SeatItem[];
    middle: SeatItem[];
    balcony: SeatItem[];
  };
  theatre?: Theatre;
}

export default function SeatGrid({
  bookedSeats = [],
  selectedSeats = [],
  onToggleSeat,
  seatMap,
  theatre,
}: SeatGridProps) {
  // Extract or generate tiers conforming to the ER diagram:
  // Balcony seats: B1 ... B{balconySeats}
  // Middle seats:  M1 ... M{middleSeats}
  // Lower seats:   L1 ... L{lowerSeats}
  const balconySeatsCount = theatre?.balconySeats ?? 10;
  const middleSeatsCount = theatre?.middleSeats ?? 30;
  const lowerSeatsCount = theatre?.lowerSeats ?? 20;

  const balconyPrice = theatre?.balconySeatPrice ?? 400;
  const middlePrice = theatre?.middleSeatPrice ?? 250;
  const lowerPrice = theatre?.lowerSeatPrice ?? 150;

  const balconySeats: SeatItem[] =
    seatMap?.balcony && seatMap.balcony.length > 0
      ? seatMap.balcony
      : Array.from({ length: balconySeatsCount }, (_, i) => ({
          seatId: `B${i + 1}`,
          tier: 'balcony',
          price: balconyPrice,
        }));

  const middleSeats: SeatItem[] =
    seatMap?.middle && seatMap.middle.length > 0
      ? seatMap.middle
      : Array.from({ length: middleSeatsCount }, (_, i) => ({
          seatId: `M${i + 1}`,
          tier: 'middle',
          price: middlePrice,
        }));

  const lowerSeats: SeatItem[] =
    seatMap?.lower && seatMap.lower.length > 0
      ? seatMap.lower
      : Array.from({ length: lowerSeatsCount }, (_, i) => ({
          seatId: `L${i + 1}`,
          tier: 'lower',
          price: lowerPrice,
        }));

  // Helper to chunk seats into rows of 10 for neat cinema columns
  const chunkRows = (seats: SeatItem[], perRow = 10) => {
    const rows: SeatItem[][] = [];
    for (let i = 0; i < seats.length; i += perRow) {
      rows.push(seats.slice(i, i + perRow));
    }
    return rows;
  };

  const renderTierSection = (
    title: string,
    tierCode: 'B' | 'M' | 'L',
    seats: SeatItem[],
    tierColor: string,
    price: number
  ) => {
    if (seats.length === 0) return null;
    const rows = chunkRows(seats, 10);

    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${tierColor}`}></span>
            <span className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
              {title}
            </span>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
            ${price.toFixed(2)} / seat
          </span>
        </div>

        {/* Responsive horizontal scroller for 360px phones up to 1280px desktops */}
        <div className="w-full overflow-x-auto pb-3 flex justify-center">
          <div className="min-w-max flex flex-col gap-2.5 px-2">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex items-center justify-center gap-2">
                <span className="w-6 text-[10px] font-mono font-bold text-slate-500 text-center">
                  {tierCode}
                  {rowIdx + 1}
                </span>

                <div className="flex gap-1.5 sm:gap-2">
                  {row.map((seat) => {
                    const isBooked = bookedSeats.includes(seat.seatId);
                    const isSelected = selectedSeats.includes(seat.seatId);

                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        disabled={isBooked}
                        onClick={() => onToggleSeat(seat.seatId)}
                        title={`Seat ${seat.seatId} • $${seat.price.toFixed(2)} ${
                          isBooked ? '(Booked)' : isSelected ? '(Selected)' : '(Available)'
                        }`}
                        className={`w-8 h-8 sm:w-10 sm:h-9 rounded-lg text-[10px] sm:text-xs font-mono font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
                          isBooked
                            ? 'bg-slate-900/80 text-slate-600 border border-slate-800/80 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 border border-red-400 scale-105'
                            : 'bg-slate-950 text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 active:scale-95'
                        }`}
                      >
                        {seat.seatId}
                      </button>
                    );
                  })}
                </div>

                <span className="w-6 text-[10px] font-mono font-bold text-slate-500 text-center">
                  {tierCode}
                  {rowIdx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-xl flex flex-col items-center w-full">
      {/* Curved Screen Banner */}
      <div className="w-full max-w-lg text-center mb-8">
        <div className="h-2 rounded-t-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-lg shadow-red-500/25 mb-2.5"></div>
        <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
          AUDITORIUM SCREEN (EYE LEVEL)
        </span>
      </div>

      {/* Seat order, nearest the screen first: Lower -> Middle -> Balcony (farthest) */}
      {renderTierSection('Lower Tier (Standard)', 'L', lowerSeats, 'bg-emerald-500', lowerPrice)}

      {renderTierSection('Middle Tier (Premium)', 'M', middleSeats, 'bg-blue-500', middlePrice)}

      {renderTierSection('Balcony Tier (VIP) - farthest from screen', 'B', balconySeats, 'bg-purple-500', balconyPrice)}

      {/* Seat Map Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-slate-800 w-full text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-950 border border-slate-700"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-600 shadow shadow-red-600/50"></div>
          <span className="text-white font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-900 border border-slate-800 opacity-60 line-through text-[8px] flex items-center justify-center text-slate-600">
            X
          </div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
}
