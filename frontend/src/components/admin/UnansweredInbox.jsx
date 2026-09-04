import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';

const STATUS_LABEL = {
  baru: { label: 'Baru', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  ditangani: { label: 'Terjawab', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  diabaikan: { label: 'Diabaikan', style: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
};

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'belum', label: 'Belum Dijawab' },
  { key: 'sudah', label: 'Sudah Dijawab' },
  { key: 'diabaikan', label: 'Diabaikan' },
];

export default function UnansweredInbox() {
  const [items, setItems] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/unanswered');
      setItems(res.data.data.items);
      setThreshold(res.data.data.threshold);
    } catch (err) {
      setError('Gagal memuat pesan belum terjawab');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'belum') return items.filter((i) => i.status === 'baru');
    if (filter === 'sudah') return items.filter((i) => i.status === 'ditangani');
    if (filter === 'diabaikan') return items.filter((i) => i.status === 'diabaikan');
    return items;
  }, [items, filter]);

  const counts = useMemo(() => ({
    semua: items.length,
    belum: items.filter((i) => i.status === 'baru').length,
    sudah: items.filter((i) => i.status === 'ditangani').length,
    diabaikan: items.filter((i) => i.status === 'diabaikan').length,
  }), [items]);

  async function setStatus(id, status) {
    try { await api.patch(`/admin/unanswered/${id}/status`, { status }); load(); }
    catch (err) { setError('Gagal memperbarui status'); }
  }

  async function convertToKnowledge(item) {
    const jawaban = window.prompt(`Jawaban untuk: "${item.pertanyaan}"`);
    if (!jawaban || !jawaban.trim()) return;
    const kategori = window.prompt('Kategori (kosongkan untuk "umum"):', 'umum');
    try {
      await api.post(`/admin/unanswered/${item.id}/convert`, {
        jawaban: jawaban.trim(),
        kategori: kategori && kategori.trim() ? kategori.trim() : 'umum',
      });
      load();
    } catch (err) { setError('Gagal menambahkan ke basis pengetahuan'); }
  }

  return (
    <div className="rounded-2xl border border-bp-border bg-bp-card p-6 text-bp-text shadow-xl">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-bp-pink">Pesan Tidak Terjawab / Typo</h2>
      </div>
      <p className="mb-4 text-xs text-bp-muted">
        Skor kemiripan dihitung mesin similarity terhadap basis pengetahuan
        {threshold !== null && ` (threshold aktif: ${(threshold * 100).toFixed(0)}%)`}.
      </p>

      {/* Filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
              filter === f.key
                ? 'border-bp-pink bg-bp-pink text-black shadow-[0_0_16px_rgba(236,72,153,.35)]'
                : 'border-bp-border bg-bp-bg text-bp-muted hover:border-bp-pink/50 hover:text-bp-text'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-sm text-bp-muted">Memuat pesan...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-bp-border py-8 text-center text-sm text-bp-muted">
              Tidak ada pesan pada filter ini.
            </p>
          ) : filtered.map((item) => {
              const score = Math.round((item.similarity_score ?? 0) * 100);
              const st = STATUS_LABEL[item.status] || STATUS_LABEL.baru;
              return (
                <div key={item.id} className="group flex flex-col justify-between gap-4 rounded-xl border border-bp-border bg-bp-bg p-4 transition-all hover:border-bp-pink/40 hover:shadow-[0_0_24px_rgba(236,72,153,.08)] md:flex-row md:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-bp-text">{item.pertanyaan}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs ${st.style}`}>{st.label}</span>
                    </div>
                    <p className="text-xs text-bp-muted">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
                    {/* Score bar */}
                    <div className="w-32">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-bp-muted">Kemiripan</span>
                        <span className={`font-bold ${score > 0 ? 'text-bp-pink' : 'text-zinc-500'}`}>{score}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-bp-pink to-fuchsia-400 transition-all"
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>
                    {item.status === 'baru' && (
                      <div className="flex gap-2">
                        <button onClick={() => convertToKnowledge(item)} className="rounded-lg border border-bp-pink/30 bg-bp-pink/10 px-3 py-1.5 text-xs font-semibold text-bp-pink transition-all hover:bg-bp-pink hover:text-black">+ Tambah ke KB</button>
                        <button onClick={() => setStatus(item.id, 'diabaikan')} className="rounded-lg border border-bp-border px-3 py-1.5 text-xs text-bp-muted transition-all hover:border-zinc-500 hover:text-zinc-300">Abaikan</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
