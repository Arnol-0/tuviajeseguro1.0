import React from 'react';
import { Package, Route, Clock, Navigation, MapPin } from 'lucide-react';

/**
 * Componente Panel del Conductor (DashboardConductor).
 * Vista enfocada en la información relevante para un chofer,
 * mostrando el estado de la carga actual y la ruta asignada.
 */
export default function DashboardConductor() {
  // Objeto con la información estática (mock) del viaje actual asignado al conductor.
  // En un entorno de producción, esto se obtendría mediante una API.
  const currentTrip = {
    origin: 'Centro de Distribución (Punto A)',
    destination: 'Sucursal Norte (Punto B)',
    cargo: 'Materiales de Construcción',
    weight: '12.5 Toneladas',
    estimatedTime: '1h 45m',
    status: 'En Ruta',
    startTime: '10:30 AM'
  };

  return (
    <div className="animate-fade-in">
      {/* --- ENCABEZADO --- */}
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Panel del Conductor</h1>
        <p>Resumen de tu viaje actual e información de la carga.</p>
      </div>

      {/* --- TARJETAS DE INFORMACIÓN DEL VIAJE --- */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {/* Métrica: Tipo de Cargamento */}
         <div className="stat-card">
          <div className="stat-icon icon-blue">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>Cargamento</h3>
            <div className="value" style={{ fontSize: '1.25rem' }}>{currentTrip.cargo}</div>
          </div>
        </div>

        {/* Métrica: Peso Total de la carga */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <Route size={24} />
          </div>
          <div className="stat-info">
            <h3>Peso Total</h3>
            <div className="value">{currentTrip.weight}</div>
          </div>
        </div>

        {/* Métrica: Tiempo de Viaje Estimado */}
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>Tiempo de Viaje</h3>
            <div className="value">{currentTrip.estimatedTime}</div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE RUTA ASIGNADA --- */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={20} color="var(--accent-primary)"/> Ruta Asignada
          </h2>
          
          {/* Timeline visual de la ruta (Origen -> Destino) */}
          <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '1.5rem' }}>
            {/* Línea conectora entre los puntos */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '7px', width: '2px', background: 'var(--accent-primary)', opacity: 0.2 }}></div>
            
            {/* Punto A: Origen */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
               <div style={{ position: 'absolute', left: '-1.5rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-secondary)' }}></div>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Punto A - Origen ({currentTrip.startTime})</h4>
               <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentTrip.origin}</p>
            </div>

            {/* Punto B: Destino */}
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '-1.5rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-warning)', border: '4px solid var(--bg-secondary)' }}></div>
               <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Punto B - Destino</h4>
               <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentTrip.destination}</p>
            </div>
          </div>
          
          {/* Botón para acción principal del chofer: iniciar navegación */}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}>
            <MapPin size={18} />
            Abrir Navegación GPS
          </button>
        </div>
      </div>
    </div>
  );
}
