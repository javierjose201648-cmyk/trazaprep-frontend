
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EditionStrip from "../../components/EditionStrip/EditionStrip";
import Footnote from "../../components/Footnote/Footnote";
import SearchBar from "../../components/SearchBar/SearchBar";
import Signature from "../../components/Signature/Signature";
import StatusPill from "../../components/StatusPill/StatusPill";
import Timeline from "../../components/Timeline/Timeline";
import { obtenerBitacora } from "../../services/api";
import type { EstadoCasilla, Evento } from "../../types";
import styles from "./Busqueda.module.css";

type Estado =
  | { kind: "idle" }
  | { kind: "loading"; clave: string }
  | { kind: "found"; eventos: Evento[]; clave: string }
  | { kind: "not-found"; clave: string }
  | { kind: "error"; message: string; clave: string };

const derivarEstado = (count: number): EstadoCasilla => {
  if (count === 0) return "sin-registro";
  if (count >= 4) return "completa";
  return "en-proceso";
};

const SUGERENCIAS = ["CHI-001-0001", "CHI-002-0015", "DGO-004-0023"];

export default function Busqueda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [estado, setEstado] = useState<Estado>({ kind: "idle" });
  const ultimaBusqueda = useRef<string | null>(null);

  const claveURL = searchParams.get("clave") ?? "";

  const buscar = useCallback(
    async (claveRaw: string) => {
      const clave = claveRaw.trim().toUpperCase();
      if (!clave) return;
      ultimaBusqueda.current = clave;
      setEstado({ kind: "loading", clave });

      if (searchParams.get("clave") !== clave) {
        setSearchParams({ clave }, { replace: true });
      }

      try {
        const eventos = await obtenerBitacora(clave);
        if (eventos.length === 0) {
          setEstado({ kind: "not-found", clave });
        } else {
          setEstado({ kind: "found", eventos, clave });
        }
      } catch (err) {
        setEstado({
          kind: "error",
          clave,
          message: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (claveURL && claveURL !== ultimaBusqueda.current) {
      buscar(claveURL);
    }
  }, [claveURL, buscar]);

  const statusCasilla: EstadoCasilla | null = useMemo(() => {
    if (estado.kind !== "found") return null;
    return derivarEstado(estado.eventos.length);
  }, [estado]);

  const showIntro = estado.kind === "idle";

  return (
    <>
      <EditionStrip label="Búsqueda por casilla" />

      {showIntro && (
        <section className={styles.intro}>
          <h1 className={styles.headline}>
            Recorrido de un acta, <em>de la casilla al PREP</em>.
          </h1>
          <p className={styles.lead}>
            Ingresa la clave de una casilla para ver cuándo fue capturada,
            transmitida, validada y publicada. Cada paso tiene su sello de
            tiempo.
          </p>
        </section>
      )}

      <SearchBar
        defaultValue={claveURL}
        onSearch={buscar}
        placeholder="Ej. CHI-001-0001"
        sugerencias={SUGERENCIAS}
      />

      {estado.kind === "loading" && (
        <div className={styles.statusMessage}>
          <span className={styles.loadingDot} aria-hidden="true" />
          Consultando la bitácora pública para{" "}
          <span className={styles.mono}>{estado.clave}</span>…
        </div>
      )}

      {estado.kind === "not-found" && (
        <div className={styles.notFound}>
          <div className={styles.notFoundMarker} aria-hidden="true">
            ×
          </div>
          <h2 className={styles.notFoundTitle}>
            No se encontró ningún registro para esta clave.
          </h2>
          <p className={styles.notFoundText}>
            La casilla{" "}
            <span className={styles.mono}>{estado.clave}</span> no aparece en
            la bitácora pública. Esto puede significar que aún no ha sido
            capturada, o que la clave fue mal escrita.
          </p>
        </div>
      )}

      {estado.kind === "error" && (
        <div className={styles.errorMessage}>
          Error al consultar la bitácora: {estado.message}
        </div>
      )}

      {estado.kind === "found" && statusCasilla && (
        <>
          <header className={styles.resultHeader}>
            <div className={styles.resultInfo}>
              <div className={styles.resultEyebrow}>Casilla</div>
              <h2 className={styles.claveBig}>{estado.clave}</h2>
              <p className={styles.resumen}>
                {Math.min(estado.eventos.length, 4)} de 4 pasos registrados
              </p>
            </div>
            <div className={styles.resultStatus}>
              <StatusPill estado={statusCasilla} />
            </div>
          </header>

          <Timeline eventos={estado.eventos} />
        </>
      )}

      <Footnote>
        Los datos mostrados aquí son metadatos técnicos del PREP, no resultados
        oficiales. La integridad del proceso electoral es responsabilidad del
        Instituto Estatal Electoral.
      </Footnote>

      <Signature />
    </>
  );
}

