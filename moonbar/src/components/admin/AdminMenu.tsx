import { useEffect, useState } from 'react';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  imageUrl: string;
}

const CATEGORIES = [
  { slug: 'veg', label: 'Veg' },
  { slug: 'non-veg', label: 'Non-Veg' },
  { slug: 'beverages', label: 'Beverages' },
];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'veg',
  tags: '',
  imageUrl: '',
};

export default function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/menu');
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

  const startEdit = (item: MenuItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      tags: item.tags.join(', '),
      imageUrl: item.imageUrl,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      tags: form.tags,
      imageUrl: form.imageUrl,
    };

    if (editingId) {
      await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
    } else {
      await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    resetForm();
    load();
  };

  const importDefaults = async (force = false) => {
    if (force && !confirm('Replace all menu items with the default menu? This cannot be undone.')) {
      return;
    }

    setSeeding(true);
    const res = await fetch('/api/admin/menu/seed', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ force }),
    });
    const data = await res.json();
    setSeeding(false);

    if (data.skipped) {
      alert('Default menu items are already in the database.');
      return;
    }

    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    await fetch('/api/admin/menu', {
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
          {editingId ? 'Edit menu item' : 'Add menu item'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Item name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <input
            placeholder="Price (₹)"
            type="number"
            min={0}
            required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <input
            placeholder="Tags (comma-separated, e.g. chef-pick, spicy)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <input
            placeholder="Image URL (https://...)"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
          <textarea
            placeholder="Description"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd] sm:col-span-2"
          />
        </div>
        {form.imageUrl && (
          <img
            src={form.imageUrl}
            alt="Preview"
            className="h-32 w-full max-w-xs rounded-lg object-cover border border-[#f9e1cd]/20"
          />
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356]"
          >
            {editingId ? 'Save changes' : 'Add item'}
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
            No menu items in the database yet. Import the 12 default dishes from the public menu page.
          </p>
          <button
            type="button"
            onClick={() => importDefaults(false)}
            disabled={seeding}
            className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356] disabled:opacity-50"
          >
            {seeding ? 'Importing…' : 'Import default menu items'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#f9e1cd]/60">{items.length} items in database</p>
            <button
              type="button"
              onClick={() => importDefaults(true)}
              disabled={seeding}
              className="text-xs text-[#f9e1cd]/60 hover:text-[#ffda7f] disabled:opacity-50"
            >
              Reset to default menu
            </button>
          </div>
          {CATEGORIES.map((cat) => {
            const catItems = items.filter((i) => i.category === cat.slug);
            if (catItems.length === 0) return null;
            return (
              <div key={cat.slug}>
                <h3 className="mb-3 font-serif text-lg text-[#ffda7f]">{cat.label}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {catItems.map((item) => (
                    <div
                      key={item._id}
                      className="overflow-hidden rounded-xl border border-[#f9e1cd]/10 bg-[#222]"
                    >
                      <div className="h-32 bg-[#1a1a1a]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl opacity-30">🍽️</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-[#f9e1cd]">{item.name}</p>
                          <span className="text-sm text-[#ffda7f]">₹{item.price}</span>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-xs text-[#f9e1cd]/60 line-clamp-2">{item.description}</p>
                        )}
                        <div className="mt-4 flex gap-3">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
