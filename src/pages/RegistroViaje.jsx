import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, get, set, child } from 'firebase/database';
import { Send, FileText, MapPin, Package, User, Clock } from 'lucide-react';

export default function RegistroViaje() {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    driver: '',
    origin: '',
    destination: '',
    cargo: '',
    weight: ''
  });
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
    setStatus({ message: 'Asignando ruta...', type: 'info' });
    
    if (!formData.driver) {
      setStatus({ message: 'Selecciona un chofer primero', type: 'error' });
      return;
    }

    try {
      const tripData = {
        origin: formData.origin,
        destination: formData.destination,
        cargo: formData.cargo,
        weight: formData.weight,
        startTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }),
        status: 'Pendiente'
      };
      
      // Guardar el currentTrip dentro del nodo de ese chofer específico
      await set(ref(database, `users/${formData.driver}/currentTrip`), tripData);
      
      setStatus({ message: `Ruta asignada exitosamente a ${formData.driver}`, type: 'success' });
      setFormData({ driver: '', origin: '', destination: '', cargo: '', weight: '' });
    } catch (e) {
      console.error(e);
      setStatus({ message: 'Error al asignar la ruta', type: 'error' });
    }
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

            <div className="form-group">
              <label><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Punto de Origen</label>
              <input 
                type="text" 
                name="origin"
                className="form-control" 
                placeholder="Ej. Centro de Distribución Norte" 
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><MapPin size={16} style={{ verticalAlign: 'text-bottom', marginRight:'4px' }}/> Punto de Destino</label>
              <input 
                type="text" 
                name="destination"
                className="form-control" 
                placeholder="Ej. Sucursal Valparaíso" 
                value={formData.destination}
                onChange={handleChange}
                required
              />
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
            <button type="button" className="btn btn-outline" onClick={() => setFormData({ driver: '', origin: '', destination: '', cargo: '', weight: '' })}>Limpiar Formulario</button>
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
