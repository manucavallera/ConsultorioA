import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Props: pacienteId (string, requerido), solicitudId (opcional)
const SubirEstudioAnalisis = (props) => {
  const params = useParams();
  const pacienteId = props.pacienteId || params.pacienteId;
  const solicitudIdProp = props.solicitudId || params.solicitudId;

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudId, setSolicitudId] = useState(solicitudIdProp || "");
  const [detalleSolicitud, setDetalleSolicitud] = useState(null);
  const [detalleError, setDetalleError] = useState("");

  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubir, setErrorSubir] = useState("");
  const [estudios, setEstudios] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);

  // LOG PARA DEPURAR
  useEffect(() => {
    console.log(
      "PACIENTE",
      pacienteId,
      "SOLICITUD",
      solicitudIdProp,
      solicitudId
    );
  }, [pacienteId, solicitudIdProp, solicitudId]);

  // Si NO viene un solicitudId fijo, cargar solicitudes del paciente
  useEffect(() => {
    if (solicitudIdProp) {
      setSolicitudId(solicitudIdProp);
      setSolicitudes([]); // No hace falta cargar lista
      return;
    }
    if (!pacienteId) return;
    fetch(`/api/solicitudes/paciente/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => {
        setSolicitudes(data);
        if (data.length > 0) setSolicitudId(data[0]._id);
      })
      .catch(() => setSolicitudes([]));
  }, [pacienteId, solicitudIdProp]);

  // Cargar el detalle de la solicitud seleccionada
  useEffect(() => {
    if (!solicitudId) {
      setDetalleSolicitud(null);
      setDetalleError("");
      return;
    }
    setDetalleError("");
    console.log("Buscando detalle para solicitud:", solicitudId);
    fetch(`/api/solicitudes/${solicitudId}`)
      .then((res) => {
        if (!res.ok) {
          setDetalleError(`Error: código ${res.status}`);
          throw new Error("No se encontró la solicitud");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Detalle recibido:", data);
        setDetalleSolicitud(data);
        setDetalleError("");
      })
      .catch((err) => {
        setDetalleSolicitud(null);
        setDetalleError("No se pudo cargar el detalle de la solicitud.");
        console.error("Error cargando detalle:", err);
      });
  }, [solicitudId]);

  // Cargar estudios cuando cambia la solicitud seleccionada
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

  // Manejar subida de estudio
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

      {/* Detalle de la solicitud seleccionada */}
      {detalleError && (
        <div style={{ color: "red", marginBottom: 8 }}>{detalleError}</div>
      )}

      {detalleSolicitud ? (
        <div
          style={{
            background: "#f5f7fa",
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
            border: "1px solid #dbeafe",
          }}
        >
          <b>Descripción:</b> {detalleSolicitud.descripcion || "-"}
          <br />
          <b>Fecha:</b>{" "}
          {detalleSolicitud.fechaSolicitud
            ? new Date(detalleSolicitud.fechaSolicitud).toLocaleString("es-AR")
            : "-"}
          <br />
          <b>Análisis:</b>{" "}
          {Array.isArray(detalleSolicitud.analisis)
            ? detalleSolicitud.analisis.join(", ")
            : detalleSolicitud.analisis}
          {detalleSolicitud.pacienteId && (
            <>
              <br />
              <b>Paciente:</b> {detalleSolicitud.pacienteId.nombre || ""}{" "}
              {detalleSolicitud.pacienteId.apellido || ""} <br />
              <b>DNI:</b> {detalleSolicitud.pacienteId.dni || ""} <br />
              <b>Género:</b> {detalleSolicitud.pacienteId.genero || ""}
            </>
          )}
        </div>
      ) : (
        !detalleError && (
          <div style={{ color: "gray", marginBottom: 12 }}>
            Cargando detalle de la solicitud...
          </div>
        )
      )}

      {/* Selector de solicitud, solo si NO viene por props/url */}
      {!solicitudIdProp && (
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
      )}

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
