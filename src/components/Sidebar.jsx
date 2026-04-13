import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Truck, LayoutDashboard, UserCircle, Settings, LogOut, FilePlus, MapPin, Users } from 'lucide-react';

export default function Sidebar({ role }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Al recargar la ruta base limpiaremos los useState (incluyendo authState) 
    // y React Router se va a dar cuenta de que no estamos logueados redirigiéndonos a /login.
    window.location.href = '/login';
  };

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
        
        <button 
          className="nav-link" 
          onClick={() => setShowLogoutModal(true)}
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--accent-danger)' }}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </nav>

      {/* Modal de Confirmación de Cierre de Sesión */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-danger)' }}>
              <LogOut size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>¿Cerrar Sesión?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Deberás volver a ingresar tus credenciales para acceder a la terminal de fletes.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center', background: 'var(--accent-danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }} 
                onClick={handleLogout}
              >
                Sí, Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
