import React, { useState, useEffect } from 'react';
import { Package, Route, Clock, Navigation, MapPin, Play, Truck, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { useOutletContext } from 'react-router-dom';
import { database } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

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
  const { username } = useOutletContext();
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [liveLocation, setLiveLocation] = useState([-33.4350, -70.6300]); // Fallback initial

  // Leer estado del viaje desde Firebase Realtime en vivo
  useEffect(() => {
    if (!username) return;
    const tripRef = ref(database, `users/${username}/currentTrip`);
    const unsubscribe = onValue(tripRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentTrip(snapshot.val());
      } else {
        setCurrentTrip(null);
      }
    });
    return () => unsubscribe();
  }, [username]);

  // Rastreo de GPS local mientras isTripActive sea verdadero
  useEffect(() => {
    let watchId;
    if (isTripActive && navigator.geolocation && username) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLiveLocation([lat, lng]);
          // Guardar en Firebase para que el administrador lo vea en MapaGPS
          set(ref(database, `users/${username}/location`), { lat, lng });
        },
        (err) => console.warn('Error GPS:', err),
        { enableHighAccuracy: true }
      );
    } else if (!isTripActive && username) {
      // Limpiar ubicación de firebase cuando finaliza el viaje
      set(ref(database, `users/${username}/location`), null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTripActive, username]);

  if (!currentTrip) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', marginTop: '6rem' }}>
        <div style={{ background: 'var(--bg-secondary)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
          <Info size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Viaje No Asignado</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>No tienes ninguna ruta u orden de envío pendiente en este momento. Por favor, contacta con tu supervisor de logística o espera la pronta asignación.</p>
      </div>
    );
  }

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

      {/* --- SECCIÓN DE RUTA ASIGNADA (NORMAL) --- */}
      <div style={{ maxWidth: '800px', margin: '0 auto', transition: 'all 0.3s ease' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation size={20} color="var(--accent-primary)"/> Ruta Asignada
          </h2>
          
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
          
          <button className="btn btn-primary" onClick={() => setIsTripActive(true)} style={{ width: '100%', marginTop: '2rem', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem' }}>
            <Play size={20} />
            Entrar en Modo Viaje (GPS)
          </button>
        </div>
      </div>

      {/* --- OVERLAY PANTALLA COMPLETA (EXPERIENCIA TIPO WAZE) --- */}
      {isTripActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-primary)', zIndex: 9999, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease-out' }}>
           {/* Navigation App Header */}
           <div style={{ padding: '1.25rem 1rem', background: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <Navigation size={18} color="#3b82f6" /> Viaje en Curso
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.7, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  A: {currentTrip.destination}
                </p>
             </div>
             <button onClick={() => setIsTripActive(false)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', padding: '0.6rem 1.25rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
               Terminar
             </button>
           </div>
           
           {/* ETA Floating Panel */}
           <div style={{ position: 'absolute', top: '85px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '30px', fontWeight: 700, zIndex: 10000, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
             <Clock size={18} /> ETA: 1 hr 45 min
           </div>

           {/* Fullscreen Map Area */}
           <div style={{ flex: 1, position: 'relative' }}>
              <MapContainer center={liveLocation} zoom={16} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={liveLocation} icon={customTruckIcon}>
                  <Popup>
                    <strong>Mi Camión</strong><br/>Lat: {liveLocation[0].toFixed(4)} <br/>En ruta.
                  </Popup>
                </Marker>
              </MapContainer>
              
              {/* Bottom Nav Stats */}
              <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '1rem', background: 'white', borderRadius: 'var(--radius-lg)', padding: '1.25rem', zIndex: 10000, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Velocidad</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>65 <span style={{fontSize: '0.8rem'}}>km/h</span></div>
                </div>
                <div style={{ width: '1px', height: '40px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Restante</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>18 <span style={{fontSize: '0.8rem'}}>km</span></div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
