import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, User, Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function PerfilUsuario() {
  const { role, username } = useOutletContext() || {};

  const [user, setUser] = useState({
    name: username || 'Administrador',
    email: `${username || 'usuario'}@tuviajeseguro.com`,
    phone: '+56 9 1234 5678',
    location: 'Santiago, Chile',
    role: role || 'Super Admin',
    status: 'Activo'
  });

  return (
    <div className="animate-fade-in">
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Perfil de Usuario</h1>
        <p>Gestiona tu información personal y preferencias de la cuenta.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="profile-cover">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" style={{ textTransform: 'uppercase' }}>
              <span style={{ fontSize: '3rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{user.name.charAt(0)}</span>
            </div>
          </div>
        </div>

        <div className="profile-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div>
               <h2 className="profile-name">{user.name}</h2>
               <p className="profile-role" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                 <Shield size={16} /> {user.role} &bull; <span style={{ color: 'var(--accent-success)' }}>{user.status}</span>
               </p>
             </div>
             <button className="btn btn-primary">
                <Save size={18} />
                Guardar Cambios
             </button>
          </div>

          <div className="settings-section">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Información Personal</h3>
            
            <form className="form-grid">
              <div className="form-group">
                <label>Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} defaultValue={user.name} />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} defaultValue={user.email} />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="tel" className="form-control" style={{ paddingLeft: '2.5rem' }} defaultValue={user.phone} />
                </div>
              </div>

              <div className="form-group">
                <label>Ubicación (Base)</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} defaultValue={user.location} />
                </div>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
