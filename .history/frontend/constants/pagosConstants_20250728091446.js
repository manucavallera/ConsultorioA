// constants/pagosConstants.js

// 📋 ESTADO INICIAL DEL FORMULARIO
export const ESTADO_INICIAL_FORM = {
  citaId: "",
  monto: "",
  metodoPago: "",
  estado: "Pendiente",
  fechaPago: new Date().toISOString().split("T")[0],
  fechaVencimiento: "",
  observaciones: "",
  tipoTratamiento: "Sesion Individual",
  // Campos adicionales para diferentes métodos
  mercadoPago: {
    linkPago: "",
    preferenceId: "",
  },
  transferencia: {
    numeroTransferencia: "",
    banco: "",
    fechaTransferencia: "",
  },
  efectivo: {
    montoRecibido: "",
    vuelto: "",
  },
};

// 💳 MÉTODOS DE PAGO DISPONIBLES
export const METODOS_PAGO = ["Efectivo", "Transferencia", "Mercado Pago"];

// 📊 ESTADOS DE PAGO DISPONIBLES
export const ESTADOS_PAGO = ["Pendiente", "Pagado", "Parcial", "Vencido"];

// 🔄 TIPOS DE TRATAMIENTO
export const TIPOS_TRATAMIENTO = ["Sesion Individual", "Quincenal", "Mensual"];

// 🎨 CONFIGURACIÓN DE COLORES POR ESTADO
export const COLORES_ESTADO = {
  Pendiente: {
    bg: "from-orange-50 to-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    shadow: "shadow-orange-100",
  },
  Pagado: {
    bg: "from-green-50 to-green-100",
    text: "text-green-800",
    border: "border-green-200",
    shadow: "shadow-green-100",
  },
  Parcial: {
    bg: "from-blue-50 to-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    shadow: "shadow-blue-100",
  },
  Vencido: {
    bg: "from-red-50 to-red-100",
    text: "text-red-800",
    border: "border-red-200",
    shadow: "shadow-red-100",
  },
};

// 🎨 CONFIGURACIÓN DE COLORES POR MÉTODO DE PAGO
export const COLORES_METODO = {
  Efectivo: {
    bg: "bg-green-500",
    bgLight: "bg-green-100",
    text: "text-green-700",
    hover: "hover:bg-green-200",
  },
  "Mercado Pago": {
    bg: "bg-blue-500",
    bgLight: "bg-blue-100",
    text: "text-blue-700",
    hover: "hover:bg-blue-200",
  },
  Transferencia: {
    bg: "bg-purple-500",
    bgLight: "bg-purple-100",
    text: "text-purple-700",
    hover: "hover:bg-purple-200",
  },
};

// 🔤 ICONOS POR MÉTODO DE PAGO
export const ICONOS_METODO = {
  Efectivo: "💵",
  "Mercado Pago": "🔵",
  Transferencia: "🏦",
};

// 🔤 ICONOS POR ESTADO
export const ICONOS_ESTADO = {
  Pendiente: "⏳",
  Pagado: "✅",
  Parcial: "🔵",
  Vencido: "⚠️",
};

// 🔤 ICONOS POR TIPO DE TRATAMIENTO
export const ICONOS_TRATAMIENTO = {
  "Sesion Individual": "📋",
  Quincenal: "📅",
  Mensual: "🔄",
};

// ⚙️ CONFIGURACIÓN DE TRATAMIENTOS
export const CONFIGURACION_TRATAMIENTOS = {
  "Sesion Individual": {
    sesiones: 1,
    frecuenciaAlertas: "semanal",
    descripcion: "Una sola sesión",
  },
  Quincenal: {
    sesiones: 2,
    frecuenciaAlertas: "semanal",
    descripcion: "2 sesiones cada 15 días",
  },
  Mensual: {
    sesiones: 4,
    frecuenciaAlertas: "semanal",
    descripcion: "4 sesiones por mes",
  },
};

// 🚨 TIPOS DE ALERTAS
export const TIPOS_ALERTAS = [
  "Pago Vencido",
  "Sesion Programada",
  "Tratamiento Finalizado",
  "Recordatorio Pago",
  "Seguimiento Pendiente",
];

// 📱 MÉTODOS DE COMUNICACIÓN
export const METODOS_COMUNICACION = ["WhatsApp", "Email", "SMS"];

// 🏦 BANCOS POPULARES (para transferencias)
export const BANCOS_POPULARES = [
  "Banco Nación",
  "Banco Provincia",
  "Banco Ciudad",
  "Banco Galicia",
  "Banco Santander",
  "Banco Macro",
  "BBVA",
  "Banco Patagonia",
  "Banco Supervielle",
  "Banco Credicoop",
  "Otro",
];

// 💰 RANGOS DE MONTOS (para filtros y validaciones)
export const RANGOS_MONTOS = {
  MIN: 0,
  MAX: 999999999,
  STEP: 0.01,
  CURRENCY: "ARS",
};

// 📅 CONFIGURACIÓN DE FECHAS
export const CONFIGURACION_FECHAS = {
  FORMATO_FECHA: "es-AR",
  FORMATO_FECHA_COMPLETA: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  FORMATO_FECHA_CORTA: {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  },
};

// 🔧 CONFIGURACIÓN DE VALIDACIONES
export const VALIDACIONES = {
  MONTO: {
    required: true,
    min: 0,
    message: "El monto debe ser mayor a 0",
  },
  METODO_PAGO: {
    required: true,
    options: METODOS_PAGO,
    message: "Selecciona un método de pago válido",
  },
  CITA_ID: {
    required: true,
    message: "Selecciona una cita",
  },
  FECHA_PAGO: {
    required: true,
    message: "La fecha de pago es obligatoria",
  },
  TELEFONO: {
    pattern: /^(\+54|0)?[0-9]{10,11}$/,
    message: "Formato de teléfono inválido",
  },
};

