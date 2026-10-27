/**
 * In-browser backend for environments that cannot run the Express + MongoDB
 * server (e.g. Google AI Studio). It mimics the REST API in /server and keeps
 * its data in localStorage, so booking, cancelling, login, favourites and the
 * admin screen all work with no server.
 *
 * It is switched on automatically when VITE_API_URL is NOT set
 * (see axiosInstance.ts). Set VITE_API_URL to use the real backend instead.
 */
import { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const DB_KEY = 'imovies_local_db_v1';
const TIERS = { lowerPrice: 150, middlePrice: 250, balconyPrice: 400 };

type Json = Record<string, any>;

interface DB {
  users: Json[];
  admins: Json[];
  movies: Json[];
  theatres: Json[];
  shows: Json[];
  bookings: Json[];
  favorites: Json[];
}

const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const pad = (n: number) => String(n).padStart(2, '0');
const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* ------------------------------ seed data ------------------------------ */

const seedMovies = (): Json[] => [
  {
    _id: 'm1',
    movieId: 'MOV-DUNE2024',
    movieName: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    releaseDate: '2024-03-01',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    runtime: 166,
    certification: 'UA',
    rating: 8.6,
    media: { poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' },
  },
  {
    _id: 'm2',
    movieId: 'MOV-OPPN2023',
    movieName: 'Oppenheimer',
    genres: ['Biography', 'Drama', 'History'],
    releaseDate: '2023-07-21',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    runtime: 180,
    certification: 'A',
    rating: 8.9,
    media: { poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=80' },
  },
  {
    _id: 'm3',
    movieId: 'MOV-INST2024',
    movieName: 'Interstellar: 10th Anniversary',
    genres: ['Sci-Fi', 'Adventure'],
    releaseDate: '2024-09-27',
    description:
      'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history.',
    runtime: 169,
    certification: 'UA',
    rating: 8.7,
    media: { poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80' },
  },
  {
    _id: 'm4',
    movieId: 'MOV-SPID2023',
    movieName: 'Spider-Man: Across the Spider-Verse',
    genres: ['Animation', 'Action', 'Adventure'],
    releaseDate: '2023-06-02',
    description:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
    runtime: 140,
    certification: 'U',
    rating: 8.7,
    media: { poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80' },
  },
];

const seedTheatres = (): Json[] => [
  {
    _id: 'th1',
    theatreId: 'THR-GRAND01',
    theatreName: 'Grand IMAX Downtown',
    location: { city: 'Downtown', address: '450 Cinema Blvd' },
    lowerSeats: 20,
    middleSeats: 30,
    balconySeats: 10,
    lowerSeatPrice: TIERS.lowerPrice,
    middleSeatPrice: TIERS.middlePrice,
    balconySeatPrice: TIERS.balconyPrice,
  },
  {
    _id: 'th2',
    theatreId: 'THR-STAR02',
    theatreName: 'Starlight Multiplex',
    location: { city: 'Uptown', address: '12 Skyline Avenue' },
    lowerSeats: 20,
    middleSeats: 30,
    balconySeats: 10,
    lowerSeatPrice: 120,
    middleSeatPrice: 200,
    balconySeatPrice: 350,
  },
];

/** Makes sure every movie has upcoming shows for today + the next 2 days. */
const ensureShows = (db: DB) => {
  const times = [['10:30', '18:30'], ['14:00', '21:45']];
  const now = new Date();
  for (let day = 0; day < 3; day++) {
    const date = localDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + day));
    db.theatres.slice(0, 2).forEach((theatre, tIdx) => {
      db.movies.slice(0, 4).forEach((movie, mIdx) => {
        // 4 movies share 2 time slots per theatre: movies 0,1 -> slot 0/1 ... staggered per theatre
        const time = times[(mIdx + tIdx) % 2][Math.floor(mIdx / 2)];
        const exists = db.shows.some(
          (s) => s.theatre === theatre._id && s.showdate === date && s.showtime === time
        );
        if (exists) return;
        db.shows.push({
          _id: `show_${date}_${theatre._id}_${time.replace(':', '')}`,
          showId: uid('SHW'),
          movie: movie._id,
          movieId: movie.movieId,
          theatre: theatre._id,
          theatreName: theatre.theatreName,
          showdate: date,
          showtime: time,
          tickets: { bookedSeats: [] },
        });
      });
    });
  }
};

const loadDB = (): DB => {
  let db: DB | null = null;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw);
  } catch {
    db = null;
  }
  if (!db) {
    db = {
      users: [{ _id: 'u_demo', username: 'AlexMorgan', email: 'customer@imovies.com', password: 'password123' }],
      admins: [{ _id: 'a_demo', username: 'CinemaAdmin', email: 'admin@imovies.com', password: 'password123' }],
      movies: seedMovies(),
      theatres: seedTheatres(),
      shows: [],
      bookings: [],
      favorites: [],
    };
  }
  ensureShows(db);
  saveDB(db);
  return db;
};

const saveDB = (db: DB) => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable: data lives only for this request */
  }
};

