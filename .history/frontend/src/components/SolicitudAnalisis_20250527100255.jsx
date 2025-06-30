import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/solicitudes";

export default function SolicitudAnalisis() {
  const { pacienteId } = useParams();
  const navigate = useNavigate();

  const [descripcion, setDescripcion] = useState("");
  const [analisis, setAnalisis] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);

  useEffect(() => {
    if (!pacienteId) return;
    fetch(`${API_URL}/paciente/${pacienteId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setSolicitudes(data))
      .catch(() => setError("No se pudieron cargar las solicitudes"));
  }, [pacienteId]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setError("");
    const analisisArray = analisis
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
    if (!descripcion || analisisArray.length === 0) {
      setError("Completa todos los campos.");
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pacienteId,
          analisis: analisisArray,
          descripcion,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const nueva = await res.json();
      const resPop = await fetch(`${API_URL}/${nueva._id}`);
      const nuevaPopulada = await resPop.json();
      setSolicitudes([nuevaPopulada, ...solicitudes]);
      setDescripcion("");
      setAnalisis("");
    } catch (err) {
      setError(err.message || "Error al crear solicitud");
    }
  };

  const handleVerDetalle = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("No encontrada");
      const data = await res.json();
      setDetalle(data);
    } catch {
      setError("No se pudo cargar el detalle");
    }
  };

  // === FUNCIÓN EXPORTAR A PDF TODAS LAS SOLICITUDES ===
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Solicitudes de Análisis", 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [["Descripción", "Fecha", "Paciente", "DNI", "Género", "Análisis"]],
      body: solicitudes.map((s) => [
        s.descripcion,
        new Date(s.fechaSolicitud).toLocaleString(),
        s.pacienteId ? `${s.pacienteId.nombre} ${s.pacienteId.apellido}` : "",
        s.pacienteId ? s.pacienteId.dni : "",
        s.pacienteId ? s.pacienteId.genero : "",
        Array.isArray(s.analisis) ? s.analisis.join(", ") : s.analisis,
      ]),
    });

    doc.save("solicitudes_analisis.pdf");
  };

  // === FUNCIÓN EXPORTAR PDF SOLO DEL DETALLE SELECCIONADO ===
  const exportarDetallePDF = () => {
    if (!detalle) return;
    const doc = new jsPDF();
    doc.text("Detalle de Solicitud de Análisis", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Campo", "Valor"]],
      body: [
        ["Descripción", detalle.descripcion],
        ["Fecha", new Date(detalle.fechaSolicitud).toLocaleString()],
        [
          "Paciente",
          detalle.pacienteId
            ? `${detalle.pacienteId.nombre} ${detalle.pacienteId.apellido}`
            : "",
        ],
        ["DNI", detalle.pacienteId ? detalle.pacienteId.dni : ""],
        ["Género", detalle.pacienteId ? detalle.pacienteId.genero : ""],
        [
          "Análisis",
          Array.isArray(detalle.analisis)
            ? detalle.analisis.join(", ")
            : detalle.analisis,
        ],
      ],
    });
    doc.save(
      `solicitud_analisis_${
        detalle.pacienteId ? detalle.pacienteId.dni : "sinDNI"
      }.pdf`
    );
  };

  return (
    <div className='max-w-3xl mx-auto py-10'>
      <h2 className='text-3xl font-bold mb-6 text-center text-blue-700'>
        Solicitudes de Análisis
      </h2>

      <form
        onSubmit={handleCrear}
        className='mb-8 bg-white p-6 rounded-xl shadow-md flex flex-col gap-4'
      >
        <input
          type='text'
          placeholder='Descripción'
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          className='border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
        <input
          type='text'
          placeholder='Análisis (separados por coma)'
          value={analisis}
          onChange={(e) => setAnalisis(e.target.value)}
          required
          className='border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
        <button
          type='submit'
          className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-semibold shadow'
        >
          Crear Solicitud
        </button>
      </form>

      <div className='flex justify-end mb-4'>
        <button
          className='bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow'
          onClick={exportarPDF}
          disabled={solicitudes.length === 0}
        >
          Exportar a PDF
        </button>
      </div>

      {error && (
        <div className='mb-4 text-red-600 bg-red-100 px-4 py-2 rounded'>
          {error}
        </div>
      )}

      <div className='bg-white shadow-lg rounded-xl p-6'>
        <h3 className='text-xl font-semibold mb-4 text-gray-700'>
          Lista de Solicitudes
        </h3>
        {solicitudes.length === 0 ? (
          <p className='text-gray-500 text-center'>
            No hay solicitudes registradas.
          </p>
        ) : (
          <ul className='space-y-4'>
            {solicitudes.map((s) => (
              <li
                key={s._id}
                className='flex flex-col md:flex-row md:items-center justify-between bg-blue-50 rounded-lg p-4 hover:shadow transition-all'
              >
                <div>
                  <b className='text-blue-900'>{s.descripcion}</b>
                  {s.pacienteId && (
                    <span className='block text-sm text-gray-700'>
                      Paciente:{" "}
                      <span className='font-medium'>
                        {s.pacienteId.nombre} {s.pacienteId.apellido}
                      </span>
                      {" · DNI: "}
                      <span className='font-mono'>{s.pacienteId.dni}</span>
                      {" · Género: "}
                      <span>{s.pacienteId.genero}</span>
                    </span>
                  )}
                  <span className='block text-xs text-gray-500'>
                    {new Date(s.fechaSolicitud).toLocaleString()}
                  </span>
                </div>
                <div className='flex flex-col md:flex-row gap-2 mt-2 md:mt-0 md:ml-8'>
                  <button
                    className='bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded shadow'
                    onClick={() => handleVerDetalle(s._id)}
                  >
                    Ver detalle
                  </button>
                  {/* --- BOTÓN SUBIR ESTUDIO --- */}
                  <button
                    className='bg-violet-600 hover:bg-violet-700 text-white py-1 px-4 rounded shadow'
                    onClick={() =>
                      navigate(
                        `/pacientes/${pacienteId}/solicitudes/${s._id}/estudios`
                      )
                    }
                  >
                    Subir estudio
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {detalle && (
        <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40'>
          <div className='bg-white rounded-xl shadow-xl p-8 min-w-[320px] max-w-lg'>
            <h4 className='text-xl font-bold mb-4 text-blue-800'>
              Detalle de Solicitud
            </h4>
            <div className='mb-2'>
              <b>Paciente:</b>{" "}
              {detalle.pacienteId ? (
                <>
                  {detalle.pacienteId.nombre} {detalle.pacienteId.apellido}{" "}
                  <br />
                  <span className='text-gray-500'>DNI:</span>{" "}
                  {detalle.pacienteId.dni} <br />
                  <span className='text-gray-500'>Género:</span>{" "}
                  {detalle.pacienteId.genero}
                </>
              ) : (
                detalle.pacienteId
              )}
            </div>
            <div className='mb-2'>
              <b>Descripción:</b> {detalle.descripcion}
            </div>
            <div className='mb-2'>
              <b>Fecha:</b> {new Date(detalle.fechaSolicitud).toLocaleString()}
            </div>
            <div className='mb-4'>
              <b>Análisis pedidos:</b>{" "}
              {Array.isArray(detalle.analisis)
                ? detalle.analisis.join(", ")
                : detalle.analisis}
            </div>
            <div className='flex gap-2'>
              <button
                className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow'
                onClick={exportarDetallePDF}
              >
                Exportar este análisis a PDF
              </button>
              <button
                className='bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow'
                onClick={() => setDetalle(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
