const TABS = [
  { id: 'analytics', label: 'Dashboard', icon: '📊' },
  { id: 'knowledge', label: 'Basis Pengetahuan', icon: '📚' },
  { id: 'unanswered', label: 'Belum Terjawab', icon: '📥' },
  { id: 'profile', label: 'Profil Bot', icon: '🤖' },
];

export default function Sidebar({ active, onChange, admin, onLogout }) {
  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <p className="text-sm font-semibold text-gray-800">Panel Panitia PPDB</p>
        <p className="text-xs text-gray-400">SMK Al-Bahri Bekasi</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active === tab.id
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-100 px-4 py-4">
        <p className="truncate text-sm font-medium text-gray-700">{admin?.nama}</p>
        <p className="truncate text-xs text-gray-400">@{admin?.username}</p>
        <button
          onClick={onLogout}
          className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
