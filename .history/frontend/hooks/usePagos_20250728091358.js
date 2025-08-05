// hooks/usePagos.js
import { useState, useEffect } from "react";

export const usePagos = () => {
  const [pagos, setPagos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const API_URL = "http://localhost:5000";

  // 📊 CARGAR DATOS PRINCIPALES
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [pagosRes, estadisticasRes] = await Promise.all([
        fetch(`${API_URL}/pagos`),
        fetch(`${API_URL}/pagos/estadisticas/resumen`),
      ]);

      if (!pagosRes.ok || !estadisticasRes.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const pagosData = await pagosRes.json();
      const estadisticasData = await estadisticasRes.json();

      setPagos(pagosData);
      setEstadisticas(estadisticasData);
      setError(""); // Limpiar errores previos
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos de pagos");
    } finally {
      setCargando(false);
    }
  };

  // ➕ CREAR NUEVO PAGO
  const crearPago = async (datos) => {
    try {
      const res = await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al crear pago");
      }

      await cargarDatos();
      mostrarMensaje("Pago creado exitosamente");
      return true;
    } catch (err) {
      console.error("Error al crear pago:", err);
      setError(err.message);
      return false;
    }
  };

  // ✏️ ACTUALIZAR PAGO
  const actualizarPago = async (id, datos) => {
    try {
      const res = await fetch(`${API_URL}/pagos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al actualizar pago");
      }

      await cargarDatos();
      mostrarMensaje("Pago actualizado exitosamente");
      return true;
    } catch (err) {
      console.error("Error al actualizar pago:", err);
      setError(err.message);
      return false;
    }
  };

  // 🗑️ ELIMINAR PAGO
  const eliminarPago = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;

    try {
      const res = await fetch(`${API_URL}/pagos/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.mensaje || "Error al eliminar pago");
      }

      await cargarDatos();
      mostrarMensaje("Pago eliminado exitosamente");
    } catch (err) {
      console.error("Error al eliminar pago:", err);
      setError(err.message);
    }
  };

  // 💳 PROCESAR PAGO CON MERCADO PAGO
  const procesarMercadoPago = async (pagoId, datosMercadoPago) => {
    try {
      const res = await fetch(`${API_URL}/pagos/${pagoId}/mercado-pago`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datosMercadoPago),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.mensaje || "Error al procesar pago con Mercado Pago"
        );
      }

      await cargarDatos();
      mostrarMensaje("Pago con Mercado Pago procesado exitosamente");
      return true;
    } catch (err) {
      console.error("Error al procesar Mercado Pago:", err);
      setError(err.message);
      return false;
    }
  };

  // 🏦 VERIFICAR TRANSFERENCIA
  const verificarTransferencia = async (pagoId, datosTransferencia) => {
    try {
      const res = await fetch(`${API_URL}/pagos/${pagoId}/transferencia`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datosTransferencia),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.mensaje || "Error al verificar transferencia"
        );
      }

      await cargarDatos();
      mostrarMensaje("Transferencia verificada exitosamente");
      return true;
    } catch (err) {
      console.error("Error al verificar transferencia:", err);
      setError(err.message);
      return false;
    }
  };

  // 💵 REGISTRAR PAGO EN EFECTIVO
  const registrarEfectivo = async (pagoId, datosEfectivo) => {
    try {
      const res = await fetch(`${API_URL}/pagos/${pagoId}/efectivo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(datosEfectivo),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.mensaje || "Error al registrar pago en efectivo"
        );
      }

      await cargarDatos();
      mostrarMensaje("Pago en efectivo registrado exitosamente");
      return true;
    } catch (err) {
      console.error("Error al registrar efectivo:", err);
      setError(err.message);
      return false;
    }
  };

  // 📤 ENVIAR WHATSAPP
  const enviarWhatsApp = (pago) => {
    try {
      const cita = pago.citaId;
      const paciente = cita.pacienteId;

      // Formatear fecha
      const fechaCita = new Date(cita.fecha).toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Formatear monto
      const montoFormateado = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(pago.monto);

      // Construir mensaje según método de pago
      let mensaje = `Hola ${paciente.nombre}! 👋

💰 *Recordatorio de Pago*
━━━━━━━━━━━━━━━━━━━━━
📅 *Cita:* ${fechaCita}
🕐 *Hora:* ${cita.hora}
🩺 *Consulta:* ${cita.tipoConsulta}
💵 *Monto:* ${montoFormateado}
📋 *Estado:* ${pago.estado}`;

      // Agregar información específica según método de pago
      if (pago.metodoPago === "Mercado Pago") {
        mensaje += `

🔵 *Pagar con Mercado Pago:*
${pago.mercadoPago?.linkPago || "[Link de pago por generar]"}

💡 *¿Cómo pagar?*
1. Hace click en el link
2. Elegí tu método preferido
3. ¡Listo! Te confirmamos automáticamente`;
      } else if (pago.metodoPago === "Transferencia") {
        mensaje += `

🏦 *Datos para transferencia:*
• *CBU:* 1234567890123456789012
• *Alias:* MEDICO.PAGO
• *Titular:* Dr. [Nombre]
• *CUIL:* 12-34567890-1

📸 *Importante:* Envianos el comprobante por aquí para confirmar el pago`;
      } else if (pago.metodoPago === "Efectivo") {
        mensaje += `

💵 *Pago en efectivo:*
Se puede abonar el día de la consulta en el consultorio.

📍 *Ubicación:* [Dirección del consultorio]`;
      }

      // Agregar información de tratamiento si aplica
      if (
        pago.tipoTratamiento !== "Sesion Individual" &&
        pago.planTratamiento
      ) {
        const sesionesRestantes =
          (pago.planTratamiento.sesionesTotales || 0) -
          (pago.planTratamiento.sesionesCompletadas || 0);
        mensaje += `

🔄 *Tu tratamiento ${pago.tipoTratamiento}:*
• Sesiones completadas: ${pago.planTratamiento.sesionesCompletadas || 0}
• Sesiones restantes: ${sesionesRestantes}`;
      }

      mensaje += `

¡Gracias por confiar en nosotros! 🙏
Para consultas, respondé este mensaje.`;

      // Abrir WhatsApp
      const telefono = paciente.telefono?.replace(/\D/g, "") || ""; // Limpiar formato
      const url = `https://wa.me/54${telefono}?text=${encodeURIComponent(
        mensaje
      )}`;
      window.open(url, "_blank");

      mostrarMensaje(`Mensaje de WhatsApp enviado a ${paciente.nombre}`);
    } catch (err) {
      console.error("Error al enviar WhatsApp:", err);
      setError("Error al generar mensaje de WhatsApp");
    }
  };

  // 🔍 BUSCAR PAGOS
  const buscarPagos = async (termino) => {
    try {
      const res = await fetch(
        `${API_URL}/pagos/buscar/termino?q=${encodeURIComponent(termino)}`
      );

      if (!res.ok) {
        throw new Error("Error en la búsqueda");
      }

      const resultados = await res.json();
      return resultados;
    } catch (err) {
      console.error("Error al buscar pagos:", err);
      setError("Error al realizar la búsqueda");
      return [];
    }
  };

  // 📋 OBTENER PAGOS POR PACIENTE
  const obtenerPagosPorPaciente = async (
    pacienteId,
    incluirCompletos = false
  ) => {
    try {
      const url = `${API_URL}/pagos/paciente/${pacienteId}${
        incluirCompletos ? "?incluirCompletos=true" : ""
      }`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Error al obtener pagos del paciente");
      }

      const pagosData = await res.json();
      return pagosData;
    } catch (err) {
      console.error("Error al obtener pagos por paciente:", err);
      setError("Error al obtener pagos del paciente");
      return [];
    }
  };

  // 🚨 OBTENER ALERTAS PENDIENTES
  const obtenerAlertasPendientes = async () => {
    try {
      const res = await fetch(`${API_URL}/pagos/alertas/pendientes`);

      if (!res.ok) {
        throw new Error("Error al obtener alertas");
      }

      const alertas = await res.json();
      return alertas;
    } catch (err) {
      console.error("Error al obtener alertas:", err);
      setError("Error al obtener alertas pendientes");
      return [];
    }
  };

  // 🔧 FUNCIONES AUXILIARES
  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const limpiarError = () => {
    setError("");
  };

  const limpiarMensaje = () => {
    setMensaje("");
  };

  // 🔄 CARGAR DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    cargarDatos();
  }, []);

  // 📤 RETORNAR TODAS LAS FUNCIONES Y ESTADOS
  return {
    // Estados
    pagos,
    estadisticas,
    cargando,
    error,
    mensaje,

    // Funciones CRUD
    cargarDatos,
    crearPago,
    actualizarPago,
    eliminarPago,

    // Funciones específicas por método
    procesarMercadoPago,
    verificarTransferencia,
    registrarEfectivo,

    // Funciones de comunicación
    enviarWhatsApp,

    // Funciones de búsqueda y filtros
    buscarPagos,
    obtenerPagosPorPaciente,
    obtenerAlertasPendientes,

    // Funciones auxiliares
    limpiarError,
    limpiarMensaje,
  };
};
