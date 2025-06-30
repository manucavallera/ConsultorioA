import { v2 as cloudinary } from "cloudinary";

cloudinary.config(); // Esto toma automáticamente CLOUDINARY_URL del .env

export default cloudinary;
