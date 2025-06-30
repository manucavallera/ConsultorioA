import app from "./app.js"; // Asegúrate de que la ruta sea correcta
import mongoose from "mongoose";
import dotenv from "dotenv"; // Importa dotenv

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const PORT = 5000;

// Conectar a la base de datos usando la variable de entorno
mongoose
  .connect(process.env.MONGODB_URI, {
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
