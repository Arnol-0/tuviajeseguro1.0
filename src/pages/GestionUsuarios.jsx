import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, get, child, onValue, remove } from 'firebase/database';
import { UserPlus, Save, User, Users, Trash2 } from 'lucide-react';

export default function GestionUsuarios() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [numero, setNumero] = useState('');
  const [role, setRole] = useState('conductor');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersArray = Object.keys(data).map(key => ({
          username: key,
          ...data[key]
        }));
        setUsersList(usersArray);
      } else {
        setUsersList([]);
      }
    });

    return () => unsubscribe();
  }, []);

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
        await set(ref(database, `users/${userKey}`), { 
          password, 
          role, 
          nombre, 
          correo, 
          numero 
        });
        setStatus({ message: 'Usuario creado con éxito.', type: 'success' });
        setUsername('');
        setPassword('');
        setNombre('');
        setCorreo('');
        setNumero('');
      }
    } catch (error) {
      console.error(error);
      setStatus({ message: 'Error al crear usuario.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userKey) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userKey}"?`)) {
      try {
        await remove(ref(database, `users/${userKey}`));
        setStatus({ message: `Usuario ${userKey} eliminado.`, type: 'success' });
      } catch (error) {
        setStatus({ message: 'Error al eliminar usuario.', type: 'error' });
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Gestión de Usuarios</h1>
        <p>Crea cuentas para choferes y otros supervisores del sistema, completando su perfil integral.</p>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <UserPlus size={22} color="var(--accent-primary)" />
          Nuevo Registro de Personal
        </h2>
        
        <form onSubmit={handleCreate}>
          {/* PRIMERA FILA: CREDENCIALES (Separados para claridad) */}
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ID de Usuario (Acceso)</label>
              <input 
                type="text" 
                className="login-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej: jperez"
                required 
                style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Contraseña de Sistema</label>
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
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />

          {/* SEGUNDA FILA: DATOS PERFIL */}
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nombre Completo</label>
              <input 
                type="text" 
                className="login-input" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez Silva"
                style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
              />
            </div>
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Correo Electrónico</label>
               <input 
                 type="email" 
                 className="login-input" 
                 value={correo}
                 onChange={(e) => setCorreo(e.target.value)}
                 placeholder="juan.perez@empresa.com"
                 style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
               />
            </div>
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Número de Teléfono</label>
               <input 
                 type="tel" 
                 className="login-input" 
                 value={numero}
                 onChange={(e) => setNumero(e.target.value)}
                 placeholder="+56 9 1234 5678"
                 style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)' }}
               />
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rol Operativo (Asignación)</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: '0.75rem', width: '100%', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}
            >
              <option value="conductor">Conductor</option>
              <option value="supervisor_entrada">Portería (Registro de Entrada/Salida)</option>
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
                <Save size={20} /> Guardar Ficha y Crear Cuenta
              </>
            )}
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          <Users size={22} color="var(--accent-secondary)" />
          Personal Registrado
        </h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol Asignado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length > 0 ? (
                usersList.map((usr) => (
                  <tr key={usr.username} className="animate-fade-in">
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{usr.username}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{usr.nombre || '-'}</td>
                    <td>
                      <span className={`badge ${usr.role === 'conductor' ? 'badge-blue' : usr.role === 'supervisor_entrada' ? 'badge-warning' : 'badge-success'}`}>
                        {usr.role === 'conductor' ? 'Conductor' : usr.role === 'supervisor_entrada' ? 'Portería' : 'Supervisor GPS'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(usr.username)} 
                        className="icon-btn" 
                        style={{ color: 'var(--accent-danger)', marginLeft: 'auto' }} 
                        title="Eliminar Usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
