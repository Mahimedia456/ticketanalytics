import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout({ pages }) {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900">
              AI Excel Dashboard Builder
            </h1>
            <p className="text-xs text-slate-500">
              Upload sheets, edit live data, and generate dashboards.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {pages.map((page) => (
              <NavLink
                key={page.path}
                to={page.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-bold ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`
                }
              >
                {page.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}