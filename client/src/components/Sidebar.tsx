import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const adminNav = [
  { to: "/admin",          icon: "🏠", label: "Overview"  },
  { to: "/admin/courses",  icon: "📚", label: "Courses"   },
  { to: "/admin/students", icon: "👥", label: "Students"  },
  { to: "/admin/lessons",  icon: "🎬", label: "Lessons"   },
];
const userNav = [
  { to: "/dashboard",          icon: "🏠", label: "Home"     },
  { to: "/dashboard/courses",  icon: "📚", label: "Courses"  },
  { to: "/dashboard/progress", icon: "📈", label: "Progress" },
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : userNav;
  const initials = (n: string) => n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm shrink-0">🎓</div>
        <span className="font-bold text-gray-900 dark:text-white text-sm">LearnHub</span>
      </div>

      {isAdmin && (
        <div className="mx-3 mb-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">🛡️ Admin</span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to}
            end={item.to === "/admin" || item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
        {/* Toggle */}
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <div className={`relative w-9 h-5 rounded-full transition-colors ${isDark ? "bg-indigo-600" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isDark ? "left-4" : "left-0.5"}`} />
          </div>
          <span>{isDark ? "☀️ Light" : "🌙 Dark"}</span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold shrink-0">
            {user ? initials(user.name ?? user.email) : "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name ?? user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>

        <button onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
