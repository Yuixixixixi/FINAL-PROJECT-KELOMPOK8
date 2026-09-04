import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';

function scoreLabel(score) {
  if (score === undefined || score === null) return null;
  return `${(score * 100).toFixed(1)}%`;
}

// === DAFTAR PERTANYAAN YANG BISA DIKLIK ===
// Ganti isinya sesuai kebutuhan info PPDB sekolahmu
const SUGGESTED_QUESTIONS = [
  'Apa saja syarat pendaftaran PPDB?',
  'Kapan jadwal PPDB dibuka?',
  'Berapa biaya daftar ulang?',
  'Jurusan apa saja yang tersedia?',
  'Bagaimana cara upload dokumen?',
];

export default function ChatWidget() {
  const { messages, bot, loading, initializing, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  }

  // Kirim pertanyaan yang diklik seperti user mengetik manual
  function handleQuestionClick(question) {
    if (loading) return;
    sendMessage(question);
  }

  // Munculkan chip bantuan di awal chat (sebelum user mengirim pesan)
  const showSuggestions =
    !initializing && messages.length <= 1 && !loading;

  return (
    <div className="flex h-[85vh] max-h-[900px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-bp-border bg-bp-card shadow-pink">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-bp-border bg-bp-cardSoft px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bp-pinkBright text-lg font-semibold text-bp-bg">
          {bot.avatar ? (
            <img src={bot.avatar} alt={bot.nama_bot} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            (bot.nama_bot || 'A').charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="font-display font-semibold leading-tight text-bp-text">
            {bot.nama_bot || 'Al-Bahri Assistant'}
          </p>
          <p className="text-xs text-bp-muted">Layanan Informasi PPDB • Online 24/7</p>
        </div>
      </div>

      {/* Messages */}
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto bg-bp-bg px-4 py-4">
        {initializing ? (
          <div className="flex h-full items-center justify-center text-sm text-bp-muted">
            Memuat chatbot...
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  m.from === 'user'
                    ? 'rounded-br-sm bg-bp-pinkBright font-medium text-bp-bg'
                    : 'rounded-bl-sm border border-bp-border bg-bp-cardSoft text-bp-text'
                }`}
              >
                {m.text}
                {m.from === 'bot' && m.score !== undefined && (
                  <p className="mt-1 text-[11px] text-bp-pink">
                    Skor kemiripan: {scoreLabel(m.score)}
                  </p>
                )}
                {m.from === 'bot' && m.isAnswered === false && (
                  <p className="mt-1 text-[11px] italic text-bp-muted">
                    Pertanyaan ini telah dicatat panitia untuk ditindaklanjuti.
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* === TOMBOL PERTANYAAN YANG BISA DIKLIK (muncul di dalam box chat) === */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuestionClick(q)}
                disabled={loading}
                className="rounded-full border border-bp-border bg-bp-card px-3 py-1.5 text-xs text-bp-text transition hover:border-bp-pink hover:bg-bp-pink hover:text-bp-bg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm border border-bp-border bg-bp-cardSoft px-4 py-2 text-sm text-bp-muted">
              Mengetik...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-bp-border bg-bp-card p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaan seputar PPDB..."
          className="input-bp flex-1"
          disabled={initializing}
        />
        <button type="submit" disabled={initializing || loading || !input.trim()} className="btn-pink">
          Kirim
        </button>
      </form>
    </div>
  );
}
