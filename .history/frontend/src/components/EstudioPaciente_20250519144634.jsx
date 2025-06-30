import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const EstudiosPaciente = () => {
  const { pacienteId } = useParams();
  const location = useLocation();

  // Si navegas desde la lista y pasas el paciente por location.state, úsalo directamente
  const [paciente, setPaciente] = useState(location.state?.paciente || null);
  const [tipo, setTipo] = useState("Hemograma");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  // Obtener los datos del paciente si no están en el estado
  useEffect(() => {
    if (!paciente && pacienteId) {
      fetch(`http://localhost:5000/pacientes/${pacienteId}`)
        .then((res) => res.json())
        .then((data) => setPaciente(data))
        .catch(() => setPaciente(null));
    }
  }, [pacienteId, paciente]);

  // Traer estudios actuales del paciente
  useEffect(() => {
    if (pacienteId) {
      fetch(`http://localhost:3000/estudios/paciente/${pacienteId}`)
        .then((res) => res.json())
        .then((data) => setEstudios(data))
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
      await fetch("http://localhost:3000/estudios", {
        method: "POST",
        body: formData,
      });
      // Refrescar lista de estudios
      const res = await fetch(
        `http://localhost:3000/estudios/paciente/${pacienteId}`
      );
      const data = await res.json();
      setEstudios(data);
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

      {paciente && (
        <div
          style={{
            marginBottom: 16,
            background: "#f4f4f4",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <strong>Paciente:</strong> {paciente.nombre} {paciente.apellido}{" "}
          <br />
          <strong>DNI:</strong> {paciente.dni} <br />
          <strong>Email:</strong> {paciente.email}
        </div>
      )}

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
