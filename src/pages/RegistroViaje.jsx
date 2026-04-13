import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get, set, child } from 'firebase/database';
import { Send, FileText, MapPin, Package, User, Clock, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Fix icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Componente para capturar doble click o click normal en mapa
function MapPickerHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    }
  });
  return null;
}

// Componente para poder centrar el mapa desde afuera
function MapController({ centerPos }) {
  const map = useMap();
  useEffect(() => {
    if (centerPos) {
      map.flyTo(centerPos, 14, { animate: true });
    }
  }, [centerPos, map]);
  return null;
}

export default function RegistroViaje() {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    driver: '',
    originName: '',
    destName: '',
    cargo: '',
    weight: ''
  });
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState([-33.4569, -70.6483]);
  const [selectingMode, setSelectingMode] = useState('origin'); // 'origin' o 'dest'
  const [status, setStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    // Cargar todos los choferes al montar
    const fetchDrivers = async () => {
      try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'users'));
        if (snapshot.exists()) {
          const usersObj = snapshot.val();
          const conductors = [];
          for (let key in usersObj) {
            if (usersObj[key].role === 'conductor') {
              conductors.push(key);
            }
          }
          setDrivers(conductors);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Calculando ruta...', type: 'info' });
    
    if (!formData.driver) {
      setStatus({ message: 'Selecciona un chofer primero.', type: 'error' });
      return;
    }
    if (!originCoords || !destCoords) {
      setStatus({ message: 'Debes hacer clic en el mapa para fijar Origen y Destino.', type: 'error' });
      return;
    }

    try {
      let routeGeometry = null;
      let estimatedTime = 'Sin cálculo';
      let distanceKm = '0';
      
      // Conectar a API real de enrutamiento OSRM
      const resp = await fetch(`https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`);
      const data = await resp.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        routeGeometry = route.geometry.coordinates; // [[lng, lat], ...]
        const durMins = Math.round(route.duration / 60);
        
        estimatedTime = durMins > 60 ? `${Math.floor(durMins/60)} h ${durMins%60} m` : `${durMins} min`;
        distanceKm = (route.distance / 1000).toFixed(1);
      }

      const tripData = {
        origin: formData.originName || 'Punto Geo-Asignado (A)',
        destination: formData.destName || 'Punto Geo-Asignado (B)',
        originCoords,
        destCoords,
        cargo: formData.cargo,
        weight: formData.weight,
        startTime: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute:'2-digit' }),
        status: 'Pendiente',
        estimatedTime,
        distanceKm,
        routeGeometry
      };
      
      await set(ref(database, `users/${formData.driver}/currentTrip`), tripData);
      
      setStatus({ message: `Ruta de ${distanceKm} km calculada y asignada exitosamente a ${formData.driver}`, type: 'success' });
      setFormData({ driver: '', originName: '', destName: '', cargo: '', weight: '' });
      setOriginCoords(null);
      setDestCoords(null);
      setSelectingMode('origin');
    } catch (e) {
      console.error(e);
      setStatus({ message: 'Error de red o geolocalización al calcular ruta.', type: 'error' });
    }
  };

  const handleSearch = async (query, type) => {
    if (!query) return;
    setStatus({ message: 'Buscando dirección...', type: 'info' });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const latlng = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(latlng);
        if (type === 'origin') {
          setOriginCoords(latlng);
          setSelectingMode('dest');
        } else {
          setDestCoords(latlng);
        }
        setStatus({ message: '', type: '' });
      } else {
        setStatus({ message: 'No se encontró la dirección en el mapa.', type: 'error' });
      }
    } catch (e) {
      setStatus({ message: 'Error al buscar dirección.', type: 'error' });
    }
  };

  const locateAdminGPS = () => {
    if (!navigator.geolocation) {
      setStatus({ message: 'GPS no soportado en tu navegador.', type: 'error' });
      return;
    }
    setStatus({ message: 'Obteniendo GPS...', type: 'info' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(latlng);
        if (selectingMode === 'origin') {
          setOriginCoords(latlng);
          setSelectingMode('dest');
        } else {
          setDestCoords(latlng);
        }
        setStatus({ message: '', type: '' });
      },
      () => setStatus({ message: 'Permiso de ubicación denegado.', type: 'error' })
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="animate-fade-in">
      <div className="header-title" style={{ marginBottom: '2rem' }}>
        <h1>Registrar Viaje / Movimiento</h1>
        <p>Ingresa los datos del camión, patente y detalles de la carga.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--accent-primary)" />
            Formulario de Registro
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label><User size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Seleccionar Chofer</label>
              <select 
                name="driver"
                className="form-control" 
                value={formData.driver}
                onChange={handleChange}
                required
              >
                <option value="">-- Elija un conductor disponible --</option>
                {drivers.map(drv => (
                  <option key={drv} value={drv}>{drv.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <label><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Nombre Origen (Opcional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" name="originName" className="form-control" placeholder="Ej. Calle Santiago 123" value={formData.originName} onChange={handleChange} />
                    <button type="button" className="btn btn-outline" onClick={() => handleSearch(formData.originName, 'origin')} style={{ whiteSpace: 'nowrap' }}>Buscar en Mapa</button>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <label><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Nombre Destino (Opcional)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" name="destName" className="form-control" placeholder="Ej. Puerto Valparaíso" value={formData.destName} onChange={handleChange} />
                    <button type="button" className="btn btn-outline" onClick={() => handleSearch(formData.destName, 'dest')} style={{ whiteSpace: 'nowrap' }}>Buscar en Mapa</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '-1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Posiciones Geográficas Exactas</span>
                <button type="button" onClick={locateAdminGPS} style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ Usar Mi GPS Actual</button>
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                 <button 
                   type="button" 
                   onClick={() => setSelectingMode('origin')} 
                   style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: selectingMode === 'origin' ? '2px solid var(--accent-primary)' : '1px solid #ddd', background: selectingMode === 'origin' ? 'rgba(59, 130, 246, 0.1)' : 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                 >
                   {originCoords ? <CheckCircle size={18} color="var(--accent-primary)" /> : <MapPin size={18} />}
                   1. Tocar Origen
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setSelectingMode('dest')} 
                   style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: selectingMode === 'dest' ? '2px solid var(--accent-warning)' : '1px solid #ddd', background: selectingMode === 'dest' ? 'rgba(234, 179, 8, 0.1)' : 'white', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                 >
                   {destCoords ? <CheckCircle size={18} color="var(--accent-warning)" /> : <MapPin size={18} />}
                   2. Tocar Destino
                 </button>
              </div>

              <div style={{ height: '350px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   <MapController centerPos={mapCenter} />
                   <MapPickerHandler onLocationSelect={(latlng) => {
                      if (selectingMode === 'origin') {
                        setOriginCoords([latlng.lat, latlng.lng]);
                        setSelectingMode('dest'); // Auto-switch to dest after origin
                      } else {
                        setDestCoords([latlng.lat, latlng.lng]);
                      }
                   }} />
                   {originCoords && <Marker position={originCoords}><Popup>Origen Asignado</Popup></Marker>}
                   {destCoords && <Marker position={destCoords}><Popup>Destino Asignado</Popup></Marker>}
                </MapContainer>
              </div>
            </div>

            <div className="form-group">
              <label><Package size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Cargamento</label>
              <input 
                type="text" 
                name="cargo"
                className="form-control" 
                placeholder="Ej. Materiales Metálicos" 
                value={formData.cargo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><FileText size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Peso Total</label>
              <input 
                type="text" 
                name="weight"
                className="form-control" 
                placeholder="Ej. 12.5 Toneladas" 
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {status.message && (
            <div style={{ padding: '1rem', marginTop: '1rem', borderRadius: 'var(--radius-md)', background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 500, textAlign: 'center' }}>
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => { setFormData({ driver: '', originName: '', destName: '', cargo: '', weight: '' }); setOriginCoords(null); setDestCoords(null); setSelectingMode('origin'); }}>Reiniciar Posiciones</button>
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
              Asignar Ruta GPS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
