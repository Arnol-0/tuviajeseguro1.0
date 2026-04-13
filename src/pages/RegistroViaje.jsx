import React, { useState } from 'react';
import { Send, FileText } from 'lucide-react';

export default function RegistroViaje() {
  const [formData, setFormData] = useState({
    patent: '',
    driver: '',
    type: 'Entrada',
    cargo: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    alert(`Viaje de ${formData.type} registrado para la patente ${formData.patent}`);
    setFormData({ patent: '', driver: '', type: 'Entrada', cargo: '', notes: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patent') {
      // Auto uppercase for patent
      setFormData({ ...formData, [name]: value.toUpperCase().slice(0,7) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
              <label>Patente del Vehículo</label>
              <input 
                type="text" 
                name="patent"
                className="form-control" 
                placeholder="Ej. LXYZ-45" 
                value={formData.patent}
                onChange={handleChange}
                required
                style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', fontWeight: 'bold' }}
              />
            </div>

            <div className="form-group">
              <label>Nombre del Conductor</label>
              <input 
                type="text" 
                name="driver"
                className="form-control" 
                placeholder="Nombre Completo" 
                value={formData.driver}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Movimiento</label>
              <select 
                name="type"
                className="form-control" 
                value={formData.type}
                onChange={handleChange}
              >
                <option value="Entrada">Entrada (Llegada a Base)</option>
                <option value="Salida">Salida (En Ruta)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de Carga</label>
              <input 
                type="text" 
                name="cargo"
                className="form-control" 
                placeholder="Ej. Materiales de Construcción" 
                value={formData.cargo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notas Adicionales / Observaciones</label>
            <textarea 
              name="notes"
              className="form-control" 
              rows="4" 
              placeholder="Detalles sobre el estado del camión, carga, etc."
              value={formData.notes}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setFormData({ patent: '', driver: '', type: 'Entrada', cargo: '', notes: '' })}>Limpiar Formulario</button>
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
              Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
