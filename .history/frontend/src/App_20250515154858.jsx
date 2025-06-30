import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PacienteForm from "./components/PacientForm"; // Formulario de pacientes
import PacienteList from "./components/PacientList"; // Lista de pacientes
import PatientHistoryForm from "./components/PatientHistoryForm"; // Historial clínico
import RegistroTratamiento from "./components/RegistroTratamiento"; // Tratamientos
import { useState } from "react";

function App() {
  const [pacientes, setPacientes] = useState([]); // Estado global para pacientes
  const [pacienteEditando, setPacienteEditando] = useState(null); // Estado para paciente en edición

  // Maneja el envío del formulario de pacientes
  const handlePacienteSubmit = (paciente, accion) => {
    if (accion === "creado") {
      setPacientes((prev) => [...prev, paciente]); // Agrega un nuevo paciente
    } else if (accion === "editado") {
      setPacientes(
        (prev) => prev.map((p) => (p._id === paciente._id ? paciente : p)) // Actualiza un paciente existente
      );
      setPacienteEditando(null); // Limpia el estado de edición
    }
  };

  return (
    <Router>
      <Routes>
        {/* Ruta principal */}
        <Route path='/' element={<Home />} />

        {/* Ruta para gestionar pacientes */}
        <Route
          path='/pacientes'
          element={
            <div style={{ padding: "2rem" }}>
              <h2>Gestión de Pacientes</h2>
              {/* Formulario para crear o editar un paciente */}
              <PacienteForm
                onPacienteSubmit={handlePacienteSubmit}
                pacienteEditando={pacienteEditando}
              />
              <hr />
              {/* Lista de pacientes */}
              <PacienteList
                pacientes={pacientes}
                setPacientes={setPacientes}
                onEditPaciente={setPacienteEditando}
              />
            </div>
          }
        />

        {/* Ruta para gestionar el historial clínico */}
        <Route
          path='/historial/:pacienteId'
          element={<PatientHistoryForm />} // Renderiza el historial clínico
        />

        {/* Nueva ruta para gestionar tratamientos */}
        <Route
          path='/tratamientos/:pacienteId'
          element={<RegistroTratamiento />} // Renderiza el componente de tratamientos
        />
      </Routes>
    </Router>
  );
}

export default App;
