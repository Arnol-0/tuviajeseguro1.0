import React, { useState } from 'react';
import { Package, Route, Clock, Navigation, MapPin, Play, Truck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Corregir icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Crear icon de camión personalizado
const truckIconHtml = renderToString(<Truck size={24} color="#ffffff" />);
const customTruckIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">${truckIconHtml}</div>`,
  className: 'dummy-custom-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

/**
 * Componente Panel del Conductor (DashboardConductor).
 * Vista enfocada en la información relevante para un chofer,
 * mostrando el estado de la carga actual y la ruta asignada.
 */
export default function DashboardConductor() {
  // Estado para controlar si el chofer inició el viaje ("Modo Viaje")
  const [isTripActive, setIsTripActive] = useState(false);

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
          
          {/* Contenedor condicional: Muestra cronograma o el Mapa según estado */}
          {!isTripActive ? (
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
          ) : (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Clock size={20} /> ETA Estimado (Llegada): 1 Hora 45 Minutos
              </div>
              <div style={{ height: '400px', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                <MapContainer center={[-33.4350, -70.6300]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[-33.4350, -70.6300]} icon={customTruckIcon}>
                    <Popup>
                      <strong>Mi Ubicación actual</strong><br/>
                      Lat: -33.4350 <br/>
                      En ruta hacia: {currentTrip.destination}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          )}
          
          {/* Botón para acción principal del chofer: iniciar navegación */}
          {!isTripActive ? (
            <button className="btn btn-primary" onClick={() => setIsTripActive(true)} style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>
              <Play size={20} />
              Entrar en Modo Viaje
            </button>
          ) : (
            <button className="btn btn-outline" onClick={() => setIsTripActive(false)} style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}>
              Finalizar Recorrido / Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
