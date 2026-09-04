import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../utils/api';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#16161d',
    border: '1px solid #2a2a35',
    borderRadius: '12px',
    color: '#f3f4f6',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,.5)',
  },
  labelStyle: { color: '#f3f4f6', fontWeight: 600 },
  itemStyle: { color: '#ec4899' },
  cursor: { fill: 'rgba(236,72,153,0.06)' },
};

export default function AnalyticsPanel() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard/stats', { params: { days } });
      setData(res.data.data);
    } catch (err) {
      setError('Gagal memuat statistik dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (loading) return <p className="text-sm text-bp-muted">Memuat statistik...</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!data) return null;

  const { summary, popular_questions: popular, session_trend: trend } = data;

  const cards = [
    { label: 'Total Sesi Chat', value: summary.total_sessions },
    { label: `Sesi ${days} Hari Terakhir`, value: summary.sessions_in_range },
    { label: 'Total Pesan Masuk', value: summary.total_messages },
    { label: 'Terjawab Otomatis', value: summary.total_answered },
    { label: 'Belum Terjawab', value: summary.total_unanswered },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-bp-pink">Dashboard Analitik</h2>
          <p className="text-sm text-bp-muted">Statistik penggunaan chatbot &amp; topik populer.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-lg border border-bp-border bg-bp-cardSoft px-3 py-2 text-sm text-bp-text"
        >
          <option value={7}>7 hari terakhir</option>
          <option value={14}>14 hari terakhir</option>
          <option value={30}>30 hari terakhir</option>
          <option value={90}>90 hari terakhir</option>
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-bp-border bg-bp-card p-4 transition-all hover:border-bp-pink/40">
            <p className="text-xs text-bp-muted">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-bp-text">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-bp-border bg-bp-card p-4">
        <p className="mb-3 text-sm font-semibold text-bp-text">Tren Volume Sesi Chat</p>
        {trend.length === 0 ? (
          <p className="text-sm text-bp-muted">Belum ada data sesi pada rentang ini.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#2a2a35" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#2a2a35" />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#ec4899" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-bp-border bg-bp-card p-4">
        <p className="mb-3 text-sm font-semibold text-bp-text">Pertanyaan / Topik Paling Populer</p>
        {popular.length === 0 ? (
          <p className="text-sm text-bp-muted">Belum ada pertanyaan terjawab pada rentang ini.</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={Math.max(180, popular.length * 40)}>
              <BarChart data={popular} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#2a2a35" />
                <YAxis type="category" dataKey="kategori" tick={{ fontSize: 11, fill: '#9ca3af' }} stroke="#2a2a35" width={110} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value) => [value, 'Jumlah ditanyakan']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.jawaban?.slice(0, 60) || label}
                />
                <Bar dataKey="total" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ul className="mt-3 space-y-1 text-xs text-bp-muted">
              {popular.map((p) => (
                <li key={p.knowledge_id} className="truncate">
                  <span className="font-semibold text-bp-text">{p.total}×</span> — {p.jawaban}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
