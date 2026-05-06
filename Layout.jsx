"import { NavLink, Outlet, useNavigate } from \"react-router-dom\";
import { ShieldCheck, KeySquare, LayoutDashboard, LogOut } from \"lucide-react\";

const NavItem = ({ to, icon: Icon, children, testId }) => (
  <NavLink
    to={to}
    end
    data-testid={testId}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? \"bg-indigo-50 text-indigo-700\"
          : \"text-slate-600 hover:bg-slate-100 hover:text-slate-900\"
      }`
    }
  >
    <Icon className=\"w-4 h-4\" />
    <span>{children}</span>
  </NavLink>
);

export default function Layout() {
  const navigate = useNavigate();
  const isAdmin = !!localStorage.getItem(\"admin_token\");

  const handleLogout = () => {
    localStorage.removeItem(\"admin_token\");
    navigate(\"/admin/login\");
  };

  return (
    <div className=\"min-h-screen mesh-bg flex\">
      {/* Sidebar */}
      <aside
        className=\"hidden md:flex w-64 flex-col bg-white/70 backdrop-blur-md border-r border-slate-200/70 px-4 py-6\"
        data-testid=\"sidebar\"
      >
        <div className=\"flex items-center gap-2 px-3 mb-8\">
          <div className=\"w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center\">
            <ShieldCheck className=\"text-white w-5 h-5\" />
          </div>
          <div>
            <p className=\"font-heading font-bold text-slate-900 leading-none\">Captcha</p>
            <p className=\"font-heading font-bold text-indigo-600 text-sm leading-none mt-1\">Verifier Pro</p>
          </div>
        </div>

        <nav className=\"flex flex-col gap-1.5\">
          <p className=\"px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1\">Navigation</p>
          <NavItem to=\"/\" icon={KeySquare} testId=\"nav-demo\">Captcha Demo</NavItem>
          <NavItem to=\"/admin\" icon={LayoutDashboard} testId=\"nav-admin\">Admin Dashboard</NavItem>
        </nav>

        <div className=\"mt-auto px-4\">
          {isAdmin && (
            <button
              data-testid=\"logout-btn\"
              onClick={handleLogout}
              className=\"w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors\"
            >
              <LogOut className=\"w-4 h-4\" /> Sign out
            </button>
          )}
          <p className=\"text-xs text-slate-400 mt-4 px-1\">© {new Date().getFullYear()} Captcha Verifier Pro</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className=\"md:hidden fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between\">
        <div className=\"flex items-center gap-2\">
          <div className=\"w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center\">
            <ShieldCheck className=\"text-white w-4 h-4\" />
          </div>
          <p className=\"font-heading font-bold text-slate-900\">Captcha Verifier Pro</p>
        </div>
        <nav className=\"flex gap-1\">
          <NavLink to=\"/\" end className={({ isActive }) => `p-2 rounded-lg ${isActive ? \"bg-indigo-50 text-indigo-700\" : \"text-slate-500\"}`} data-testid=\"mnav-demo\">
            <KeySquare className=\"w-4 h-4\" />
          </NavLink>
          <NavLink to=\"/admin\" className={({ isActive }) => `p-2 rounded-lg ${isActive ? \"bg-indigo-50 text-indigo-700\" : \"text-slate-500\"}`} data-testid=\"mnav-admin\">
            <LayoutDashboard className=\"w-4 h-4\" />
          </NavLink>
        </nav>
      </header>

      <main className=\"flex-1 pt-16 md:pt-0\">
        <Outlet />
      </main>
    </div>
  );
}
"