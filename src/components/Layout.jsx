import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Moon, Sun, Bell } from 'lucide-react';

export default function Layout({ role }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  return (
    <div className="app-container">
      <Sidebar role={role} />
      <main className="main-content">
        <header className="top-header">
          <div className="header-title">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Portal de Control de Flota</h2>
            <p style={{ fontSize: '0.875rem' }}>Gestión de Patentes y Entradas/Salidas</p>
          </div>
          
          <div className="header-actions">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <button className="icon-btn" onClick={() => setIsDark(!isDark)}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="profile-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', cursor: 'pointer' }}>
              A
            </div>
          </div>
        </header>
        
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
