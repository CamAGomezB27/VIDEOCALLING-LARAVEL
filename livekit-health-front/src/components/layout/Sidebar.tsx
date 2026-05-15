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
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "new",
    label: "Agendar cita",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
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
  const accent = isPatient
    ? {
        glow: "bg-blue-500/20",
        active: "text-blue-300 bg-blue-500/10 border-blue-500/20",
        dot: "bg-blue-400",
      }
    : {
        glow: "bg-[#00d4aa]/20",
        active: "text-[#7ff5dc] bg-[#00d4aa]/10 border-[#00d4aa]/20",
        dot: "bg-[#00d4aa]",
      };

  return (
    <aside
      className="relative w-60 shrink-0 overflow-hidden
                 border-r border-white/10
                 bg-[#0f1722]/90 backdrop-blur-2xl
                 flex flex-col p-4"
    >
      {/* Glow background */}
      <div
        className={`absolute -top-20 -left-20 h-60 w-60 rounded-full blur-3xl ${accent.glow}`}
      />

      {/* Brand */}
      <div className="relative flex items-center gap-2 px-2 py-4 mb-6">
        <div className="relative">
          <div className={`h-2 w-2 rounded-full ${accent.dot}`} />
          <div
            className={`absolute inset-0 animate-ping rounded-full opacity-40 ${accent.dot}`}
          />
        </div>

        <span className="text-xs font-semibold tracking-[0.35em] text-[#00d4aa] uppercase">
          MediCall
        </span>
      </div>

      {/* User card */}
      <div
        className="relative mb-6 rounded-2xl border border-white/10
                   bg-white/[0.03] p-3 backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center
                        text-sm font-medium border
                        ${
                          isPatient
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                            : "bg-[#00d4aa]/10 text-[#7ff5dc] border-[#00d4aa]/20"
                        }`}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#e8f0f7]">
              {userName}
            </p>
            <p className="text-xs text-[#6c859d] font-mono">{userRole}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => {
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group relative flex items-center gap-3
                          rounded-xl px-3 py-2.5 text-sm font-medium
                          transition-all border cursor-pointer
                          ${
                            active
                              ? accent.active
                              : "border-transparent text-[#6c859d] hover:text-[#e8f0f7] hover:bg-white/[0.03]"
                          }`}
            >
              {/* active indicator line */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-current" />
              )}

              <span className="h-4 w-4 opacity-80">{item.icon}</span>

              <span>{item.label}</span>

              {/* hover arrow */}
              {!active && (
                <span className="ml-auto opacity-0 translate-x-[-4px] transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-3 flex items-center gap-3 rounded-xl
                   px-3 py-2.5 text-sm text-[#6c859d] cursor-pointer
                   transition-all hover:text-red-400 hover:bg-red-500/10"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Cerrar sesión
      </button>
    </aside>
  );
}
