import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PacienteForm from "./components/PacientForm";
import PacienteList from "./components/PacientList";
import { useState } from "react";

function App() {
  const [nuevoPaciente, setNuevoPaciente] = useState(null);
  const [pacienteEditando, setPacienteEditando] = useState(null);

  const handlePacienteSubmit = (paciente, accion) => {
    if (accion === "creado") {
      setNuevoPaciente(paciente);
    } else if (accion === "editado") {
      setNuevoPaciente(paciente); // Esto actualizará la lista
      setPacienteEditando(null); // Salimos del modo edición
    }
  };

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/pacientes'
          element={
            <div style={{ padding: "2rem" }}>
              <h2>Gestión de Pacientes</h2>
              <PacienteForm
                onPacienteSubmit={handlePacienteSubmit}
                pacienteEditando={pacienteEditando}
              />
              <hr />
              <PacienteList
                nuevoPaciente={nuevoPaciente}
                onEditPaciente={setPacienteEditando}
              />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
