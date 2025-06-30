import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

// Configura el storage de Multer usando Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "estudios-laboratorio", // Carpeta en Cloudinary
    resource_type: "auto", // Permite subir imágenes, pdf, etc.
    public_id: (req, file) => Date.now() + "-" + file.originalname, // Nombre único
  },
});

// Multer recibe el storage configurado con Cloudinary
const upload = multer({ storage: storage });

export default upload;
