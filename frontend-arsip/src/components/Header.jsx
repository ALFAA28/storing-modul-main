import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';

export default function Header({ role, user, toggleSidebar, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login', { replace: true });
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-6 flex items-center justify-between shrink-0">
      {/* Left items: Mobile Sidebar Toggle and Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {role === 'guru' ? 'Workspace Guru' : 'Workspace Admin & Pengawas'}
          </h2>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Sistem Manajemen Arsip Perangkat Pembelajaran
          </p>
        </div>
      </div>

      {/* Right items: Profile Info & Logout */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        </button>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase leading-none mt-0.5">
                {role === 'admin' ? 'Admin / Pengawas' : 'Guru'}
              </p>
              {user?.nrg && (
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  NRG: {user.nrg}
                </p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Keluar"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