// 📊 CONFIGURACIÓN PARA ESTADÍSTICAS
export const CONFIGURACION_ESTADISTICAS = {
  COLORES_GRAFICOS: [
    "#10B981", // green-500
    "#3B82F6", // blue-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#EF4444", // red-500
    "#06B6D4", // cyan-500
  ],
  FORMATO_MONEDA: {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

// 📱 PLANTILLAS DE WHATSAPP
export const PLANTILLAS_WHATSAPP = {
  RECORDATORIO_PAGO: {
    titulo: "Recordatorio de Pago",
    plantilla: `Hola {paciente}! 👋

💰 *Recordatorio de Pago*
━━━━━━━━━━━━━━━━━━━━━
📅 *Cita:* {fecha}
🕐 *Hora:* {hora}
🩺 *Consulta:* {tipoConsulta}
💵 *Monto:* {monto}
📋 *Estado:* {estado}

{informacionPago}

¡Gracias por confiar en nosotros! 🙏`,
  },

  CONFIRMACION_PAGO: {
    titulo: "Confirmación de Pago",
    plantilla: `¡Hola {paciente}! ✅

💚 *Pago Confirmado*
━━━━━━━━━━━━━━━━━━━━━
📅 *Fecha:* {fechaPago}
💵 *Monto:* {monto}
💳 *Método:* {metodoPago}
🧾 *Comprobante:* {numeroFactura}

¡Gracias por tu pago! 🙏
Nos vemos en tu próxima cita.`,
  },

  TRATAMIENTO_COMPLETADO: {
    titulo: "Tratamiento Completado",
    plantilla: `¡Felicitaciones {paciente}! 🎉

✨ *Tratamiento Completado*
━━━━━━━━━━━━━━━━━━━━━
🔄 *Tipo:* {tipoTratamiento}
📊 *Sesiones:* {sesionesCompletadas}/{sesionesTotales}
💯 *Estado:* Finalizado

¡Excelente progreso! 👏
¿Te gustaría agendar un seguimiento?`,
  },
};

// 🔐 CONFIGURACIÓN DE SEGURIDAD
export const CONFIGURACION_SEGURIDAD = {
  MAX_INTENTOS_WHATSAPP: 3,
  TIMEOUT_REQUESTS: 30000, // 30 segundos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB para comprobantes
  ALLOWED_FILE_TYPES: ["image/jpeg", "image/png", "application/pdf"],
};

// 🌐 CONFIGURACIÓN DE API
export const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    PAGOS: "/pagos",
    CITAS: "/citas",
    PACIENTES: "/pacientes",
    ESTADISTICAS: "/pagos/estadisticas/resumen",
    ALERTAS: "/pagos/alertas/pendientes",
    BUSCAR: "/pagos/buscar/termino",
    MERCADO_PAGO: "/pagos/{id}/mercado-pago",
    TRANSFERENCIA: "/pagos/{id}/transferencia",
    EFECTIVO: "/pagos/{id}/efectivo",
    WHATSAPP: "/pagos/{id}/whatsapp",
  },
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// 🎭 MENSAJES DE USUARIO
export const MENSAJES = {
  EXITO: {
    PAGO_CREADO: "Pago registrado exitosamente",
    PAGO_ACTUALIZADO: "Pago actualizado exitosamente",
    PAGO_ELIMINADO: "Pago eliminado exitosamente",
    WHATSAPP_ENVIADO: "Mensaje de WhatsApp enviado",
    TRANSFERENCIA_VERIFICADA: "Transferencia verificada exitosamente",
    MERCADO_PAGO_PROCESADO: "Pago con Mercado Pago procesado",
  },
  ERROR: {
    PAGO_NO_CREADO: "Error al crear el pago",
    PAGO_NO_ACTUALIZADO: "Error al actualizar el pago",
    PAGO_NO_ELIMINADO: "Error al eliminar el pago",
    DATOS_NO_CARGADOS: "Error al cargar los datos",
    WHATSAPP_NO_ENVIADO: "Error al enviar WhatsApp",
    FORMULARIO_INVALIDO: "Por favor completa todos los campos requeridos",
  },
  CONFIRMACION: {
    ELIMINAR_PAGO: "¿Estás seguro de eliminar este pago?",
    CAMBIAR_ESTADO: "¿Confirmas el cambio de estado?",
    ENVIAR_WHATSAPP: "¿Enviar mensaje por WhatsApp?",
  },
};

// 🔄 CONFIGURACIÓN DEFAULT PARA NUEVOS PAGOS
export const DEFAULTS = {
  ESTADO: "Pendiente",
  TIPO_TRATAMIENTO: "Sesion Individual",
  METODO_COMUNICACION: "WhatsApp",
  DIAS_VENCIMIENTO: 30,
  HORA_RECORDATORIO: "10:00",
};

export default {
  ESTADO_INICIAL_FORM,
  METODOS_PAGO,
  ESTADOS_PAGO,
  TIPOS_TRATAMIENTO,
  COLORES_ESTADO,
  COLORES_METODO,
  ICONOS_METODO,
  ICONOS_ESTADO,
  ICONOS_TRATAMIENTO,
  CONFIGURACION_TRATAMIENTOS,
  TIPOS_ALERTAS,
  METODOS_COMUNICACION,
  BANCOS_POPULARES,
  RANGOS_MONTOS,
  CONFIGURACION_FECHAS,
  VALIDACIONES,
  CONFIGURACION_ESTADISTICAS,
  PLANTILLAS_WHATSAPP,
  CONFIGURACION_SEGURIDAD,
  API_CONFIG,
  MENSAJES,
  DEFAULTS,
};
