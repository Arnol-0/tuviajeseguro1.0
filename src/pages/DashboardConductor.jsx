import React, { useState, useEffect } from 'react';
import { Package, Route, Clock, Navigation, MapPin, Play, Truck, Info, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
  html: `<div style="background-color: #3b82f6; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4); border: 3px solid white; transition: all 0.3s ease;">${truckIconHtml}</div>`,
  className: 'dummy-custom-icon',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

// Componente para manejar la vista del mapa
function MapController({ centerPos, isTripActive, currentTrip }) {
  const map = useMap();
  
  useEffect(() => {
    if (!currentTrip || isTripActive) {
      if (centerPos) {
        map.setView(centerPos, 15, { animate: true, duration: 1 });
      }
    } else if (currentTrip && !isTripActive && currentTrip.routeGeometry) {
       // Si hay ruta pero no está activo, ajustar el mapa para mostrar toda la ruta
       const lats = currentTrip.routeGeometry.map(c => c[1]);
       const lngs = currentTrip.routeGeometry.map(c => c[0]);
       const bounds = L.latLngBounds(
         L.latLng(Math.min(...lats), Math.min(...lngs)),
         L.latLng(Math.max(...lats), Math.max(...lngs))
       );
       map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
    }
  }, [centerPos, isTripActive, currentTrip, map]);
  
  return null;
}

export default function DashboardConductor() {
  const { username } = useOutletContext();
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [liveLocation, setLiveLocation] = useState([-33.4350, -70.6300]); 
  const [speedKn, setSpeedKn] = useState(0);

  // Leer estado del viaje desde Firebase Realtime en vivo
  useEffect(() => {
    if (!username) return;
    const tripRef = ref(database, `users/${username}/currentTrip`);
    const unsubscribe = onValue(tripRef, (snapshot) => {
      if (snapshot.exists()) {
        setCurrentTrip(snapshot.val());
      } else {
        setCurrentTrip(null);
        setIsTripActive(false);
      }
    });
    return () => unsubscribe();
  }, [username]);

  // Rastreo de GPS local mientras isTripActive sea verdadero o para ubicación inicial
  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const userSpeed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
          
          setLiveLocation([lat, lng]);
          setSpeedKn(userSpeed);
          
          if (isTripActive && username) {
            set(ref(database, `users/${username}/location`), { lat, lng });
          }
        },
        (err) => console.warn('Error GPS:', err),
        { enableHighAccuracy: true }
      );
    }
    
    // Limpiar ubicación al desactivar
    if (!isTripActive && username) {
      set(ref(database, `users/${username}/location`), null);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTripActive, username]);

  // Fuerza a Leaflet a reajustar su tamaño cuando pasamos a Fullscreen
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
    return () => clearTimeout(timeout);
  }, [isTripActive]);

  const rootContainerStyle = isTripActive ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    borderRadius: 0,
    overflow: 'hidden',
    background: 'var(--bg-primary)'
  } : {
    position: 'relative',
    width: '100%',
    height: 'calc(100vh - 120px)',
    minHeight: '600px', // Fallback for small screens
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
  };

  return (
    <div className="animate-fade-in" style={rootContainerStyle}>
      
      {/* CAPA DEL MAPA (Siempre de fondo) */}
      <MapContainer center={liveLocation} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapController centerPos={liveLocation} isTripActive={isTripActive} currentTrip={currentTrip} />
        
        {/* Trazado de ruta */}
        {currentTrip && currentTrip.routeGeometry && (
          <Polyline 
            positions={currentTrip.routeGeometry.map(c => [c[1], c[0]])} 
            color="#3b82f6" 
            weight={6} 
            opacity={0.8} 
          />
        )}
        
        {/* Marcadores Carga y Descarga */}
        {currentTrip && currentTrip.originCoords && (
          <Marker position={currentTrip.originCoords}><Popup>Punto de Partida: {currentTrip.origin}</Popup></Marker>
        )}
        {currentTrip && currentTrip.destCoords && (
          <Marker position={currentTrip.destCoords}><Popup>Punto de Entrega: {currentTrip.destination}</Popup></Marker>
        )}

        {/* Camión o Usuario Actual */}
        <Marker position={liveLocation} icon={customTruckIcon}>
          <Popup>
            <strong>Mi Camión</strong><br/>
            Lat: {liveLocation[0].toFixed(4)}, Lng: {liveLocation[1].toFixed(4)}<br/>
            {isTripActive ? 'En ruta.' : 'Esperando iniciar viaje.'}
          </Popup>
        </Marker>
      </MapContainer>

      {/* OVERLAYS UI (Encima del mapa) */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1000 }}>
        
        {/* ESTADO: SIN VIAJE ASIGNADO */}
        {!currentTrip && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', padding: '2.5rem 2rem', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '350px', width: '90%', border: '1px solid rgba(255,255,255,0.5)' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6' }}>
              <Info size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: '700' }}>Viaje No Asignado</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>Tu mapa está activo, pero no tienes ninguna ruta u orden de envío pendiente.<br/><br/>Esperando asignación de supervisor.</p>
          </div>
        )}

        {/* ESTADO: VIAJE ASIGNADO (INACTIVO) */}
        {currentTrip && !isTripActive && (
          <div className="animate-slide-up" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', padding: '1.5rem', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', width: 'calc(100% - 2rem)', maxWidth: '400px', border: '1px solid rgba(255,255,255,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#3b82f6', color: 'white', padding: '0.6rem', borderRadius: '14px', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                <Navigation size={22} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Nueva Ruta Asignada</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: '#f8fafc', borderRadius: '16px' }}>
                <Package size={20} color="#3b82f6" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cargamento</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{currentTrip.cargo} &bull; <span style={{ color: '#8b5cf6' }}>{currentTrip.weight}</span></div>
                </div>
              </div>
              
              <div style={{ position: 'relative', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                 <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '12px', width: '2px', background: '#e2e8f0' }}></div>
                 <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <div style={{ position: 'absolute', left: '-1.5rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6', border: '4px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Origen ({currentTrip.startTime})</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{currentTrip.origin}</div>
                 </div>
                 <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.5rem', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: '4px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>Destino (ETA: {currentTrip.estimatedTime})</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{currentTrip.destination}</div>
                 </div>
              </div>
            </div>

            <button onClick={() => setIsTripActive(true)} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '1.1rem', borderRadius: '20px', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)' }}>
              <Play size={22} fill="white" />
              Iniciar Viaje
            </button>
          </div>
        )}

        {/* ESTADO: VIAJE ACTIVO (MODO CONDUCCIÓN) */}
        {currentTrip && isTripActive && (
          <>
            {/* Cabecera / Botón Finalizar */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', pointerEvents: 'auto', zIndex: 1000 }}>
               <button onClick={() => setIsTripActive(false)} style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '50px', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                 <CheckCircle size={20} />
                 Finalizar
               </button>
            </div>

            {/* Pill de ETA Flotante Arriba al Medio */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', background: 'rgba(16, 185, 129, 0.95)', backdropFilter: 'blur(10px)', color: 'white', padding: '0.75rem 1.2rem', borderRadius: '50px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)', fontSize: '0.9rem', whiteSpace: 'nowrap', zIndex: 1000 }}>
              <Clock size={16} /> ETA: {currentTrip.estimatedTime || 'N/A'}
            </div>

            {/* Panel de Estadísticas Inferior */}
            <div className="animate-slide-up" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', width: 'calc(100% - 2rem)', maxWidth: '500px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '32px', padding: '1.5rem 1rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', border: '1px solid rgba(255,255,255,1)', zIndex: 1000 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.25rem' }}>Velocidad</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{speedKn} <span style={{fontSize: '0.9rem', color: '#64748b', fontWeight: 700}}>km/h</span></div>
              </div>
              <div style={{ width: '2px', height: '50px', background: '#e2e8f0', borderRadius: '2px' }}></div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.25rem' }}>Restante</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{currentTrip.distanceKm || '...'} <span style={{fontSize: '0.9rem', fontWeight: 700}}>km</span></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
