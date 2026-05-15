import type {
  CasillaResumen,
  EstadoCasilla,
  Evento,
  ResultadoVerificacion,
  Stats,
  TipoEvento,
} from "../types";

/**
 * Servicio mock — mismas firmas que api.ts.
 *
 * Para conectar con el backend real, en cada page cambiar:
 *   import { ... } from "../services/mock";
 * por:
 *   import { ... } from "../services/api";
 *
 * Todas las funciones son async para emular latencia de red y que el
 * comportamiento sea idéntico al de axios.
 */

// ── Helpers ──────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const TIPOS: TipoEvento[] = ["CAPTURA", "TRANSMISION", "VALIDACION", "PUBLICACION"];

/** Genera un hash SHA-256 ficticio con formato hex 64 chars. */
const fakeHash = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  // Repetir y truncar para llegar a 64 caracteres
  return "0x" + (hex.repeat(8)).slice(0, 64);
};

/** Construye N eventos para una casilla. */
const eventosDe = (clave: string, n: number, ahora: number): Evento[] => {
  const hash = fakeHash(clave);
  return Array.from({ length: n }, (_, i) => ({
    casillaClave: clave,
    hashSHA256: hash,
    tipo: i,
    tipoLabel: TIPOS[i],
    timestamp: ahora - (n - i) * 300, // separados ~5min entre etapas
    registrador: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bAfE",
  }));
};

// ── Casillas mockeadas ────────────────────────────────────────────

/**
 * Set de casillas con distintos estados para mostrar variedad.
 * `eventos: 0` = sin registro, 1-3 = en proceso, 4 = completa.
 */
const ahora = Math.floor(Date.now() / 1000);

const seed: Array<{ clave: string; eventos: number; offsetSegundos: number }> = [
  { clave: "CHI-001-0001", eventos: 4, offsetSegundos: 12 * 60 },
  { clave: "CHI-001-0002", eventos: 4, offsetSegundos: 18 * 60 },
  { clave: "CHI-002-0015", eventos: 3, offsetSegundos: 3 * 60 },
  { clave: "CHI-003-0008", eventos: 2, offsetSegundos: 28 * 60 },
  { clave: "DGO-004-0023", eventos: 4, offsetSegundos: 60 * 60 },
  { clave: "CHI-005-0041", eventos: 0, offsetSegundos: 0 },
  { clave: "CHI-001-0009", eventos: 4, offsetSegundos: 2 * 60 * 60 },
  { clave: "CHI-002-0033", eventos: 4, offsetSegundos: 45 * 60 },
  { clave: "DGO-007-0012", eventos: 1, offsetSegundos: 8 * 60 },
  { clave: "CHI-004-0027", eventos: 4, offsetSegundos: 6 * 60 },
  { clave: "CHI-006-0019", eventos: 3, offsetSegundos: 15 * 60 },
  { clave: "DGO-001-0005", eventos: 4, offsetSegundos: 38 * 60 },
];

const BITACORAS: Record<string, Evento[]> = {};
for (const s of seed) {
  if (s.eventos > 0) {
    BITACORAS[s.clave] = eventosDe(s.clave, s.eventos, ahora - s.offsetSegundos);
  } else {
    // Casillas "sin registro" no tienen entrada en bitácora
    BITACORAS[s.clave] = [];
  }
}

// ── Implementación de las funciones ──────────────────────────────

export const obtenerBitacora = async (clave: string): Promise<Evento[]> => {
  await sleep(120);
  return BITACORAS[clave] ?? [];
};

export const obtenerCasillas = async (): Promise<string[]> => {
  await sleep(80);
  return seed.map((s) => s.clave);
};

/**
 * Resumen para el dashboard de Inicio.
 *
 * NOTA para Jared: idealmente el backend expone esto como `GET /resumen`
 * para evitar que el frontend cargue las bitácoras una por una.
 * Cada item: { clave, estado, eventosCount, ultimoTimestamp }.
 */
const derivarEstado = (count: number): EstadoCasilla => {
  if (count === 0) return "sin-registro";
  if (count >= 4) return "completa";
  return "en-proceso";
};

export const obtenerResumenCasillas = async (): Promise<CasillaResumen[]> => {
  await sleep(140);
  return seed.map((s) => {
    const eventos = BITACORAS[s.clave] ?? [];
    return {
      clave: s.clave,
      estado: derivarEstado(eventos.length),
      eventosCount: eventos.length,
      ultimoTimestamp: eventos.length > 0
        ? eventos[eventos.length - 1].timestamp
        : null,
    };
  });
};

export const obtenerStats = async (): Promise<Stats> => {
  await sleep(80);
  return {
    totalCasillas: "1,847",
    totalEventos: "6,213",
    contractAddress: "0xABCD1234567890ABCDEF1234567890ABCDEF1234",
    network: "Sepolia",
    bloqueActual: "6,481,907",
  };
};

export const verificarHash = async (
  clave: string,
  hash: string,
): Promise<ResultadoVerificacion> => {
  await sleep(200);
  const eventos = BITACORAS[clave] ?? [];
  const match = eventos.find((e) => e.hashSHA256.toLowerCase() === hash.toLowerCase());
  if (match) {
    return {
      coincide: true,
      timestamp: new Date(match.timestamp * 1000).toISOString(),
      mensaje: "Este hash coincide con el registro de la casilla.",
    };
  }
  return {
    coincide: false,
    timestamp: null,
    mensaje: "No se encontró ningún registro que coincida con este hash.",
  };
};
