import React from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, LayoutDashboard, UserCircle, Settings, LogOut, FilePlus, MapPin, Users } from 'lucide-react';

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
        
        {/* Menú para Administradores de Rutas */}
        {(role === 'supervisor_ruta' || role === 'supervisor') && (
          <>
            <NavLink 
              to="/registro" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <FilePlus size={20} />
              <span>Asignar Rutas</span>
            </NavLink>
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={20} />
              <span>Gestionar Usuarios</span>
            </NavLink>
          </>
        )}

        {/* Mapa GPS disponible para Admin y Choferes */}
        {(role === 'supervisor_ruta' || role === 'supervisor' || role === 'conductor') && (
          <NavLink 
            to="/mapa" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <MapPin size={20} />
            <span>Mapa GPS</span>
          </NavLink>
        )}

        <div style={{ flex: 1 }}></div>

        {/* Botón fusionado de Configuración y Perfil */}
        <NavLink 
          to="/perfil" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Configuración (Perfil)</span>
        </NavLink>
        
        <button className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--accent-danger)' }}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
}
