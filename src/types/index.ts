/**
 * Tipos compartidos del proyecto TrazaPREP.
 *
 * Estos tipos reflejan el contrato Solidity y el formato esperado del
 * backend de Jared. Si el backend cambia algo, este archivo es la
 * fuente de verdad y el resto del frontend se ajusta automáticamente
 * gracias a TypeScript.
 */

/** Los 4 tipos de evento que registra el contrato. */
export type TipoEvento =
  | "CAPTURA"
  | "TRANSMISION"
  | "VALIDACION"
  | "PUBLICACION";

/** Un evento dentro de la bitácora de una casilla. */
export interface Evento {
  casillaClave: string;
  hashSHA256: string;
  /** Índice numérico del enum (0..3) */
  tipo: number;
  tipoLabel: TipoEvento;
  /** Unix timestamp en segundos */
  timestamp: number;
  registrador: string;
}

/** Resultado del verificador de hash. */
export interface ResultadoVerificacion {
  coincide: boolean;
  timestamp: string | null;
  mensaje: string;
}

/**
 * Stats generales del sistema.
 *
 * NOTA para Jared: la vista de Inicio usa `totalEventos` y `bloqueActual`.
 * `totalEventos` puede calcularse en el backend cacheando los logs del
 * evento `ActaRegistrada`. `bloqueActual` viene del provider (web3.eth.blockNumber).
 */
export interface Stats {
  totalCasillas: string;
  totalEventos: string;
  contractAddress: string;
  network: string;
  bloqueActual: string;
}

/** Estado derivado de una casilla según cuántos eventos tiene registrados. */
export type EstadoCasilla = "completa" | "en-proceso" | "sin-registro";

/** Resumen de una casilla para la lista del Inicio. */
export interface CasillaResumen {
  clave: string;
  estado: EstadoCasilla;
  eventosCount: number;
  ultimoTimestamp: number | null;
}
