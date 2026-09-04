import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function KnowledgeFormModal({ isOpen, onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    pertanyaan_utama: '',
    jawaban: '',
    variasi: [{ id: crypto.randomUUID(), value: '' }]
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        pertanyaan_utama: initialData.pertanyaan_utama || '',
        jawaban: initialData.jawaban || '',
        variasi: initialData.variasi_tambahan?.length > 0
          ? initialData.variasi_tambahan.map(v => ({ id: crypto.randomUUID(), value: v }))
          : [{ id: crypto.randomUUID(), value: '' }]
      });
    } else {
      setForm({
        pertanyaan_utama: '',
        jawaban: '',
        variasi: [{ id: crypto.randomUUID(), value: '' }]
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    setForm(prev => ({
      ...prev,
      variasi: [...prev.variasi, { id: crypto.randomUUID(), value: '' }]
    }));
  };

  const handleRemoveVariant = (id) => {
    setForm(prev => ({
      ...prev,
      variasi: prev.variasi.filter(item => item.id !== id)
    }));
  };

  const handleVariantChange = (id, val) => {
    setForm(prev => ({
      ...prev,
      variasi: prev.variasi.map(item => item.id === id ? { ...item, value: val } : item)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      pertanyaan_utama: form.pertanyaan_utama,
      jawaban: form.jawaban,
      variasi_tambahan: form.variasi.map(v => v.value.trim()).filter(Boolean)
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-bp-card border border-bp-border rounded-2xl p-6 text-bp-text shadow-2xl shadow-pink-500/10">
        <div className="flex items-center justify-between border-b border-bp-border pb-4 mb-5">
          <h2 className="text-xl font-bold text-bp-pink">
            {initialData ? 'Edit Knowledge Base' : 'Tambah Knowledge Baru'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bp-border rounded-lg text-bp-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-bp-pink mb-1 uppercase tracking-wider">
              Pertanyaan Utama
            </label>
            <input
              type="text"
              required
              value={form.pertanyaan_utama}
              onChange={(e) => setForm({ ...form, pertanyaan_utama: e.target.value })}
              className="w-full bg-bp-bg border border-bp-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-bp-pink transition-colors"
              placeholder="Contoh: Berapa biaya pendaftaran PPDB?"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-bp-pink mb-1 uppercase tracking-wider">
              Jawaban
            </label>
            <textarea
              required
              rows={3}
              value={form.jawaban}
              onChange={(e) => setForm({ ...form, jawaban: e.target.value })}
              className="w-full bg-bp-bg border border-bp-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-bp-pink transition-colors"
              placeholder="Tuliskan jawaban resmi..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-bp-pink uppercase tracking-wider">
                Variasi Pertanyaan (Typo / Pengucapan Lain)
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-xs text-bp-pink hover:text-bp-pinkBright font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Tambah Variasi
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {form.variasi.map((item) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleVariantChange(item.id, e.target.value)}
                    className="flex-1 bg-bp-bg border border-bp-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-bp-pink"
                    placeholder="Contoh: brp biaya ppdb?"
                  />
                  {form.variasi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(item.id)}
                      className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-bp-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-bp-border text-bp-muted hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-bp-pink hover:bg-bp-pinkBright text-black font-semibold shadow-lg shadow-pink-500/20 transition-all"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}