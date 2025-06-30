import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:5000";

export default function PerfilPaciente({ pacienteId }) {
  const [paciente, setPaciente] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Traer paciente y estudios al montar
  useEffect(() => {
    if (!pacienteId) return;

    fetch(`${API_BASE}/pacientes/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => setPaciente(data));

    fetch(`${API_BASE}/estudios/paciente/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => setEstudios(data));
  }, [pacienteId]);

  // SUBIR NUEVO ESTUDIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Selecciona un archivo");

    setLoading(true);

    const formData = new FormData();
    formData.append("tipo", tipo);
    formData.append("descripcion", descripcion);
    formData.append("archivo", archivo);
    formData.append("pacienteId", pacienteId);

    const res = await fetch(`${API_BASE}/estudios`, {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      const nuevoEstudio = await res.json();
      setEstudios([nuevoEstudio, ...estudios]);
      setTipo("");
      setDescripcion("");
      setArchivo(null);
      alert("Estudio subido correctamente");
    } else {
      alert("Error al subir el estudio");
    }
  };

  // ELIMINAR ESTUDIO
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este estudio?")) return;
    const res = await fetch(`${API_BASE}/estudios/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEstudios(estudios.filter((e) => e._id !== id));
    } else {
      alert("No se pudo eliminar");
    }
  };

  if (!paciente) return <div>Cargando datos del paciente...</div>;

  return (
    <div>
      <h2>
        {paciente.nombre} {paciente.apellido}
      </h2>
      <p>DNI: {paciente.dni}</p>
      {/* Agrega otros datos si quieres */}

      <h3>Subir nuevo estudio</h3>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Tipo de estudio'
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        />
        <input
          type='text'
          placeholder='Descripción'
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
        <input
          type='file'
          accept='image/*,application/pdf'
          onChange={(e) => setArchivo(e.target.files[0])}
          required
        />
        <button type='submit' disabled={loading}>
          {loading ? "Subiendo..." : "Subir estudio"}
        </button>
      </form>

      <h3>Estudios</h3>
      {estudios.length === 0 && <p>No hay estudios cargados.</p>}
      {estudios.map((estudio) => (
        <div
          key={estudio._id}
          style={{
            marginBottom: "2rem",
            borderBottom: "1px solid #ddd",
            paddingBottom: "1rem",
          }}
        >
          <p>
            <strong>{estudio.tipo}</strong>
          </p>
          <p>{estudio.descripcion}</p>
          <p>Subido: {new Date(estudio.fechaSubida).toLocaleString()}</p>
          {estudio.archivoUrl.endsWith(".pdf") ? (
            <a
              href={estudio.archivoUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              Ver PDF
            </a>
          ) : (
            <img
              src={estudio.archivoUrl}
              alt={estudio.nombreArchivo}
              style={{
                maxWidth: "300px",
                display: "block",
                marginBottom: "0.5rem",
              }}
            />
          )}
          <button
            onClick={() => handleEliminar(estudio._id)}
            style={{ color: "red" }}
          >
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
