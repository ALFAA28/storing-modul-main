import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, LayoutDashboard, FileText, UploadCloud, Users } from 'lucide-react';

export default function Sidebar({ role, user, onUploadClick }) {
  const isGuru = role !== 'admin' && role !== 'pengawas';
  
  const menuItems = isGuru 
    ? [
        { name: 'Dashboard Guru', path: '/guru', icon: LayoutDashboard },
        { name: 'Modul Saya', path: '/guru?tab=list', icon: FileText },
      ]
    : [
        { name: 'Dashboard Admin', path: '/admin', icon: LayoutDashboard },
        { name: 'Data Master Modul', path: '/admin?tab=master', icon: Users },
      ];

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-350 flex flex-col h-screen fixed left-0 top-0 z-30 border-r border-slate-800">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/25">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight tracking-wide">Arsip Modul</h1>
          <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Pembelajaran</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Menu Utama
        </div>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'hover:bg-slate-800/50 hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {isGuru && (
          <div className="pt-4">
            <button
              onClick={onUploadClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-250 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 animate-pulse" />
              <span>Unggah Dokumen</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer Info - Dynamic User */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl bg-slate-800/30">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-indigo-400">
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
              {role === 'admin' ? 'Admin / Pengawas' : 'Guru'}
            </p>
            {user?.nrg && (
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                NRG: {user.nrg}
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
