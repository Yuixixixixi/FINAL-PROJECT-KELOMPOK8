import { useEffect, useState } from 'react';
import api from '../utils/api';

// Cek status backend secara berkala — dipakai HealthBadge
export function useHealthCheck(intervalMs = 15000) {
  const [status, setStatus] = useState('checking'); // checking | up | down

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        await api.get('/health');
        if (mounted) setStatus('up');
      } catch {
        if (mounted) setStatus('down');
      }
    }

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return status;
}
