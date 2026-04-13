import React, { useState } from 'react';
import { Truck, Shield, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * MOCK_DB: Base de datos simulada para el inicio de sesión.
 * En producción, esto debería reemplazarse por una llamada real a una API o servicio de backend.
 */
const MOCK_DB = {
  'admin': { password: '123', role: 'supervisor' },
  'chofer': { password: '123', role: 'conductor' }
};

/**
 * Componente principal de Login (Inicio de Sesión).
 * Permite a los usuarios ingresar al sistema seleccionando un rol y validando credenciales simuladas.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.onLogin - Función que se ejecuta tras un inicio de sesión exitoso; recibe el rol del usuario como argumento.
 */
export default function Login({ onLogin }) {
  // Estado para guardar el rol actualmente seleccionado ('supervisor' o 'conductor')
  const [activeRole, setActiveRole] = useState('supervisor');
  
  // Estado para los campos del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para manejar mensajes de error (credenciales inválidas, etc.)
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estado para mostrar spinner de carga durante el "request"
  const [loading, setLoading] = useState(false);
  
  // Hook de react-router para la redirección tras login exitoso
  const navigate = useNavigate();

  /**
   * Manejador del evento submit del formulario de inicio de sesión.
   * Realiza validaciones contra la base de datos local y simula latencia de red.
   */
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Simulamos un retraso de red de 1.2 segundos para mostrar el spinner
    setTimeout(() => {
      // Usamos toLowerCase() y trim() para insensibilidad de formato
      const userRecord = MOCK_DB[username.toLowerCase().trim()];
      
      // Validación 1: ¿Existe el usuario?
      if (!userRecord) {
        setErrorMsg('Usuario no encontrado');
        setLoading(false);
        return;
      }
      
      // Validación 2: ¿La contraseña es correcta?
      if (userRecord.password !== password) {
        setErrorMsg('Contraseña incorrecta');
        setLoading(false);
        return;
      }
      
      // Validación 3: ¿El rol seleccionado coincide con el rol del usuario en la base de datos?
      if (userRecord.role !== activeRole) {
        setErrorMsg(`Este usuario no tiene permisos de ${activeRole}`);
        setLoading(false);
        return;
      }

      // Login exitoso: Notificamos a la aplicación (App.jsx) sobre el nuevo rol activo
      onLogin(activeRole);
      
      // Redirigimos a la raíz (Dashboard) que ahora mostrará la vista correspondiente al rol
      navigate('/');
    }, 1200);
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-up">
        
        <div className="login-content">
          {/* Logo / Icono superior */}
          <div className="login-top-icon">
            <Truck size={36} color="white" />
          </div>
          <h2 className="login-title">FREIGHT SENTINEL</h2>
          <p className="login-subtitle">Selecciona tu rol operativo para acceder</p>

          {/* --- SELECTOR DE ROLES --- */}
          <div className="role-toggle">
            <button 
              type="button" 
              className={`role-btn ${activeRole === 'supervisor' ? 'active' : 'inactive'}`}
              onClick={() => setActiveRole('supervisor')}
            >
              <Shield size={16} /> Supervisor
            </button>
            <button 
              type="button" 
              className={`role-btn ${activeRole === 'conductor' ? 'active' : 'inactive'}`}
              onClick={() => setActiveRole('conductor')}
            >
              <User size={16} /> Conductor
            </button>
          </div>

          {/* --- FORMULARIO DE INGRESO --- */}
          <form onSubmit={handleLogin}>
            {/* Campo: Nombre de Usuario */}
            <div className="login-input-group">
              <div className="login-label">
                <span>Nombre de Usuario</span>
              </div>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  className="login-input"
                  placeholder={activeRole === 'supervisor' ? "ID_ARQUITECTO (ej: admin)" : "ID_CHOFER (ej: chofer)"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo: Contraseña (Token de Seguridad) */}
            <div className="login-input-group">
              <div className="login-label">
                <span>Token de Seguridad</span>
                {/* Enlace para recuperación de contraseña */}
                <a href="#" style={{ color: '#475569', textDecoration: 'none', textTransform: 'none' }}>¿Olvidó el Token?</a>
              </div>
              <div className="login-input-wrapper">
                <div className="login-input-icon">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  className="login-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* --- MENSAJE DE ERROR --- */}
            {errorMsg && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center', fontWeight: '500' }}>
                {errorMsg}
              </div>
            )}

            {/* Checkbox para mantener sesión iniciada */}
            <div className="checkbox-group">
              <input type="checkbox" id="keep-session" />
              <label htmlFor="keep-session">Mantener sesión por 12 horas</label>
            </div>

            {/* Botón de Submit (muestra spinner si está procesando la validación) */}
            <button type="submit" className={`btn-terminal ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>
                  ENTRAR AL TERMINAL <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Información de la parte inferior de la tarjeta de login */}
        <div className="login-bottom-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            SISTEMA OPERATIVO
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
            <ShieldCheck size={14} />
            AES-256 ENCRYPTED
          </div>
        </div>
      </div>

      <div className="login-footer-text">
        OPERANDO BAJO ESTÁNDARES DE SEGURIDAD ISO 27001
      </div>
    </div>
  );
}
