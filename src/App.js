import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link
} from 'react-router-dom';

// Componentes de ejemplo (puedes quitarlos si no los necesitas)

export default function App() {
  return (
    <Router>
      <nav style={{ padding: '1rem' }}>
    
        <Link to="/paciente">Pacientes</Link>
      </nav>

      <Switch>
        <Route exact path="/paciente" component={SDWE} />
        {/* Puedes agregar más rutas aquí */}
      </Switch>
    </Router>
  );
}
