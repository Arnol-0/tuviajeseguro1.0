import React, { useState } from 'react';
import { database } from '../firebase';
import { ref, set, get, child } from 'firebase/database';
import { UserPlus, Save, Shield, User, ArrowRight } from 'lucide-react';

export default function GestionUsuarios() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('conductor');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', type: '' });

    try {
      const userKey = username.toLowerCase().trim();
      if (!userKey) throw new Error("Nombre inválido");

      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `users/${userKey}`));
      
      if (snapshot.exists()) {
        setStatus({ message: 'El usuario ya existe en el sistema.', type: 'error' });
      } else {
        await set(ref(database, `users/${userKey}`), { password, role });
        setStatus({ message: 'Usuario creado con éxito.', type: 'success' });
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      console.error(error);
      setStatus({ message: 'Error al crear usuario.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Usuarios</h1>
        <p>Crea cuentas para choferes y otros supervisores del sistema.</p>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <UserPlus size={22} color="var(--accent-primary)" />
          Nuevo Registro
        </h2>
        
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID de Usuario / Username</label>
            <input 
              type="text" 
              className="login-input" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: juan_perez"
              required 
              style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contraseña</label>
            <input 
              type="password" 
              className="login-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rol Operativo</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}
            >
              <option value="conductor">Conductor</option>
              <option value="supervisor_entrada">Supervisor de Entrada</option>
              <option value="supervisor_ruta">Supervisor de Rutas y GPS</option>
            </select>
          </div>

          {status.message && (
            <div style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 500, textAlign: 'center' }}>
              {status.message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
            {loading ? 'Procesando...' : (
              <>
                <Save size={20} /> Crear Cuenta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
