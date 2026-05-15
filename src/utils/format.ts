/**
 * Formateadores compartidos.
 * Todo en español-MX, sin dependencias externas.
 */

const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" });

/** Convierte un timestamp Unix (segundos) a "hace 12 minutos", "hace 1 hora", etc. */
export const tiempoRelativo = (unixSeconds: number | null, now = Date.now()): string => {
  if (unixSeconds == null) return "—";
  const diffSec = Math.round(unixSeconds - now / 1000);

  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86_400), "day");
};

/** Fecha legible: "15 de mayo, 2026, 14:32". */
export const fechaLarga = (unixSeconds: number): string => {
  return new Date(unixSeconds * 1000).toLocaleString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Acorta una dirección 0xAB...12 con elipsis. */
export const acortarDireccion = (addr: string, head = 6, tail = 4): string => {
  if (!addr || addr.length < head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
};

/** Acorta un hash largo a una versión legible. */
export const acortarHash = (hash: string, head = 10, tail = 6): string => {
  if (!hash || hash.length < head + tail) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
};

/** Timestamp actualizado, ej. "15 May 2026, 14:32 CST". */
export const timestampActual = (): string => {
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hora = ahora.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${fecha}, ${hora}`;
};
