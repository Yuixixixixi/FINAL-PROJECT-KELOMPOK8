import { Link } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';
import HealthBadge from '../components/HealthBadge';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-bp-bg text-bp-text">
      <header className="border-b border-bp-border">
        <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-gradient-pink">Al-Bahri</span>
            <span className="text-sm text-bp-muted">Info PPDB</span>
          </div>
          <div className="flex items-center gap-4">
            <HealthBadge />
            <Link
              to="/admin/login"
              className="rounded-full border border-bp-pink px-4 py-1.5 text-sm font-medium text-bp-pink transition hover:bg-bp-pinkBright hover:text-bp-bg"
            >
              Masuk sebagai panitia
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6">
        <ChatWidget />
      </main>
    </div>
  );
}
