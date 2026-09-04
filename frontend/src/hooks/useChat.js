import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../utils/api';

const SESSION_KEY = 'ppdb_chat_session_id';

// Mengelola sesi chat real-time (FR-1.3, FR-1.4) untuk widget publik
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [bot, setBot] = useState({ nama_bot: 'Al-Bahri Assistant', pesan_sapaan: '', avatar: null });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const sessionIdRef = useRef(localStorage.getItem(SESSION_KEY));

  useEffect(() => {
    async function init() {
      try {
        const res = await api.post('/chat/session', {
          session_identifier: sessionIdRef.current,
        });
        const { session_identifier, bot: botProfile } = res.data.data;
        sessionIdRef.current = session_identifier;
        localStorage.setItem(SESSION_KEY, session_identifier);
        setBot(botProfile);
        setMessages([
          {
            id: 'greeting',
            from: 'bot',
            text: botProfile.pesan_sapaan,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setMessages([
          {
            id: 'greeting-error',
            from: 'bot',
            text: 'Maaf, chatbot sedang tidak dapat diakses. Silakan coba lagi nanti.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    const userMsg = {
      id: `local-${Date.now()}`,
      from: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Jeda minimum supaya indikator "Mengetik..." muncul dulu
      const MIN_TYPING_MS = 1200;
      const [res] = await Promise.all([
        api.post('/chat/message', {
          session_identifier: sessionIdRef.current,
          message: text.trim(),
        }),
        new Promise((resolve) => setTimeout(resolve, MIN_TYPING_MS)),
      ]);

      const { message } = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          from: 'bot',
          text: message.jawaban,
          isAnswered: message.is_answered,
          score: message.similarity_score,
          timestamp: message.timestamp,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          from: 'bot',
          text: 'Terjadi kesalahan saat menghubungi server. Silakan coba lagi.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, bot, loading, initializing, sendMessage };
}
