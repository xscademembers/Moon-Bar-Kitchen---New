import { useEffect, useState } from 'react';

interface Reservation {
  _id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  people: number | null;
  prizeLabel: string | null;
  status: string;
  createdAt: string;
}

const STATUSES = ['pending', 'confirmed', 'seated', 'cancelled', 'no_show'];

export default function AdminReservations() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/reservations');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/reservations', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  if (loading) return <p className="text-[#f9e1cd]/80">Loading reservations…</p>;

  if (items.length === 0) {
    return <p className="rounded-xl border border-[#f9e1cd]/10 bg-[#222] p-8 text-center text-[#f9e1cd]/80">No reservations yet. Leads from the spin wheel form will appear here.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#f9e1cd]/10">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-[#f9e1cd]/10 bg-[#222] text-xs uppercase tracking-wider text-[#e7a356]">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Date / Time</th>
            <th className="px-4 py-3">Guests</th>
            <th className="px-4 py-3">Prize</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r._id} className="border-b border-[#f9e1cd]/5 hover:bg-[#414c2f]/30">
              <td className="px-4 py-3 font-medium text-[#f9e1cd]">{r.name}</td>
              <td className="px-4 py-3 text-[#f9e1cd]/80">{r.phone}</td>
              <td className="px-4 py-3 text-[#f9e1cd]/80">{r.date} · {r.time}</td>
              <td className="px-4 py-3 text-[#f9e1cd]/80">{r.people ?? '—'}</td>
              <td className="px-4 py-3 text-[#ffda7f]">{r.prizeLabel ?? '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r._id, e.target.value)}
                  className="rounded-lg border border-[#f9e1cd]/20 bg-[#1a1a1a] px-2 py-1 text-[#f9e1cd] text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
