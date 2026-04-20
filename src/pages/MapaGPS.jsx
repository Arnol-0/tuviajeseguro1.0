import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Truck, Crosshair, Users } from 'lucide-react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';

// Corregir icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Crear icon de camión personalizado a partir de Lucide
const truckIconHtml = renderToString(<Truck size={20} color="#ffffff" />);
const customTruckIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); border: 2px solid white; transition: all 0.3s ease;">${truckIconHtml}</div>`,
  className: 'dummy-custom-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

// Componente para volver a centrar el mapa
function LocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 1.5 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>Casa Central - Temuco</strong><br/>
          (Tu ubicación actual)
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapaGPS() {
  const [position, setPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrucks, setActiveTrucks] = useState([]);
  const [fleetStatus, setFleetStatus] = useState([]);

  // Leer posiciones en tiempo real desde Firebase
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const trucks = [];
      const fleet = [];
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        for (let key in usersObj) {
          const user = usersObj[key];
          if (user.role === 'conductor') {
            const trip = user.currentTrip;
            const hasLiveLocation = !!user.location;
            
            // Llenar panel de estado de flota si tienen ruta asignada
            if (trip) {
               fleet.push({
                 driver: key,
                 dest: trip.destination,
                 isDriving: hasLiveLocation
               });

               // Cargar al mapa: Si está en vivo (location real) o si tiene originCoords (punto de salida)
               const positionCoords = hasLiveLocation 
                 ? [user.location.lat, user.location.lng] 
                 : (trip.originCoords ? [trip.originCoords[0], trip.originCoords[1]] : null);

               if (positionCoords) {
                 trucks.push({
                   driver: key.toUpperCase(),
                   position: positionCoords,
                   destination: trip.destination || 'Sin ruta',
                   cargo: trip.cargo || 'N/A',
                   status: hasLiveLocation ? 'En Movimiento (GPS Vivo)' : 'Estacionado (En origen)',
                   isLive: hasLiveLocation
                 });
               }
            } else if (hasLiveLocation) {
               // Transmite ubicación pero no tiene viaje asignado
               trucks.push({
                 driver: key.toUpperCase(),
                 position: [user.location.lat, user.location.lng],
                 destination: 'Sin asignación',
                 cargo: 'Sin carga',
                 status: 'Libre / Conectado',
                 isLive: true
               });
            }
          }
        }
      }
      setActiveTrucks(trucks);
      setFleetStatus(fleet);
    });

    return () => unsubscribe();
  }, []);

  const locateUser = () => {
    setLoading(true);
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no soportada.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setErrorMsg('Error de GPS. Verifica permisos.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Auto-localizar al montar la vista
  useEffect(() => {
    locateUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 100px)', minHeight: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
      
      {/* CAPA Base del MAPA */}
      <MapContainer 
        center={position || [-38.7359, -72.5904]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false} // Quitamos control de zoom nativo para limpiar UI
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} />
        
        {/* Renderizar Camiones con GPS Activo O Estacionados (Realtime API) */}
        {activeTrucks.map((truck, idx) => (
          <Marker key={idx} position={truck.position} icon={customTruckIcon}>
            <Popup>
              <div style={{ minWidth: '180px', padding: '0.25rem 0' }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={16} color="#3b82f6" />
                  {truck.driver}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}><strong>Destino:</strong> {truck.destination}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}><strong>Carga:</strong> {truck.cargo}</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <span style={{ padding: '4px 8px', background: truck.isLive ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)', color: truck.isLive ? '#10b981' : '#eab308', borderRadius: '12px', fontWeight: 700 }}>
                    {truck.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* OVERLAY: Encabezado Título Flotante (Arriba Izquierda) */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 1000, pointerEvents: 'none' }}>
        <div className="animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', padding: '1rem 1.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.8)', pointerEvents: 'auto' }}>
           <h1 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Navigation color="#3b82f6" size={24} /> Radar Global
           </h1>
           <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Monitoreo GPS en Tiempo Real</p>
        </div>
      </div>

      {/* OVERLAY: Flota Activa (Panel Derecho) */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 1000, pointerEvents: 'none', width: '100%', maxWidth: '300px' }}>
         <div className="animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(16px)', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.8)', pointerEvents: 'auto', maxHeight: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
              <Users size={18} color="#8b5cf6" /> Resumen de Flota ({fleetStatus.length})
            </h3>
            
            <div style={{ overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {fleetStatus.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, background: '#f8fafc', borderRadius: '16px' }}>
                    Sin conductores activos
                  </div>
               ) : (
                  fleetStatus.map(drv => (
                     <div key={drv.driver} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '16px', borderLeft: drv.isDriving ? '4px solid #10b981' : '4px solid #eab308' }}>
                         <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{drv.driver.toUpperCase()}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>Dest: {drv.dest}</div>
                         </div>
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: drv.isDriving ? '#10b981' : '#eab308', boxShadow: drv.isDriving ? '0 0 10px #10b981' : 'none' }} title={drv.isDriving ? 'En Movimiento' : 'Estacionado'} />
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>

      {/* OVERLAY: Controles Inferiores (Abajo Izquierda) */}
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', zIndex: 1000, pointerEvents: 'none', display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
        
        {/* Botón de Centrar */}
        <button 
          onClick={locateUser} 
          disabled={loading}
          className="btn-animate"
          style={{ pointerEvents: 'auto', background: loading ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', padding: '0.85rem 1.75rem', borderRadius: '50px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 25px rgba(15, 23, 42, 0.4)', cursor: loading ? 'wait' : 'pointer', transition: 'transform 0.2s, background 0.2s' }}
        >
          <Crosshair size={18} /> {loading ? 'Ubicando...' : 'Mi Posición'}
        </button>

        {/* Coordenadas o Error */}
        {(position || errorMsg) && (
          <div className="animate-slide-up" style={{ pointerEvents: 'auto', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', padding: '0.65rem 1.25rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.8)' }}>
             {errorMsg ? (
               <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>{errorMsg}</div>
             ) : (
               <>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: '32px', height: '32px', borderRadius: '50%' }}>
                   <MapPin size={16} />
                 </div>
                 <div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>Central</div>
                   <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
                 </div>
               </>
             )}
          </div>
        )}

      </div>
    </div>
  );
}
