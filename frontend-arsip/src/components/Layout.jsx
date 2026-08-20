import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, role, setRole, onUploadClick }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <Sidebar role={role} onUploadClick={onUploadClick} />
      </div>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 w-64 z-50 transform lg:hidden transition-transform duration-350 ease-in-out bg-slate-900 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar role={role} onUploadClick={onUploadClick} />
      </div>

      {/* Right Column: Header & Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          role={role} 
          setRole={setRole} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
