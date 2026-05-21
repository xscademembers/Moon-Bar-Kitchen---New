import { useEffect, useState } from 'react';

interface GalleryItem {
  _id: string;
  category: string;
  imageUrl: string;
  emoji: string;
}

const CATEGORIES = ['ambience', 'food', 'drinks', 'events'];

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'ambience', imageUrl: '', emoji: '🌙' });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/gallery');
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ category: 'ambience', imageUrl: '', emoji: '🌙' });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return;
    await fetch('/api/admin/gallery', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#ffda7f]">Add gallery item</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            placeholder="Image URL (https://...)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
          <input
            placeholder="Emoji fallback (optional)"
            value={form.emoji}
            onChange={(e) => setForm({ ...form, emoji: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
        </div>
        <button type="submit" className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356]">
          Add to gallery
        </button>
      </form>

      {loading ? (
        <p className="text-[#f9e1cd]/80">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-[#f9e1cd]/80">No gallery items. Add one above or static placeholders show on the site.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl border border-[#f9e1cd]/10 bg-[#222]">
              <div className="aspect-video bg-[#414c2f] flex items-center justify-center overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.category} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">{item.emoji}</span>
                )}
              </div>
              <div className="p-4">
                <p className="font-medium text-[#f9e1cd] capitalize">{item.category}</p>
                <button
                  type="button"
                  onClick={() => remove(item._id)}
                  className="mt-3 text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
