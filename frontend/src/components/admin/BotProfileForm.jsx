import { useEffect, useState } from 'react';
import api from '../../utils/api';

// FR-6.1, FR-6.2, FR-6.3, FR-2.4: kustomisasi profil bot & threshold similarity
export default function BotProfileForm() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/bot-profile/admin');
      setForm(res.data.data);
    } catch (err) {
      setError('Gagal memuat profil bot');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put('/bot-profile/admin', {
        nama_bot: form.nama_bot,
        pesan_sapaan: form.pesan_sapaan,
        pesan_fallback: form.pesan_fallback,
        avatar: form.avatar,
        threshold: Number(form.threshold),
      });
      setMessage('Profil bot berhasil disimpan.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menyimpan profil bot');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <p className="text-sm text-gray-400">Memuat profil bot...</p>;

  return (
    <div className="max-w-xl">
      <h2 className="text-lg font-semibold text-gray-800">Profil &amp; Pesan Bot</h2>
      <p className="mt-1 text-sm text-gray-500">
        Sesuaikan identitas chatbot dan ambang batas (threshold) kemiripan pertanyaan.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Nama Bot</label>
          <input
            value={form.nama_bot}
            onChange={(e) => updateField('nama_bot', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Pesan Sapaan Awal</label>
          <textarea
            rows={2}
            value={form.pesan_sapaan}
            onChange={(e) => updateField('pesan_sapaan', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Pesan Fallback (saat pertanyaan tak terjawab)</label>
          <textarea
            rows={2}
            value={form.pesan_fallback}
            onChange={(e) => updateField('pesan_fallback', e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">URL Avatar Bot (opsional)</label>
          <input
            value={form.avatar || ''}
            onChange={(e) => updateField('avatar', e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Ambang Batas Kemiripan (threshold): {Number(form.threshold).toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={form.threshold}
            onChange={(e) => updateField('threshold', e.target.value)}
            className="mt-2 w-full accent-brand-600"
          />
          <p className="mt-1 text-xs text-gray-400">
            Semakin tinggi nilai, semakin ketat pencocokan (mengurangi salah jawab, tapi lebih banyak pertanyaan masuk ke inbox). Semakin rendah, cakupan jawaban lebih luas namun berisiko kurang akurat.
          </p>
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
