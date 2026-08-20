import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User, Bell, Shield } from 'lucide-react';

export default function Header({ role, setRole, toggleSidebar }) {
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(newRole === 'guru' ? '/guru' : '/admin');
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

      {/* Right items: Role Switcher & Profile Info */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Demo Control */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/40">
          <span className="text-[10px] font-bold text-slate-500 px-2 uppercase tracking-wide hidden lg:inline">
            Akses Demo:
          </span>
          <button
            onClick={() => handleRoleChange('guru')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              role === 'guru'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Guru</span>
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {role === 'guru' ? 'BS' : 'MY'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {role === 'guru' ? 'Budi Santoso, S.Pd' : 'Drs. H. Mulyono, M.Pd'}
              </p>
              <p className="text-[9px] font-bold text-indigo-600 tracking-wider uppercase leading-none mt-0.5">
                {role === 'guru' ? 'NIP. 19820512...' : 'NIP. 19741004...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
