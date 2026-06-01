import { useEffect, useState } from 'react';

interface EventItem {
  _id: string;
  day: string;
  title: string;
  artist: string;
  time: string;
  description: string;
  color: string;
  order: number;
}

const COLOR_PRESETS = [
  { label: 'Burnt orange', value: '#BA401D' },
  { label: 'Rust', value: '#BB5524' },
  { label: 'Sand', value: '#E7A356' },
  { label: 'Gold', value: '#FFDA7F' },
  { label: 'Olive', value: '#7F6F34' },
];

const emptyForm = {
  day: '',
  title: '',
  artist: '',
  time: '',
  description: '',
  color: '#BB5524',
};

export default function AdminEvents() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/events');
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (item: EventItem) => {
    setEditingId(item._id);
    setForm({
      day: item.day,
      title: item.title,
      artist: item.artist,
      time: item.time,
      description: item.description,
      color: item.color,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };

    if (editingId) {
      await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    load();
  };

  const importDefaults = async (force = false) => {
    if (force && !confirm('Replace all events with the default weekly schedule? This cannot be undone.')) {
      return;
    }

    setSeeding(true);
    const res = await fetch('/api/admin/events/seed', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    const data = await res.json();
    setSeeding(false);

    if (data.skipped) {
      alert('Default events are already in the database.');
      return;
    }

    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (editingId === id) resetForm();
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#ffda7f]">
          {editingId ? 'Edit event' : 'Add event'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Day (e.g. Friday)"
            required
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <input
            placeholder="Time (e.g. 8:00 PM – 11:00 PM)"
            required
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <input
            placeholder="Event title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
          <input
            placeholder="Artist / subtitle (e.g. DJ TBD)"
            value={form.artist}
            onChange={(e) => setForm({ ...form, artist: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
          <select
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          >
            {COLOR_PRESETS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356]"
          >
            {editingId ? 'Save changes' : 'Add event'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#f9e1cd]/30 px-6 py-2 text-sm text-[#f9e1cd]/80 hover:border-[#ffda7f]"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-[#f9e1cd]/80">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-8 text-center space-y-4">
          <p className="text-[#f9e1cd]/80">
            No events in the database yet. Import the 5 default weekly events from the website.
          </p>
          <button
            type="button"
            onClick={() => importDefaults(false)}
            disabled={seeding}
            className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356] disabled:opacity-50"
          >
            {seeding ? 'Importing…' : 'Import default events'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#f9e1cd]/60">{items.length} events in database</p>
            <button
              type="button"
              onClick={() => importDefaults(true)}
              disabled={seeding}
              className="text-xs text-[#f9e1cd]/60 hover:text-[#ffda7f] disabled:opacity-50"
            >
              Reset to default schedule
            </button>
          </div>
          {items.map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-4 sm:p-5"
              style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-[#ffda7f]">{item.day}</p>
                  <p className="mt-1 font-medium text-[#f9e1cd]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#f9e1cd]/70">{item.artist} · {item.time}</p>
                  {item.description && (
                    <p className="mt-2 text-sm text-[#f9e1cd]/60 line-clamp-2">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="min-h-[44px] px-2 py-2 text-sm text-[#ffda7f] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="min-h-[44px] px-2 py-2 text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
