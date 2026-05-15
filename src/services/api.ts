import axios from "axios";
import type { CasillaResumen, Evento, ResultadoVerificacion, Stats } from "../types";

/**
 * Servicio API real — apunta al backend de Jared.
 *
 * Mientras el backend no esté listo, usar `./mock.ts` en su lugar.
 * El swap se hace en cada page: cambiar el import de `./mock` por `./api`.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

export const obtenerBitacora = async (clave: string): Promise<Evento[]> => {
  const res = await client.get<Evento[]>(`/casilla/${clave}`);
  return res.data;
};

export const obtenerCasillas = async (): Promise<string[]> => {
  const res = await client.get<string[]>(`/casillas`);
  return res.data;
};

/** Resumen de todas las casillas para el dashboard. */
export const obtenerResumenCasillas = async (): Promise<CasillaResumen[]> => {
  const res = await client.get<CasillaResumen[]>(`/resumen`);
  return res.data;
};

export const obtenerStats = async (): Promise<Stats> => {
  const res = await client.get<Stats>(`/stats`);
  return res.data;
};

export const verificarHash = async (
  clave: string,
  hash: string,
): Promise<ResultadoVerificacion> => {
  const res = await client.post<ResultadoVerificacion>("/verificar", {
    clave,
    hash,
  });
  return res.data;
};
