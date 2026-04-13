import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, LayoutDashboard, UserCircle, Settings, LogOut, FilePlus, MapPin } from 'lucide-react';

export default function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Truck size={24} />
        </div>
        <span>TuViajeSeguro</span>
      </div>

      <nav className="nav-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        {role === 'supervisor' && (
          <NavLink 
            to="/registro" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FilePlus size={20} />
            <span>Registrar Viaje</span>
          </NavLink>
        )}

        <NavLink 
          to="/mapa" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <MapPin size={20} />
          <span>Mapa GPS</span>
        </NavLink>

        <NavLink 
          to="/perfil" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <UserCircle size={20} />
          <span>Perfil de Usuario</span>
        </NavLink>

        <div style={{ flex: 1 }}></div>

        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
          <Settings size={20} />
          <span>Configuración</span>
        </button>
        
        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--accent-danger)' }}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}