/* ------------------------------ helpers -------------------------------- */

const buildSeatMap = (t: Json) => {
  const make = (prefix: string, tier: string, count: number, price: number) =>
    Array.from({ length: Math.max(0, Number(count) || 0) }, (_, i) => ({
      seatId: `${prefix}${i + 1}`,
      tier,
      price: Number(price) || 0,
    }));
  return {
    lower: make('L', 'lower', t.lowerSeats, t.lowerSeatPrice),
    middle: make('M', 'middle', t.middleSeats, t.middleSeatPrice),
    balcony: make('B', 'balcony', t.balconySeats, t.balconySeatPrice),
  };
};

const priceOf = (seatId: string, t: Json) => {
  const c = seatId.toUpperCase();
  if (c.startsWith('L')) return { tier: 'lower', price: Number(t.lowerSeatPrice) || 0 };
  if (c.startsWith('M')) return { tier: 'middle', price: Number(t.middleSeatPrice) || 0 };
  if (c.startsWith('B')) return { tier: 'balcony', price: Number(t.balconySeatPrice) || 0 };
  return { tier: 'standard', price: Number(t.middleSeatPrice) || 150 };
};

const populateShow = (db: DB, s: Json) => ({
  ...s,
  movie: db.movies.find((m) => m._id === s.movie) || null,
  theatre: db.theatres.find((t) => t._id === s.theatre) || null,
});

const populateBooking = (db: DB, b: Json) => ({
  ...b,
  seats: b.ticketsData.seats.map((s: Json) => s.seatId),
  totalAmount: b.ticketsData.totalAmount,
  show: (() => {
    const s = db.shows.find((x) => x._id === b.show);
    return s ? populateShow(db, s) : null;
  })(),
});

const makeToken = (payload: Json) => 'local.' + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

const readToken = (config: InternalAxiosRequestConfig): Json | null => {
  const header = String(config.headers?.Authorization ?? (config.headers as any)?.get?.('Authorization') ?? '');
  if (!header.startsWith('Bearer local.')) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(header.slice('Bearer local.'.length)))));
  } catch {
    return null;
  }
};

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------- routes -------------------------------- */

