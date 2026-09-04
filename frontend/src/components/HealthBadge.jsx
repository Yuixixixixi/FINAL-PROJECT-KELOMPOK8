import { useHealthCheck } from '../hooks/useHealthCheck';

const STATUS_STYLES = {
  checking: { label: 'Memeriksa server...', dot: 'bg-bp-muted', text: 'text-bp-muted' },
  up: { label: 'Server aktif', dot: 'bg-bp-pinkBright', text: 'text-bp-pink' },
  down: { label: 'Server tidak dapat dijangkau', dot: 'bg-red-500', text: 'text-red-400' },
};

export default function HealthBadge() {
  const status = useHealthCheck();
  const style = STATUS_STYLES[status] || STATUS_STYLES.checking;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-bp-border bg-bp-card px-2.5 py-1 text-xs font-medium ${style.text}`}
      title="Status koneksi ke backend"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
