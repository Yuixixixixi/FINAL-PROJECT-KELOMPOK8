import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import KnowledgeTable from '../../components/admin/KnowledgeTable';
import UnansweredInbox from '../../components/admin/UnansweredInbox';
import AnalyticsPanel from '../../components/admin/AnalyticsPanel';
import BotProfileForm from '../../components/admin/BotProfileForm';
import HealthBadge from '../../components/HealthBadge';
import { useAuth } from '../../hooks/useAuth';

const PANELS = {
  analytics: AnalyticsPanel,
  knowledge: KnowledgeTable,
  unanswered: UnansweredInbox,
  profile: BotProfileForm,
};

export default function Dashboard() {
  const [active, setActive] = useState('analytics');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  const ActivePanel = PANELS[active];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} onChange={setActive} admin={admin} onLogout={handleLogout} />
      <div className="flex-1">
        <header className="flex items-center justify-end border-b border-gray-100 bg-white px-6 py-3">
          <HealthBadge />
        </header>
        <main className="p-6">
          <ActivePanel />
        </main>
      </div>
    </div>
  );
}
