import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Utilidad para saber el tipo de archivo
const getFileType = (nombreArchivo) => {
  if (!nombreArchivo) return "";
  const ext = nombreArchivo.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext))
    return "image";
  if (ext === "pdf") return "pdf";
  return "other";
};

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

  useEffect(() => {
    if (solicitudIdProp) {
      setSolicitudId(solicitudIdProp);
      setSolicitudes([]);
      return;
    }
    if (!pacienteId) return;
    fetch(`http://localhost:5000/solicitudes/paciente/${pacienteId}`)
      .then((res) => res.json())
      .then((data) => {
        setSolicitudes(data);
        if (data.length > 0) setSolicitudId(data[0]._id);
      })
      .catch(() => setSolicitudes([]));
  }, [pacienteId, solicitudIdProp]);

  useEffect(() => {
    if (!solicitudId) {
      setDetalleSolicitud(null);
      setDetalleError("");
      return;
    }
    setDetalleError("");
    fetch(`http://localhost:5000/solicitudes/${solicitudId}`)
      .then((res) => {
        if (!res.ok) {
          setDetalleError(`Error: código ${res.status}`);
          throw new Error("No se encontró la solicitud");
        }
        return res.json();
      })
      .then((data) => {
        setDetalleSolicitud(data);
        setDetalleError("");
      })
      .catch((err) => {
        setDetalleSolicitud(null);
        setDetalleError("No se pudo cargar el detalle de la solicitud.");
      });
  }, [solicitudId]);

  useEffect(() => {
    if (!solicitudId) {
      setEstudios([]);
      return;
    }
    setCargandoEstudios(true);
    fetch(`http://localhost:5000/estudios/solicitud/${solicitudId}`)
      .then((res) => res.json())
      .then((data) => setEstudios(data))
      .catch(() => setEstudios([]))
      .finally(() => setCargandoEstudios(false));
  }, [solicitudId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !solicitudId) return;
    setSubiendo(true);
    setErrorSubir("");
    const formData = new FormData();
    formData.append("solicitudId", solicitudId);
    formData.append("archivo", archivo);

    try {
      const res = await fetch("http://localhost:5000/estudios", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al subir el estudio");
      }
      setArchivo(null);
      const estudiosRes = await fetch(
        `http://localhost:5000/estudios/solicitud/${solicitudId}`
      );
      const estudiosData = await estudiosRes.json();
      setEstudios(estudiosData);
    } catch (err) {
      setErrorSubir(err.message || "Error al subir el estudio");
    }
    setSubiendo(false);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "32px auto",
        background: "#f7fafc",
        borderRadius: 12,
        boxShadow: "0 2px 12px rgba(0,0,0,0.09)",
        padding: 32,
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <h2
        style={{
          color: "#2563eb",
          marginBottom: 18,
          fontWeight: 600,
          letterSpacing: ".02em",
        }}
      >
        Subir estudio de laboratorio
      </h2>

      {detalleError && (
        <div style={{ color: "red", marginBottom: 8 }}>{detalleError}</div>
      )}

      {detalleSolicitud ? (
        <div
          style={{
            background: "#e0e7ef",
            borderRadius: 8,
            padding: 16,
            marginBottom: 22,
            border: "1px solid #b6c4e2",
            fontSize: 15,
          }}
        >
          <div style={{ marginBottom: 2 }}>
            <b>Descripción:</b>{" "}
            <span>{detalleSolicitud.descripcion || "-"}</span>
          </div>
          <div style={{ marginBottom: 2 }}>
            <b>Fecha:</b>{" "}
            <span>
              {detalleSolicitud.fechaSolicitud
                ? new Date(detalleSolicitud.fechaSolicitud).toLocaleString(
                    "es-AR"
                  )
                : "-"}
            </span>
          </div>
          <div style={{ marginBottom: 2 }}>
            <b>Análisis:</b>{" "}
            <span>
              {Array.isArray(detalleSolicitud.analisis)
                ? detalleSolicitud.analisis.join(", ")
                : detalleSolicitud.analisis}
            </span>
          </div>
          {detalleSolicitud.pacienteId && (
            <div style={{ marginTop: 8 }}>
              <span style={{ color: "#555" }}>
                <b>Paciente:</b> {detalleSolicitud.pacienteId.nombre || ""}{" "}
                {detalleSolicitud.pacienteId.apellido || ""} &nbsp;|&nbsp;
                <b>DNI:</b> {detalleSolicitud.pacienteId.dni || ""}{" "}
                &nbsp;|&nbsp;
                <b>Género:</b> {detalleSolicitud.pacienteId.genero || ""}
              </span>
            </div>
          )}
        </div>
      ) : (
        !detalleError && (
          <div style={{ color: "#888", marginBottom: 12 }}>
            Cargando detalle de la solicitud...
          </div>
        )
      )}

      {!solicitudIdProp && (
        <div style={{ marginBottom: 18 }}>
          <label>
            <span style={{ fontWeight: 500, marginRight: 8 }}>
              Seleccionar solicitud:
            </span>
            <select
              value={solicitudId}
              onChange={(e) => setSolicitudId(e.target.value)}
              style={{
                minWidth: 280,
                height: 32,
                borderRadius: 6,
                border: "1px solid #b6c4e2",
                padding: "0 8px",
              }}
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

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <input
          type='file'
          accept='application/pdf,image/*'
          onChange={(e) => setArchivo(e.target.files[0])}
          required
          disabled={!solicitudId}
          style={{
            fontSize: 15,
            padding: "5px 0",
            borderRadius: 5,
            border: "1px solid #c7d1e6",
            background: "#f5f7fa",
          }}
        />
        <button
          type='submit'
          disabled={subiendo || !archivo || !solicitudId}
          style={{
            marginLeft: 14,
            background: subiendo ? "#a5b4fc" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "7px 18px",
            fontWeight: 500,
            fontSize: 15,
            cursor: subiendo ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {subiendo ? "Subiendo..." : "Subir estudio"}
        </button>
        {errorSubir && (
          <div style={{ color: "red", marginTop: 7, fontSize: 14 }}>
            {errorSubir}
          </div>
        )}
      </form>

      <div>
        <h3 style={{ fontWeight: 600, color: "#334155", marginBottom: 10 }}>
          Estudios subidos para la solicitud
        </h3>
        {cargandoEstudios ? (
          <div style={{ color: "#777" }}>Cargando estudios...</div>
        ) : estudios.length === 0 ? (
          <div style={{ color: "#999", fontStyle: "italic" }}>
            No hay estudios para esta solicitud.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
              borderRadius: 8,
              border: "1px solid #dce5f1",
              boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
              background: "#fff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 500,
                fontSize: 15,
              }}
            >
              <thead>
                <tr style={{ background: "#e6eef8" }}>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2.5px solid #b6c4e2",
                      textAlign: "left",
                    }}
                  >
                    Archivo
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2.5px solid #b6c4e2",
                      textAlign: "center",
                    }}
                  >
                    Vista previa
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      borderBottom: "2.5px solid #b6c4e2",
                      textAlign: "left",
                    }}
                  >
                    Fecha de subida
                  </th>
                </tr>
              </thead>
              <tbody>
                {estudios.map((est, idx) => (
                  <tr
                    key={est._id}
                    style={{
                      background: idx % 2 === 0 ? "#f9fafb" : "#eef2fa",
                    }}
                  >
                    <td style={{ padding: "12px 8px" }}>
                      <a
                        href={est.archivoUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{
                          color: "#2563eb",
                          textDecoration: "underline",
                        }}
                      >
                        {est.nombreArchivo}
                      </a>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {getFileType(est.nombreArchivo) === "image" ? (
                        <a
                          href={est.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <img
                            src={est.archivoUrl}
                            alt={est.nombreArchivo}
                            style={{
                              maxWidth: 70,
                              maxHeight: 70,
                              borderRadius: 6,
                              border: "1px solid #b6c4e2",
                              objectFit: "cover",
                            }}
                          />
                        </a>
                      ) : getFileType(est.nombreArchivo) === "pdf" ? (
                        <a
                          href={est.archivoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{
                            color: "#d97706",
                            fontWeight: 500,
                            fontSize: 15,
                          }}
                        >
                          <span role='img' aria-label='PDF'>
                            📄
                          </span>{" "}
                          Ver PDF
                        </a>
                      ) : (
                        <span style={{ color: "#888" }}>
                          No previsualizable
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {est.fechaSubida
                        ? new Date(est.fechaSubida).toLocaleString("es-AR")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubirEstudioAnalisis;
