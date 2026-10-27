/**
 * Seat ID Scheme:
 *   Lower seats:   L1 ... L{lowerSeats}
 *   Middle seats:  M1 ... M{middleSeats}
 *   Balcony seats: B1 ... B{balconySeats}
 */

function buildSeatMap(theatre) {
  const lowerSeatsCount = Math.max(0, Number(theatre.lowerSeats) || 0);
  const middleSeatsCount = Math.max(0, Number(theatre.middleSeats) || 0);
  const balconySeatsCount = Math.max(0, Number(theatre.balconySeats) || 0);

  const lower = Array.from({ length: lowerSeatsCount }, (_, i) => ({
    seatId: `L${i + 1}`,
    tier: 'lower',
    price: Number(theatre.lowerSeatPrice) || 0,
  }));

  const middle = Array.from({ length: middleSeatsCount }, (_, i) => ({
    seatId: `M${i + 1}`,
    tier: 'middle',
    price: Number(theatre.middleSeatPrice) || 0,
  }));

  const balcony = Array.from({ length: balconySeatsCount }, (_, i) => ({
    seatId: `B${i + 1}`,
    tier: 'balcony',
    price: Number(theatre.balconySeatPrice) || 0,
  }));

  return { lower, middle, balcony };
}

function priceOf(seatId, theatre) {
  const cleanId = String(seatId).trim().toUpperCase();

  if (cleanId.startsWith('L')) {
    return {
      tier: 'lower',
      price: Number(theatre.lowerSeatPrice) || 0,
    };
  }

  if (cleanId.startsWith('M')) {
    return {
      tier: 'middle',
      price: Number(theatre.middleSeatPrice) || 0,
    };
  }

  if (cleanId.startsWith('B')) {
    return {
      tier: 'balcony',
      price: Number(theatre.balconySeatPrice) || 0,
    };
  }

  // Fallback if legacy code like "A1" or "C5"
  return {
    tier: 'standard',
    price: Number(theatre.middleSeatPrice) || Number(theatre.lowerSeatPrice) || 150,
  };
}

module.exports = {
  buildSeatMap,
  priceOf,
};
