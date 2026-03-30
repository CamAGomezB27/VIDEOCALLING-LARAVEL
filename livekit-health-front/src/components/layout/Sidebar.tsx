"use client";

interface NavItem {
  id: "appointments" | "new";
  label: string;
  icon: React.ReactNode;
}

interface Props {
  userName: string;
  userRole: string;
  isPatient: boolean;
  activeTab: string;
  onTabChange: (tab: "appointments" | "new") => void;
  onLogout: () => void;
}

const navItems: NavItem[] = [
  {
    id: "appointments",
    label: "Mis citas",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "new",
    label: "Agendar cita",
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
];

export function Sidebar({
  userName,
  userRole,
  isPatient,
  activeTab,
  onTabChange,
  onLogout,
}: Props) {
  return (
    <aside
      className="w-56 shrink-0 bg-[#111820] border-r border-white/10
                      flex flex-col px-4 py-6 gap-0"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-2 mb-7">
        <div className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
        <span className="text-xs font-medium tracking-widest text-[#00d4aa] uppercase">
          MediCall
        </span>
      </div>

      {/* User */}
      <div
        className="flex items-center gap-3 p-3 bg-[#1a2330] border border-white/10
                      rounded-xl mb-6"
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center
                         text-sm font-medium shrink-0
                         ${
                           isPatient
                             ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                             : "bg-[#00d4aa]/15 text-[#00d4aa] border border-[#00d4aa]/20"
                         }`}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-[#e8f0f7] truncate">
            {userName}
          </span>
          <span className="text-xs text-[#5a7a96] font-mono">{userRole}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                        font-medium text-left transition-all
                        ${
                          activeTab === item.id
                            ? "bg-[#00d4aa]/10 text-[#00d4aa] border border-[#00d4aa]/15"
                            : "text-[#5a7a96] hover:bg-[#1a2330] hover:text-[#e8f0f7] border border-transparent"
                        }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm
                   text-[#5a7a96] hover:text-red-400 transition-colors mt-2"
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Cerrar sesión
      </button>
    </aside>
  );
}
