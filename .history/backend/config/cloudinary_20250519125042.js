import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // Asegura que el .env esté cargado antes de usar process.env

cloudinary.config(); // Usa CLOUDINARY_URL o las otras vars

export default cloudinary;
