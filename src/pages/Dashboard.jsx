import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Activity, Truck, Map as MapIcon, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { database } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

/**
 * Componente principal del Panel de Control (Dashboard) del Supervisor.
 * Muestra métricas en tiempo real, una tabla de los últimos viajes registrados,
 * y un modal para ver detalles de patentes capturadas.
 */
export default function Dashboard() {
  // Estado para controlar qué patente ha sido seleccionada para ver su detalle (LPR).
  // Si es null, el modal de detalle está oculto.
  const [selectedPatent, setSelectedPatent] = useState(null);

  // Estado que ahora manejará datos en tiempo real desde Firebase.
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const tripsRef = ref(database, 'trips');
    
    // Escuchar datos en Firebase y mantenerlos sincronizados en tiempo real
    const unsubscribe = onValue(tripsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase devuelve un objeto o arreglo, aseguramos que sea arreglo
        setTrips(Object.values(data));
      } else {
        // Si no existen viajes, migramos los antiguos mocks a Firebase
        const defaultTrips = [
          { id: 'V-102', patent: 'LXYZ-45', driver: 'Juan Pérez', type: 'Entrada', time: '08:15 AM', status: 'Completado', cargo: 'Materiales' },
          { id: 'V-103', patent: 'BHTC-99', driver: 'Carlos Ruiz', type: 'Salida', time: '09:00 AM', status: 'En Ruta', cargo: 'Despacho' },
          { id: 'V-104', patent: 'WWKK-11', driver: 'Miguel Silva', type: 'Entrada', time: '10:30 AM', status: 'Pendiente', cargo: 'Devolución' },
          { id: 'V-105', patent: 'RTYU-02', driver: 'Pedro Gómez', type: 'Salida', time: '11:45 AM', status: 'En Ruta', cargo: 'Maquinaria' },
        ];
        // Sincronizando datos por defecto a Firebase la primer vez
        set(ref(database, 'trips'), defaultTrips);
      }
    });

    // Desconectar evento cuando el dashboard se cierra
    return () => unsubscribe();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* --- ENCABEZADO Y BOTÓN DE MAPA --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="header-title">
          <h1>Panel de Control</h1>
          <p>Resumen en tiempo real del estado de los viajes y patentes registradas.</p>
        </div>
        
        {/* Botón que redirige a la vista del mapa en vivo */}
        <Link to="/mapa" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <MapIcon size={18} />
          Botón GPS
        </Link>
      </div>

      {/* --- TARJETAS DE MÉTRICAS (KPIs) --- */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {/* Métrica: Camiones activos en el sistema */}
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <Truck size={24} />
          </div>
          <div className="stat-info">
            <h3>Camiones Activos</h3>
            <div className="value">24</div>
          </div>
        </div>
        
        {/* Métrica: Total de entradas del día */}
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <ArrowDownRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Entradas Hoy</h3>
            <div className="value">12</div>
          </div>
        </div>
        
        {/* Métrica: Total de salidas del día */}
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <ArrowUpRight size={24} />
          </div>
          <div className="stat-info">
            <h3>Salidas Hoy</h3>
            <div className="value">15</div>
          </div>
        </div>

        {/* Métrica: Incidentes reportados */}
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
          <h2 className="card-title">Últimos Registros de Patentes</h2>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            Ver Todos
          </button>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patente</th>
                <th>Conductor</th>
                <th>Tipo</th>
                <th>Carga</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {/* Iteramos sobre el arreglo de viajes para renderizar cada fila */}
              {trips.map((trip) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: 500 }}>{trip.id}</td>
                  <td>
                    {/* Al hacer clic en la patente, abrimos un modal con la "foto" capturada por el sensor LPR */}
                    <span 
                      onClick={() => setSelectedPatent(trip.patent)}
                      title="Clic para ver foto"
                      style={{ 
                        background: 'rgba(0,0,0,0.05)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        border: '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        color: 'var(--accent-primary)'
                      }}>
                      {trip.patent}
                    </span>
                  </td>
                  <td>{trip.driver}</td>
                  <td>
                    {/* Indicador visual del tipo de viaje: Entrada o Salida */}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {trip.type === 'Entrada' ? <ArrowDownRight size={16} color="var(--accent-success)" /> : <ArrowUpRight size={16} color="var(--accent-warning)" />}
                      {trip.type}
                    </span>
                  </td>
                  <td>{trip.cargo}</td>
                  <td>{trip.time}</td>
                  <td>
                    {/* Etiqueta de estado con colores dinámicos */}
                     <span className={`badge ${trip.status === 'Completado' ? 'badge-success' : trip.status === 'Pendiente' ? 'badge-danger' : 'badge-blue'}`}>
                      {trip.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE DETALLE DE PATENTE --- */}
      {/* Solo se renderiza si selectedPatent no es null */}
      {selectedPatent && (
        <div className="modal-overlay" onClick={() => setSelectedPatent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Cabecera del modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Captura de Cámara LPR</h3>
              <button onClick={() => setSelectedPatent(null)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                <X size={18} />
              </button>
            </div>
            
            {/* Cuerpo del modal mostrando simulación de imagen de patente */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Patente detectada por pórtico de acceso:
              </p>
              
              <div className="patent-plate-img">
                {selectedPatent}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-outline" onClick={() => setSelectedPatent(null)}>Cerrar</button>
                <button className="btn btn-primary" onClick={() => setSelectedPatent(null)}>Ver Detalles del Vehículo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
