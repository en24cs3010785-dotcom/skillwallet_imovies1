import React, { useState } from 'react';
import { Shield, PlusCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { useCinema } from '../context/CinemaContext';

export default function AdminDashboard() {
  const { movies, addMovie, deleteMovie } = useCinema();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const genre = (form.elements.namedItem('genre') as HTMLSelectElement).value;
    const certification = (form.elements.namedItem('certification') as HTMLSelectElement).value as 'U' | 'UA' | 'A' | 'S';
    const duration = Number((form.elements.namedItem('duration') as HTMLInputElement).value);
    const poster = (form.elements.namedItem('poster') as HTMLInputElement).value;
    const desc = (form.elements.namedItem('desc') as HTMLTextAreaElement).value;

    addMovie({
      title,
      movieName: title,
      genre,
      genres: [genre],
      language: 'English',
      duration,
      runtime: duration,
      certification,
      poster,
      media: { poster },
      rating: 8.5,
      releaseDate: new Date().toISOString().split('T')[0],
      description: desc,
    });

    setSuccessMsg(`"${title}" (${certification}) successfully added to movie catalog.`);
    form.reset();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-7 h-7 text-amber-400" />
        <h1 className="text-3xl font-extrabold text-white">Admin Management Panel</h1>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Movie Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-red-500" /> Add New Movie Release (ER Target Schema)
        </h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 font-medium">Movie Title (movieName)</label>
              <input
                name="title"
                required
                placeholder="e.g. Gladiator II"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Certification</label>
              <select
                name="certification"
                defaultValue="UA"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              >
                <option value="U">U (Universal)</option>
                <option value="UA">UA (Parental Guidance)</option>
                <option value="A">A (Adults 18+)</option>
                <option value="S">S (Special Category)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Genre</label>
              <select
                name="genre"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              >
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Action">Action</option>
                <option value="Animation">Animation</option>
                <option value="Biography">Biography</option>
                <option value="Drama">Drama</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Runtime (Minutes)</label>
              <input
                name="duration"
                type="number"
                defaultValue={140}
                required
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium">Poster Image URL</label>
              <input
                name="poster"
                type="url"
                defaultValue="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"
                required
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Plot Description</label>
            <textarea
              name="desc"
              rows={2}
              required
              placeholder="Brief plot outline..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow cursor-pointer"
          >
            Save Movie to Catalog
          </button>
        </form>
      </div>

      {/* Catalog List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Active Movies ({movies.length})</h2>
        <div className="divide-y divide-slate-800">
          {movies.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={m.poster} alt={m.title} className="w-10 h-14 object-cover rounded-lg" />
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{m.title || m.movieName}</span>
                    {m.certification && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800">
                        {m.certification}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {m.genre} • {m.duration || m.runtime} min • ★ {(m.rating || 8.5).toFixed(1)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${m.title || m.movieName}?`)) {
                    deleteMovie(m.id);
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
