import { useState } from "react";
import PacienteForm from "./components/PacienteForm";
import PacienteList from "./components/PacienteList";

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
