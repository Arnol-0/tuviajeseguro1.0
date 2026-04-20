import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, get, child, onValue, remove } from 'firebase/database';
import { UserPlus, Save, User, Users, Trash2, LayoutGrid, List, Phone, Mail, Shield } from 'lucide-react';

export default function GestionUsuarios() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'list'
  const [viewMode, setViewMode] = useState('cards'); // 'table' | 'cards'

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
        // Automáticamente pasamos a la pestaña de lista para verlo
        setTimeout(() => setActiveTab('list'), 1500);
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
        // Avoid setting success state that overrides screen, just let list update
      } catch (error) {
        alert('Error al eliminar usuario.');
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      
      <div className="header-title" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Control de Personal</h1>
          <p>Supervisión administrativa de los perfiles que operan el sistema.</p>
        </div>
        
        {/* TAB CONTROLS */}
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
           <button 
             onClick={() => setActiveTab('create')}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'create' ? 'var(--accent-primary)' : 'transparent', color: activeTab === 'create' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
           >
             <UserPlus size={18} /> Nuevo Registro
           </button>
           <button 
             onClick={() => setActiveTab('list')}
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '8px', border: 'none', background: activeTab === 'list' ? 'var(--accent-secondary)' : 'transparent', color: activeTab === 'list' ? 'white' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
           >
             <Users size={18} /> Directorio de Staff
           </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="card animate-slide-up">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            <UserPlus size={22} color="var(--accent-primary)" />
            Ficha de Nuevo Ingreso
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
      )}

      {activeTab === 'list' && (
        <div className="card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
          
          {/* HEADER LISTA */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#f8fafc' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
              <Users size={22} color="var(--accent-secondary)" />
              Directorio General ({usersList.length})
            </h2>

            {/* BOTONES VISTA */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button 
                 onClick={() => setViewMode('cards')}
                 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid', borderColor: viewMode === 'cards' ? 'var(--accent-primary)' : '#cbd5e1', background: viewMode === 'cards' ? 'rgba(59, 130, 246, 0.1)' : 'white', color: viewMode === 'cards' ? 'var(--accent-primary)' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
               >
                 <LayoutGrid size={18} /> Tarjetas
               </button>
               <button 
                 onClick={() => setViewMode('table')}
                 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid', borderColor: viewMode === 'table' ? 'var(--accent-primary)' : '#cbd5e1', background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.1)' : 'white', color: viewMode === 'table' ? 'var(--accent-primary)' : '#64748b', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600 }}
               >
                 <List size={18} /> Tabla
               </button>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {usersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No hay usuarios registrados en el sistema.
              </div>
            ) : viewMode === 'table' ? (
              /* MODO TABLA TRADICIONAL */
              <div className="table-container" style={{ margin: 0, border: '1px solid #e2e8f0' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Usuario (ID)</th>
                      <th>Nombre</th>
                      <th>Rol Asignado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr.username} className="animate-fade-in">
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{usr.username}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{usr.nombre || '-'}</td>
                        <td>
                          <span className={`badge ${usr.role === 'conductor' ? 'badge-blue' : usr.role === 'supervisor_entrada' ? 'badge-warning' : 'badge-success'}`}>
                            {usr.role === 'conductor' ? 'Conductor' : usr.role === 'supervisor_entrada' ? 'Portería' : 'Supervisor GPS'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDelete(usr.username)} className="icon-btn" style={{ color: 'var(--accent-danger)', marginLeft: 'auto' }} title="Eliminar Usuario">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* MODO TARJETAS GLASSMORPHISM */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {usersList.map((usr) => {
                   const isAdmin = usr.role === 'supervisor_ruta';
                   const isPorteria = usr.role === 'supervisor_entrada';
                   return (
                     <div key={usr.username} className="animate-slide-up hover-scale" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', pading: 0, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                       {/* COVER HEADER */}
                       <div style={{ height: '60px', background: isAdmin ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : isPorteria ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'linear-gradient(135deg, #0ea5e9, #2563eb)' }}></div>
                       
                       {/* BODY */}
                       <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
                         
                         {/* AVATAR FLOTANTE */}
                         <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: isAdmin ? '#8b5cf6' : isPorteria ? '#f59e0b' : '#3b82f6', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginTop: '-32px', marginBottom: '1rem', textTransform: 'uppercase' }}>
                           {(usr.nombre ? usr.nombre.charAt(0) : usr.username.charAt(0))}
                         </div>

                         {/* INFO PRINCIPAL */}
                         <div style={{ marginBottom: '1rem' }}>
                           <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>{usr.nombre || 'Sin Nombre'}</h3>
                           <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>@{usr.username}</div>
                         </div>

                         {/* DETALLES */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                              <Shield size={14} color="#94a3b8" />
                              <span style={{ fontWeight: 600, color: isAdmin ? '#8b5cf6' : isPorteria ? '#f59e0b' : '#3b82f6' }}>
                                {isAdmin ? 'Supervisor GPS' : isPorteria ? 'Portería (Entrada/Sal)' : 'Conductor de Flota'}
                              </span>
                            </div>
                            {usr.correo && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                <Mail size={14} color="#94a3b8" /> {usr.correo}
                              </div>
                            )}
                            {usr.numero && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                <Phone size={14} color="#94a3b8" /> {usr.numero}
                              </div>
                            )}
                         </div>

                         {/* ACTION */}
                         <button 
                           onClick={() => handleDelete(usr.username)}
                           style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                           onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                           onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                         >
                           <Trash2 size={16} /> Eliminar Ficha
                         </button>

                       </div>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
