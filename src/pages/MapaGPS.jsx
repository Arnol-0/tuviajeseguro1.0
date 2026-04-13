import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, Truck } from 'lucide-react';
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
const truckIconHtml = renderToString(<Truck size={24} color="#ffffff" />);
const customTruckIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">${truckIconHtml}</div>`,
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
      map.flyTo(position, 12, {
        duration: 1.5
      });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <strong>Tu ubicación actual</strong><br/>
        Estás aquí.
      </Popup>
    </Marker>
  );
}

export default function MapaGPS() {
  const [position, setPosition] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTrucks, setActiveTrucks] = useState([]);

  // Leer posiciones en tiempo real desde Firebase
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const trucks = [];
      if (snapshot.exists()) {
        const usersObj = snapshot.val();
        for (let key in usersObj) {
          const user = usersObj[key];
          // Solo cargar camiones que estén transmitiendo ubicación
          if (user.role === 'conductor' && user.location) {
            trucks.push({
              driver: key.toUpperCase(),
              position: [user.location.lat, user.location.lng],
              destination: user.currentTrip ? user.currentTrip.destination : 'Sin ruta',
              cargo: user.currentTrip ? user.currentTrip.cargo : 'N/A'
            });
          }
        }
      }
      setActiveTrucks(trucks);
    });

    return () => unsubscribe();
  }, []);

  const locateUser = () => {
    setLoading(true);
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocalización no soportada por el navegador.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setErrorMsg('Error al ubicar. Asegúrate de dar permisos de GPS.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Rastreo GPS en Mapa</h1>
        <p>Visualiza tu ubicación actual y los camiones de prueba en tiempo real.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-primary" 
          onClick={locateUser}
          disabled={loading}
          style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
        >
          <Navigation size={20} />
          {loading ? 'Buscando Señal...' : 'Botón GPS - Ver Mi Ubicación'}
        </button>

        {errorMsg && <div style={{ color: 'var(--accent-danger)', fontWeight: 500 }}>{errorMsg}</div>}
        
        {position && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
            <MapPin size={24} color="var(--accent-success)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ubicación Fijada</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Lat {position[0].toFixed(5)}, Lng {position[1].toFixed(5)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', height: '600px', borderRadius: 'var(--radius-xl)', position: 'relative' }}>
        <MapContainer 
          center={position || [-33.4489, -70.6693]} 
          zoom={11} 
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; Mapa OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} />
          
          {/* Renderizar Camiones con GPS Activo (Realtime API) */}
          {activeTrucks.map((truck, idx) => (
            <Marker key={idx} position={truck.position} icon={customTruckIcon}>
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.25rem' }}>
                    <Truck size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                    {truck.driver}
                  </div>
                  <div style={{ margin: '0.25rem 0' }}><strong>Destino:</strong> {truck.destination}</div>
                  <div style={{ margin: '0.25rem 0' }}><strong>Carga:</strong> {truck.cargo}</div>
                  <div style={{ margin: '0.25rem 0' }}><strong>Estado:</strong> <span style={{ color: 'var(--accent-success)' }}>En Viaje Activo</span></div>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
      </div>
    </div>
  );
}
