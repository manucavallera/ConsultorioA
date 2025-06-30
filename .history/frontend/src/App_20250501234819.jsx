import { useState } from "react";
import PacienteForm from "./components/PacientForm";
import PacienteList from "./components/PacientList";

function App() {
  const [nuevoPaciente, setNuevoPaciente] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      <PacienteForm onPacienteCreado={setNuevoPaciente} />
      <hr />
      <PacienteList nuevoPaciente={nuevoPaciente} />
    </div>
  );
}

export default App;