const handle = (method: string, path: string, body: Json, auth: Json | null): { status: number; data: Json } => {
  const db = loadDB();
  const requireAuth = () => {
    if (!auth) throw new HttpError(401, 'Not authorized: please log in again');
    return auth;
  };

  const makeAuthResponse = (account: Json, isAdmin: boolean, message: string, status = 200) => {
    const user = {
      id: account._id,
      username: account.username,
      name: account.username,
      email: account.email,
      role: isAdmin ? 'admin' : 'customer',
      isAdmin,
    };
    const token = makeToken({ id: account._id, email: account.email, username: account.username, isAdmin, ts: Date.now() });
    return { status, data: { success: true, message, data: { token, user } } };
  };

  /* ---- auth ---- */
  if (method === 'post' && path === '/auth/login') {
    const email = String(body.email || '').toLowerCase().trim();
    const admin = db.admins.find((a) => a.email === email && a.password === body.password);
    if (admin) return makeAuthResponse(admin, true, 'Admin logged in successfully');
    const user = db.users.find((u) => u.email === email && u.password === body.password);
    if (user) return makeAuthResponse(user, false, 'Logged in successfully');
    throw new HttpError(401, 'Invalid email or password');
  }

  if (method === 'post' && path === '/auth/register') {
    const username = String(body.username || body.name || '').trim();
    const email = String(body.email || '').toLowerCase().trim();
    if (!username || !email || !body.password) throw new HttpError(400, 'Please provide username, email, and password');
    if (String(body.password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters long');
    if (db.users.some((u) => u.email === email) || db.admins.some((a) => a.email === email)) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    const user = { _id: uid('u'), username, email, password: body.password };
    db.users.push(user);
    saveDB(db);
    return makeAuthResponse(user, false, 'Account created successfully', 201);
  }

  if (method === 'get' && path === '/auth/profile') {
    const a = requireAuth();
    const account = (a.isAdmin ? db.admins : db.users).find((x) => x._id === a.id);
    if (!account) throw new HttpError(401, 'Account not found. Please log in again.');
    return {
      status: 200,
      data: {
        success: true,
        data: { _id: account._id, username: account.username, email: account.email, role: a.isAdmin ? 'admin' : 'customer', isAdmin: !!a.isAdmin },
      },
    };
  }

  /* ---- movies ---- */
  if (method === 'get' && path === '/movies') {
    return { status: 200, data: { success: true, count: db.movies.length, data: db.movies } };
  }

  if (method === 'post' && path === '/movies') {
    const a = requireAuth();
    if (!a.isAdmin) throw new HttpError(403, 'Admin access required');
    const name = body.movieName || body.title;
    if (!name) throw new HttpError(400, 'Please enter movie name');
    const movie = {
      _id: uid('m'),
      movieId: uid('MOV'),
      movieName: name,
      genres: body.genres || (body.genre ? [body.genre] : []),
      releaseDate: body.releaseDate || localDate(new Date()),
      description: body.description || '',
      runtime: Number(body.runtime || body.duration) || 120,
      certification: body.certification || 'UA',
      rating: body.rating || 8.5,
      media: { poster: body.media?.poster || body.poster || '' },
    };
    db.movies.unshift(movie);
    ensureShows(db);
    saveDB(db);
    return { status: 201, data: { success: true, data: movie } };
  }

  let m = path.match(/^\/movies\/([^/]+)$/);
  if (method === 'delete' && m) {
    const a = requireAuth();
    if (!a.isAdmin) throw new HttpError(403, 'Admin access required');
    db.movies = db.movies.filter((x) => x._id !== m![1]);
    db.shows = db.shows.filter((s) => s.movie !== m![1]);
    saveDB(db);
    return { status: 200, data: { success: true, message: 'Movie deleted' } };
  }

  /* ---- shows ---- */
  if (method === 'get' && path === '/shows') {
    const list = [...db.shows]
      .sort((a, b) => (a.showdate + a.showtime).localeCompare(b.showdate + b.showtime))
      .map((s) => populateShow(db, s));
    return { status: 200, data: { success: true, count: list.length, data: list } };
  }

  m = path.match(/^\/shows\/([^/]+)$/);
  if (method === 'get' && m) {
    const show = db.shows.find((s) => s._id === m![1]);
    if (!show) throw new HttpError(404, 'Show not found');
    const populated = populateShow(db, show);
    return {
      status: 200,
      data: { success: true, data: { ...populated, seatMap: populated.theatre ? buildSeatMap(populated.theatre) : null } },
    };
  }

  /* ---- bookings ---- */
  if (method === 'post' && path === '/bookings') {
    const a = requireAuth();
    if (a.isAdmin) throw new HttpError(403, 'Admin accounts cannot book tickets. Please log in as a customer.');
    const { showId, seats } = body;
    if (!showId || !Array.isArray(seats) || seats.length === 0) {
      throw new HttpError(400, 'Please provide showId and an array of seats');
    }
    const cleanSeats: string[] = Array.from(new Set<string>(seats.map((s: any) => String(s).trim().toUpperCase())));
    const show = db.shows.find((s) => s._id === showId);
    if (!show) throw new HttpError(404, 'Showtime not found. Please go back and choose the showtime again.');
    const theatre = db.theatres.find((t) => t._id === show.theatre);
    if (!theatre) throw new HttpError(400, 'The theatre for this show no longer exists');

    const map = buildSeatMap(theatre);
    const valid = new Set([...map.lower, ...map.middle, ...map.balcony].map((s) => s.seatId));
    const invalid = cleanSeats.filter((s) => !valid.has(s));
    if (invalid.length) throw new HttpError(400, `Invalid seat(s) for this theatre: ${invalid.join(', ')}`);

    const [y, mo, d] = String(show.showdate).split('-').map(Number);
    const [h, mi] = String(show.showtime).split(':').map(Number);
    if (new Date(y, mo - 1, d, h, mi) < new Date()) {
      throw new HttpError(400, 'This showtime has already passed. Please select an upcoming screening.');
    }

    const taken = cleanSeats.filter((s) => show.tickets.bookedSeats.includes(s));
    if (taken.length) {
      throw new HttpError(409, `Seat(s) ${taken.join(', ')} were just booked by someone else. Please pick different seats.`);
    }

    show.tickets.bookedSeats.push(...cleanSeats);
    const seatsData = cleanSeats.map((seatId) => ({ seatId, ...priceOf(seatId, theatre) }));
    const booking = {
      _id: uid('bk'),
      bookingId: uid('BKG'),
      show: show._id,
      showId: show.showId,
      user: a.id,
      userEmail: a.email,
      ticketsData: { seats: seatsData, totalAmount: seatsData.reduce((sum, s) => sum + s.price, 0) },
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    db.bookings.unshift(booking);
    saveDB(db);
    return {
      status: 201,
      data: { success: true, message: 'Tickets booked successfully! Enjoy the show.', data: populateBooking(db, booking) },
    };
  }

  if (method === 'get' && path === '/bookings/my-bookings') {
    const a = requireAuth();
    const list = db.bookings.filter((b) => b.user === a.id).map((b) => populateBooking(db, b));
    return { status: 200, data: { success: true, count: list.length, data: list } };
  }

  m = path.match(/^\/bookings\/([^/]+)\/cancel$/);
  if (method === 'put' && m) {
    const a = requireAuth();
    const booking = db.bookings.find((b) => b._id === m![1]);
    if (!booking) throw new HttpError(404, 'Booking not found');
    if (booking.user !== a.id && !a.isAdmin) throw new HttpError(403, 'You can only cancel your own bookings');
    if (booking.status === 'cancelled') throw new HttpError(400, 'This booking has already been cancelled');
    booking.status = 'cancelled';
    const ids: string[] = booking.ticketsData.seats.map((s: Json) => s.seatId);
    const show = db.shows.find((s) => s._id === booking.show);
    if (show) show.tickets.bookedSeats = show.tickets.bookedSeats.filter((s: string) => !ids.includes(s));
    saveDB(db);
    return { status: 200, data: { success: true, message: 'Booking cancelled and seats released.', data: booking } };
  }

  /* ---- favourites ---- */
  m = path.match(/^\/favorites\/check\/([^/]+)$/);
  if (method === 'get' && m) {
    const a = requireAuth();
    return { status: 200, data: { success: true, isFavorited: db.favorites.some((f) => f.user === a.id && f.movie === m![1]) } };
  }

  if (method === 'post' && path === '/favorites/toggle') {
    const a = requireAuth();
    const idx = db.favorites.findIndex((f) => f.user === a.id && f.movie === body.movieId);
    if (idx >= 0) db.favorites.splice(idx, 1);
    else db.favorites.push({ user: a.id, movie: body.movieId });
    saveDB(db);
    return { status: 200, data: { success: true, isFavorited: idx < 0 } };
  }

  throw new HttpError(404, `Endpoint Not Found: [${method.toUpperCase()}] ${path}`);
};

/* ------------------------------ axios adapter -------------------------- */

export const localAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const method = (config.method || 'get').toLowerCase();
  const path = String(config.url || '').split('?')[0].replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '');
  let body: Json = {};
  if (typeof config.data === 'string' && config.data) {
    try {
      body = JSON.parse(config.data);
    } catch {
      body = {};
    }
  } else if (config.data && typeof config.data === 'object') {
    body = config.data;
  }

  await new Promise((r) => setTimeout(r, 120)); // feel like a network call

  const build = (status: number, data: Json): AxiosResponse => ({
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
    request: {},
  });

  try {
    const { status, data } = handle(method, path, body, readToken(config));
    return build(status, data);
  } catch (err: any) {
    const status = err instanceof HttpError ? err.status : 500;
    const response = build(status, { success: false, message: err?.message || 'Server error' });
    throw new AxiosError(
      response.data.message,
      status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      response.request,
      response
    );
  }
};
