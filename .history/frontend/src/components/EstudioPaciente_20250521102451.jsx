import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const opcionesAnalisis = [
  "Hemograma",
  "Glucosa",
  "Orina",
  "Colesterol",
  "Otro",
];

const EstudiosPaciente = () => {
  const { pacienteId } = useParams();
  const location = useLocation();

  const [paciente, setPaciente] = useState(location.state?.paciente || null);
  const [solicitudAnalisis, setSolicitudAnalisis] = useState([]);
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

  // Checkbox handler
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setSolicitudAnalisis((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // Subir nuevo estudio
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Selecciona un archivo");
    if (solicitudAnalisis.length === 0)
      return alert("Selecciona al menos un tipo de análisis");

    setSubiendo(true);
    const formData = new FormData();
    // IMPORTANTE: FormData solo acepta strings, así que mandamos cada valor por separado
    solicitudAnalisis.forEach((tipo) =>
      formData.append("solicitudAnalisis[]", tipo)
    );
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
      setSolicitudAnalisis([]);
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
          <strong>Email:</strong> {paciente.email} <br />
          <strong>Género:</strong> {paciente.genero || "N/A"}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div>
          <label>Solicitud de análisis:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {opcionesAnalisis.map((opcion) => (
              <label key={opcion} style={{ minWidth: 120 }}>
                <input
                  type='checkbox'
                  value={opcion}
                  checked={solicitudAnalisis.includes(opcion)}
                  onChange={handleCheckboxChange}
                />
                {opcion}
              </label>
            ))}
          </div>
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
            <strong>
              {estudio.solicitudAnalisis
                ? Array.isArray(estudio.solicitudAnalisis)
                  ? estudio.solicitudAnalisis.join(", ")
                  : estudio.solicitudAnalisis
                : "Sin tipo"}
            </strong>
            {" - "}
            {estudio.descripcion}
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
