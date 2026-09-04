import { useEffect, useState } from 'react';
import api from '../../utils/api';
import KnowledgeFormModal from './KnowledgeFormModal';

// FR-3.1, FR-3.2, FR-3.3: manajemen pengetahuan bot
export default function KnowledgeTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ kategori: '', jawaban: '' });
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/knowledge', {
        params: kategoriFilter ? { kategori: kategoriFilter } : {},
      });
      setItems(res.data.data);
    } catch (err) {
      setError('Gagal memuat basis pengetahuan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kategoriFilter]);

  async function handleCreate(payload) {
    setSubmitting(true);
    try {
      await api.post('/admin/knowledge', payload);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal menambahkan entri');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Hapus entri pengetahuan ini beserta seluruh variasi pertanyaannya?')) return;
    try {
      await api.delete(`/admin/knowledge/${id}`);
      load();
    } catch (err) {
      setError('Gagal menghapus entri');
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditDraft({ kategori: item.kategori, jawaban: item.jawaban });
  }

  async function saveEdit(id) {
    try {
      await api.put(`/admin/knowledge/${id}`, editDraft);
      setEditingId(null);
      load();
    } catch (err) {
      setError('Gagal memperbarui entri');
    }
  }

  async function handleDeleteVariant(knowledgeId, variantId) {
    try {
      await api.delete(`/admin/knowledge/${knowledgeId}/variants/${variantId}`);
      load();
    } catch (err) {
      setError('Gagal menghapus variasi pertanyaan');
    }
  }

  const categories = [...new Set(items.map((i) => i.kategori))];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Manajemen Pengetahuan Bot</h2>
          <p className="text-sm text-gray-500">Kelola pasangan pertanyaan &amp; jawaban chatbot.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Entri Baru
          </button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Memuat data...</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
          Belum ada entri pengetahuan. Klik "Entri Baru" untuk menambahkan.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                  {item.kategori}
                </span>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => startEdit(item)} className="text-gray-500 hover:text-brand-600">
                    Ubah
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-600">
                    Hapus
                  </button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="mt-3 space-y-2">
                  <input
                    value={editDraft.kategori}
                    onChange={(e) => setEditDraft((p) => ({ ...p, kategori: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                  />
                  <textarea
                    value={editDraft.jawaban}
                    onChange={(e) => setEditDraft((p) => ({ ...p, jawaban: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-700">{item.jawaban}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.variants.map((v) => (
                  <span
                    key={v.id}
                    className="group inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {v.teks_pertanyaan}
                    <button
                      onClick={() => handleDeleteVariant(item.id, v.id)}
                      className="hidden text-gray-400 hover:text-red-500 group-hover:inline"
                      title="Hapus variasi ini"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <KnowledgeFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}
    </div>
  );
}
