import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PacienteForm from "./components/PacientForm";
import PacienteList from "./components/PacientList";
import { useState } from "react";

function App() {
  const [nuevoPaciente, setNuevoPaciente] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/pacientes'
          element={
            <div style={{ padding: "2rem" }}>
              <h2>Gestión de Pacientes</h2>
              <PacienteForm onPacienteCreado={setNuevoPaciente} />
              <hr />
              <PacienteList nuevoPaciente={nuevoPaciente} />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
