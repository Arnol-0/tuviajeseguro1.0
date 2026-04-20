import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Activity, Truck, Map as MapIcon, X, ScanFace, FileText } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { database } from '../firebase';
import { ref, onValue, set, push } from 'firebase/database';

/**
 * Componente principal del Panel de Control (Dashboard) del Supervisor/Portería.
 * Muestra métricas en tiempo real, una tabla de los últimos viajes registrados,
 * y modales para operar entradas/salidas y ver detalles de patentes.
 */
export default function Dashboard() {
  const context = useOutletContext();
  const role = context?.role || null;

  // Estado para controlar qué patente ha sido seleccionada para ver su detalle (LPR).
  const [selectedPatent, setSelectedPatent] = useState(null);

  // Estados para el Modal de Registro (Entrada/Salida)
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordType, setRecordType] = useState('Entrada');
  const [formData, setFormData] = useState({ patent: '', driver: '', cargo: '' });

  // Estado que manejará datos en tiempo real desde Firebase.
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const tripsRef = ref(database, 'trips');
    
    // Escuchar datos en Firebase y mantenerlos sincronizados en tiempo real
    const unsubscribe = onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Obtenemos los valores y los ordenamos para que los más recientes estén arriba (opcional)
        setTrips(Object.values(data).reverse());
      } else {
        setTrips([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleOpenRecord = (type) => {
    setRecordType(type);
    setShowRecordModal(true);
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    
    // Generar datos simulados del momento
    const newId = `V-${Math.floor(Math.random() * 900) + 100}`;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;

    const newTrip = {
      id: newId,
      patent: formData.patent.toUpperCase(),
      driver: formData.driver,
      type: recordType,
      time: strTime,
      status: recordType === 'Entrada' ? 'Pendiente' : 'En Ruta',
      cargo: formData.cargo || 'No especificada'
    };

    // Subir a Firebase
    const newListRef = push(ref(database, 'trips'));
    await set(newListRef, newTrip);

    // Cerrar y limpiar
    setShowRecordModal(false);
    setFormData({ patent: '', driver: '', cargo: '' });
  };

  // Contadores para KPIs
  const activeTrucksCount = trips.filter(t => t.status === 'En Ruta' || t.status === 'Pendiente').length;
  const entriesCount = trips.filter(t => t.type === 'Entrada').length;
  const exitsCount = trips.filter(t => t.type === 'Salida').length;

  return (
    <div className="animate-fade-in">
      {/* --- ENCABEZADO Y BOTONES DE ACCIÓN --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="header-title">
          <h1>Panel de Control</h1>
          <p>Resumen en tiempo real del estado de los viajes y accesos.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Botones de Portería */}
          {(role === 'supervisor_entrada' || role === 'supervisor') && (
            <>
              <button className="btn btn-primary" onClick={() => handleOpenRecord('Entrada')} style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', border: 'none' }}>
                <ArrowDownRight size={18} />
                Registrar Entrada
              </button>
              <button className="btn btn-primary" onClick={() => handleOpenRecord('Salida')} style={{ background: '#f59e0b', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', border: 'none' }}>
                <ArrowUpRight size={18} />
                Registrar Salida
              </button>
            </>
          )}

          {/* Botón GPS general */}
          <Link to="/mapa" className="btn btn-outline" style={{ textDecoration: 'none' }}>
            <MapIcon size={18} />
            Ver Mapa GPS
          </Link>
        </div>
      </div>

      {/* --- TARJETAS DE MÉTRICAS (KPIs) --- */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <h3>Camiones Activos</h3>
            <div className="value">{activeTrucksCount}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Entradas Hoy</h3>
            <div className="value">{entriesCount}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Salidas Hoy</h3>
            <div className="value">{exitsCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Incidentes</h3>
            <div className="value">0</div>
          </div>
        </div>
      </div>

      {/* --- TABLA DE ÚLTIMOS REGISTROS --- */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Últimos Registros / Accesos</h2>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Descargar Reporte
          </button>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patente</th>
                <th>Conductor / Carga</th>
                <th>Operación</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {trips.length > 0 ? trips.map((trip) => (
                <tr key={trip.id} className="animate-fade-in">
                  <td style={{ fontWeight: 500 }}>{trip.id}</td>
                  <td>
                    <span 
                      onClick={() => setSelectedPatent(trip.patent)}
                      title="Clic para ver foto LPR"
                      style={{ 
                        background: 'rgba(0,0,0,0.05)', 
                        padding: '0.35rem 0.6rem', 
                        borderRadius: '0.5rem', 
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        border: '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        color: 'var(--accent-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                      <ScanFace size={14} />
                      {trip.patent}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{trip.driver}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText size={12}/> {trip.cargo}</div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {trip.type === 'Entrada' ? <ArrowDownRight size={16} color="var(--accent-success)" /> : <ArrowUpRight size={16} color="var(--accent-warning)" />}
                      {trip.type}
                    </span>
                  </td>
                  <td><div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem', display: 'inline-block' }}>{trip.time}</div></td>
                  <td>
                     <span className={`badge ${trip.status === 'Completado' ? 'badge-success' : trip.status === 'Pendiente' ? 'badge-danger' : 'badge-blue'}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No hay registros recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE REGISTRO MANUAL E/S --- */}
      {showRecordModal && (
        <div className="modal-overlay" onClick={() => setShowRecordModal(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {recordType === 'Entrada' ? <ArrowDownRight color="#10b981" /> : <ArrowUpRight color="#f59e0b" />}
                Registrar {recordType}
              </h3>
              <button onClick={() => setShowRecordModal(false)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitRecord}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Patente del Vehículo</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: AB-CD-12" 
                  value={formData.patent}
                  onChange={e => setFormData({...formData, patent: e.target.value})}
                  required 
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Nombre del Conductor</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Nombre Apellido" 
                  value={formData.driver}
                  onChange={e => setFormData({...formData, driver: e.target.value})}
                  required 
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detalle de Carga</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: Combustible, Vacío, etc." 
                  value={formData.cargo}
                  onChange={e => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: recordType === 'Entrada' ? '#10b981' : '#f59e0b', border: 'none' }}>
                Guardar {recordType}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE DETALLE DE PATENTE (LPR) --- */}
      {selectedPatent && (
        <div className="modal-overlay" onClick={() => setSelectedPatent(null)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Captura de Cámara LPR</h3>
              <button onClick={() => setSelectedPatent(null)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Patente detectada por pórtico de acceso:
              </p>
              
              <div className="patent-plate-img">
                {selectedPatent}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setSelectedPatent(null)}>Cerrar</button>
                <button className="btn btn-primary" onClick={() => setSelectedPatent(null)}>Ver Perfil del Camión</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
