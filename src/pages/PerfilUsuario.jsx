import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, User, Mail, Phone, MapPin, Shield, Map as MapIcon } from 'lucide-react';
import { database } from '../firebase';
import { ref, get, child, update } from 'firebase/database';

export default function PerfilUsuario() {
  const { role, username } = useOutletContext() || {};

  const [user, setUser] = useState({
    name: username || 'Cargando...',
    email: '',
    phone: '',
    location: '',
    role: role || '...',
    status: 'Activo'
  });

  const [fetchingLoc, setFetchingLoc] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    // Cargar perfil desde firebase
    const dbRef = ref(database);
    get(child(dbRef, `users/${username}`)).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUser(prev => ({
          ...prev,
          name: data.nombre || username,
          email: data.correo || `${username}@tuviajeseguro.com`,
          phone: data.numero || '',
          location: data.locationProfile || 'Sin registro',
        }));
      }
    }).catch(console.error);
  }, [username]);

  const fetchGeolocation = () => {
    setFetchingLoc(true);
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada en tu navegador.");
      setFetchingLoc(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setUser({ ...user, location: `Lat: ${lat}, Lng: ${lng}` });
        setFetchingLoc(false);
      },
      (err) => {
        alert("No se pudo obtener la ubicación. Verifica los permisos de tu dispositivo.");
        setFetchingLoc(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updates = {};
      updates[`users/${username}/nombre`] = user.name;
      updates[`users/${username}/correo`] = user.email;
      updates[`users/${username}/numero`] = user.phone;
      updates[`users/${username}/locationProfile`] = user.location;
      
      await update(ref(database), updates);
      alert("Perfil actualizado correctamente.");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Perfil de Usuario</h1>
        <p>Gestiona tu información personal y verifica desde qué zona te conectas.</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
             <div>
               <h2 className="profile-name">{user.name}</h2>
               <p className="profile-role" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                 <Shield size={16} /> {user.role === 'supervisor_entrada' ? 'Portería' : user.role === 'conductor' ? 'Conductor' : 'Supervisor de Flota'} &bull; <span style={{ color: 'var(--accent-success)' }}>{user.status}</span>
               </p>
             </div>
             <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={18} />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
             </button>
          </div>

          <div className="settings-section">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600 }}>Ficha Integral</h3>
            
            <form className="form-grid" onSubmit={handleSave}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} value={user.name} onChange={e => setUser({...user, name: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="email" className="form-control" style={{ paddingLeft: '2.5rem' }} value={user.email} onChange={e => setUser({...user, email: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono Celular</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input type="tel" className="form-control" style={{ paddingLeft: '2.5rem' }} value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Disponibilidad Geoespacial (Última reportada)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                    <MapPin size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input type="text" className="form-control" style={{ paddingLeft: '2.5rem' }} placeholder="EJ: Temuco, Lat: -38..." value={user.location} onChange={e => setUser({...user, location: e.target.value})} />
                  </div>
                  <button type="button" className="btn btn-outline" onClick={fetchGeolocation} disabled={fetchingLoc}>
                    <MapIcon size={18} /> {fetchingLoc ? 'Leyendo GPS...' : 'Fijar Mi Dispositivo Actual'}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
