import { useEffect, useState } from 'react';

interface BlogPost {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  published: boolean;
  readingTime: number;
}

export default function AdminBlog() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', excerpt: '', tag: 'vizag eats', body: '', published: false, readingTime: 5,
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/blog');
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/blog', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', excerpt: '', tag: 'vizag eats', body: '', published: false, readingTime: 5 });
    load();
  };

  const togglePublish = async (id: string, published: boolean) => {
    await fetch('/api/admin/blog', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, published: !published }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-6 space-y-4">
        <h2 className="font-serif text-xl text-[#ffda7f]">New blog post</h2>
        <input
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
        />
        <textarea
          placeholder="Excerpt"
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
        />
        <textarea
          placeholder="Body content (markdown/plain text)"
          rows={5}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="w-full rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
        />
        <div className="flex flex-wrap gap-4">
          <input
            placeholder="Tag"
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-4 py-2 text-[#f9e1cd]"
          />
          <label className="flex items-center gap-2 text-sm text-[#f9e1cd]/80">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Publish immediately
          </label>
        </div>
        <button type="submit" className="rounded-full bg-[#ffda7f] px-6 py-2 text-sm font-semibold text-[#1b1b1b] hover:bg-[#e7a356]">
          Create post
        </button>
      </form>

      {loading ? (
        <p className="text-[#f9e1cd]/80">Loading…</p>
      ) : (
        <div className="space-y-4">
          {items.map((post) => (
            <div key={post._id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-4">
              <div>
                <p className="font-medium text-[#f9e1cd]">{post.title}</p>
                <p className="text-xs text-[#e7a356] mt-1">{post.tag} · /blog/{post.slug}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${post.published ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => togglePublish(post._id, post.published)}
                  className="text-xs text-[#ffda7f] hover:underline"
                >
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button type="button" onClick={() => remove(post._id)} className="text-xs text-red-400 hover:underline">
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
