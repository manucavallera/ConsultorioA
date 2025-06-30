import app from "./app.js"; // Asegúrate de que la ruta sea correcta
import mongoose from "mongoose";

const PORT = 5000;

// Conectar a la base de datos
mongoose
  .connect("mongodb://localhost:27017/tu_base_de_datos", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Conectado correctamente a MongoDB");
    // Iniciar el servidor solo después de conectarse a la base de datos
    app.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error al conectar a MongoDB:", err);
  });
