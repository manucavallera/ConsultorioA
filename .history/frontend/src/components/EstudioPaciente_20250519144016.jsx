import React, { useState, useEffect } from "react";
import axios from "axios";

const EstudiosPaciente = ({ pacienteId }) => {
  const [tipo, setTipo] = useState("Hemograma");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  // Traer estudios actuales del paciente
  useEffect(() => {
    if (pacienteId) {
      axios
        .get(`http://localhost:3000/estudios/paciente/${pacienteId}`)
        .then((res) => setEstudios(res.data))
        .catch(() => setEstudios([]));
    }
  }, [pacienteId]);

  // Subir nuevo estudio
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Selecciona un archivo");

    setSubiendo(true);
    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("descripcion", descripcion);
    formData.append("archivo", archivo);
    formData.append("pacienteId", pacienteId);

    try {
      await axios.post("http://localhost:3000/estudios", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Refrescar lista de estudios
      const res = await axios.get(
        `http://localhost:3000/estudios/paciente/${pacienteId}`
      );
      setEstudios(res.data);
      setTipo("Hemograma");
      setDescripcion("");
      setArchivo(null);
      e.target.reset();
    } catch (error) {
      alert("Error al subir el estudio");
    }
    setSubiendo(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2>Estudios de Laboratorio</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div>
          <label>Tipo de estudio:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value='Hemograma'>Hemograma</option>
            <option value='Glucosa'>Glucosa</option>
            <option value='Orina'>Orina</option>
            <option value='Otro'>Otro</option>
          </select>
        </div>
        <div>
          <label>Descripción:</label>
          <input
            type='text'
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder='Descripción'
            required
          />
        </div>
        <div>
          <label>Archivo:</label>
          <input
            type='file'
            onChange={(e) => setArchivo(e.target.files[0])}
            required
          />
        </div>
        <button type='submit' disabled={subiendo}>
          {subiendo ? "Subiendo..." : "Subir Estudio"}
        </button>
      </form>

      <h3>Historial de Estudios</h3>
      {estudios.length === 0 && <p>No hay estudios subidos.</p>}
      <ul>
        {estudios.map((estudio) => (
          <li key={estudio._id} style={{ marginBottom: 8 }}>
            <strong>{estudio.tipo}</strong> - {estudio.descripcion}
            <br />
            <a
              href={estudio.archivoUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              {estudio.nombreArchivo}
            </a>
            <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>
              ({new Date(estudio.fechaSubida).toLocaleDateString()})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EstudiosPaciente;
