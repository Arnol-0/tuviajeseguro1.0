import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DashboardConductor from './pages/DashboardConductor';
import RegistroViaje from './pages/RegistroViaje';
import PerfilUsuario from './pages/PerfilUsuario';
import MapaGPS from './pages/MapaGPS';
import Login from './pages/Login';

function App() {
  const [authState, setAuthState] = useState({ isAuthenticated: false, role: null });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={(role) => setAuthState({ isAuthenticated: true, role })} />} />
        
        <Route path="/" element={authState.isAuthenticated ? <Layout role={authState.role} /> : <Navigate to="/login" replace />}>
          <Route index element={authState.role === 'supervisor' ? <Dashboard /> : <DashboardConductor />} />
          <Route path="registro" element={<RegistroViaje />} />
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="mapa" element={<MapaGPS />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
