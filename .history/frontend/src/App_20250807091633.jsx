import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import PacienteForm from "./components/PacientForm";
import PacienteList from "./components/PacientList";
import PatientHistoryForm from "./components/PatientHistoryForm";
import RegistroTratamiento from "./components/RegistroTratamiento";
import CitasDashboard from "./components/Citas";
// ❌ ELIMINAR: import PagosDashboard from "./components/PagosDashboard";
import { useState, useCallback } from "react"; // ← AGREGADO useCallback
import SolicitudesPaciente from "./components/SolicitudAnalisis";
import SubirEstudiosAnalisis from "./components/SubirEstudiosAnalisis";
import FotosAntesDepues from "./components/FotoAntesDespues";

function App() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteEditando, setPacienteEditando] = useState(null);

  // ✅ FIX: useCallback evita que la función se recree en cada render
  const handlePacienteSubmit = useCallback((paciente, accion) => {
    if (accion === "creado") {
      setPacientes((prev) => [...prev, paciente]);
    } else if (accion === "editado") {
      setPacientes((prev) =>
        prev.map((p) => (p._id === paciente._id ? paciente : p))
      );
      setPacienteEditando(null);
    }
  }, []); // ← Sin dependencias porque usa solo setPacientes

  // ✅ FIX: useCallback para el handler de edición también
  const handleEditPaciente = useCallback((paciente) => {
    setPacienteEditando(paciente);
  }, []);

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
                pacientes={pacientes}
                setPacientes={setPacientes}
                onEditPaciente={handleEditPaciente}
              />
            </div>
          }
        />
        <Route path='/historial/:pacienteId' element={<PatientHistoryForm />} />
        <Route
          path='/tratamientos/:pacienteId'
          element={<RegistroTratamiento />}
        />
        <Route
          path='/pacientes/:pacienteId/solicitudes'
          element={<SolicitudesPaciente />}
        />
        <Route
          path='/pacientes/:pacienteId/solicitudes/:solicitudId/estudios'
          element={<SubirEstudiosAnalisis />}
        />

        {/* 🎯 CITAS CON PAGOS INTEGRADOS */}
        <Route
          path='/pacientes/:pacienteId/citas'
          element={<CitasDashboard />}
        />

        {/* 🗑️ ELIMINAR TODAS ESTAS RUTAS DE PAGOS */}
        {/* <Route path='/pagos' element={<PagosDashboard />} /> */}
        {/* <Route path='/pacientes/:pacienteId/pagos' element={<PagosDashboard />} /> */}
        {/* <Route path='/citas/:citaId/pago' element={<PagosDashboard />} /> */}

        {/* RUTA PARA FOTOS ANTES/DESPUÉS */}
        <Route
          path='/pacientes/:pacienteId/fotos'
          element={<FotosAntesDepues />}
        />
      </Routes>
    </Router>
  );
}

export default App;
