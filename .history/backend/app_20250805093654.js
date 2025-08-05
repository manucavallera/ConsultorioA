import express from "express";
import cors from "cors";

// ✅ IMPORTA SOLO UNA RUTA A LA VEZ PARA ENCONTRAR EL PROBLEMA
console.log("🔄 Importando pacienteRoutes...");
import pacienteRoutes from "./routes/pacienteRoutes.js";
console.log("✅ pacienteRoutes importado");

// ❌ COMENTA TODAS LAS DEMÁS PARA ENCONTRAR LA PROBLEMÁTICA
// console.log("🔄 Importando historialClinicoRoutes...");
// import historialClinicoRoutes from "./routes/historialClinicoRoutes.js";
// console.log("✅ historialClinicoRoutes importado");

// console.log("🔄 Importando registroTratamientoRoutes...");
// import registroTratamientoRoutes from "./routes/registroTratamientoRoutes.js";
// console.log("✅ registroTratamientoRoutes importado");

// console.log("🔄 Importando estudioLaboratorioRoutes...");
// import estudioLaboratorioRoutes from "./routes/estudioLaboratorio.js";
// console.log("✅ estudioLaboratorioRoutes importado");

// console.log("🔄 Importando solicitudAnalisisRoutes...");
// import solicitudAnalisisRoutes from "./routes/solicitudAnalisisRoutes.js";
// console.log("✅ solicitudAnalisisRoutes importado");

// console.log("🔄 Importando citaRoutes...");
// import citaRoutes from "./routes/citaRoutes.js";
// console.log("✅ citaRoutes importado");

// console.log("🔄 Importando fotoAntesDepuesRoutes...");
// import fotoAntesDepuesRoutes from "./routes/fotoAntesDepuesRoutes.js";
// console.log("✅ fotoAntesDepuesRoutes importado");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando" });
});

// ✅ SOLO UNA RUTA PARA PROBAR
console.log("🔄 Registrando ruta pacientes...");
app.use("/pacientes", pacienteRoutes);
console.log("✅ Ruta pacientes registrada");

export default app;
