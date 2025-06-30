import React, { useEffect, useState } from "react";

// Props: pacienteId (string, requerido)
const SubirEstudioAnalisis = ({ pacienteId }) => {
  // Solicitudes de análisis del paciente
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudId, setSolicitudId] = useState("");
  // Estado para formulario de subida
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubir, setErrorSubir] = useState("");
  // Estado y datos de estudios subidos
  const [estudios, setEstudios] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);

  // 1. Cargar solicitudes del paciente al montar/combo change
  useEffect(() => {
    if (!pacienteId) return;
    fetch(`/api/solicitudes/paciente/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => {
        setSolicitudes(data);
        if (data.length > 0) setSolicitudId(data[0]._id);
      })
      .catch(() => setSolicitudes([]));
  }, [pacienteId]);

  // 2. Cargar estudios cuando cambia la solicitud seleccionada
  useEffect(() => {
    if (!solicitudId) {
      setEstudios([]);
      return;
    }
    setCargandoEstudios(true);
    fetch(`/api/estudios/solicitud/${solicitudId}`)
      .then((res) => res.json())
      .then((data) => setEstudios(data))
      .catch(() => setEstudios([]))
      .finally(() => setCargandoEstudios(false));
  }, [solicitudId]);

  // 3. Manejar subida de estudio
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !solicitudId) return;
    setSubiendo(true);
    setErrorSubir("");
    const formData = new FormData();
    formData.append("solicitudId", solicitudId);
    formData.append("archivo", archivo);

    try {
      const res = await fetch("/api/estudios", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al subir el estudio");
      }
      setArchivo(null);
      // Refrescar lista de estudios
      const estudiosRes = await fetch(`/api/estudios/solicitud/${solicitudId}`);
      const estudiosData = await estudiosRes.json();
      setEstudios(estudiosData);
    } catch (err) {
      setErrorSubir(err.message || "Error al subir el estudio");
    }
    setSubiendo(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2>Subir estudio de laboratorio</h2>

      {/* Selector de solicitud */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Seleccionar solicitud:&nbsp;
          <select
            value={solicitudId}
            onChange={(e) => setSolicitudId(e.target.value)}
            style={{ minWidth: 250 }}
          >
            {solicitudes.length === 0 ? (
              <option value=''>No hay solicitudes</option>
            ) : (
              solicitudes.map((s) => (
                <option key={s._id} value={s._id}>
                  {`${new Date(
                    s.fechaSolicitud
                  ).toLocaleDateString()} - ${s.analisis.join(", ")}` +
                    (s.descripcion ? ` (${s.descripcion})` : "")}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {/* Formulario de subida */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
          type='file'
          accept='application/pdf,image/*'
          onChange={(e) => setArchivo(e.target.files[0])}
          required
          disabled={!solicitudId}
        />
        <button
          type='submit'
          disabled={subiendo || !archivo || !solicitudId}
          style={{ marginLeft: 10 }}
        >
          {subiendo ? "Subiendo..." : "Subir estudio"}
        </button>
        {errorSubir && (
          <div style={{ color: "red", marginTop: 6 }}>{errorSubir}</div>
        )}
      </form>

      {/* Tabla de estudios subidos */}
      <div>
        <h3>Estudios subidos para la solicitud</h3>
        {cargandoEstudios ? (
          <div>Cargando estudios...</div>
        ) : estudios.length === 0 ? (
          <div>No hay estudios para esta solicitud.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}
                >
                  Archivo
                </th>
                <th
                  style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}
                >
                  Fecha de subida
                </th>
              </tr>
            </thead>
            <tbody>
              {estudios.map((est) => (
                <tr key={est._id}>
                  <td>
                    <a
                      href={est.archivoUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {est.nombreArchivo}
                    </a>
                  </td>
                  <td>
                    {est.fechaSubida
                      ? new Date(est.fechaSubida).toLocaleString("es-AR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubirEstudioAnalisis;
