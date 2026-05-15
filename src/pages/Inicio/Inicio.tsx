import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditionStrip from "../../components/EditionStrip/EditionStrip";
import Footnote from "../../components/Footnote/Footnote";
import Signature from "../../components/Signature/Signature";
import StatusPill from "../../components/StatusPill/StatusPill";
import {
  obtenerResumenCasillas,
  obtenerStats,
} from "../../services/api";
import type { CasillaResumen, Stats } from "../../types";
import { acortarDireccion, tiempoRelativo } from "../../utils/format";
import styles from "./Inicio.module.css";

type Filtro = "todas" | "completa" | "en-proceso";

export default function Inicio() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [resumen, setResumen] = useState<CasillaResumen[]>([]);
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([obtenerStats(), obtenerResumenCasillas()])
      .then(([s, r]) => {
        if (cancelled) return;
        setStats(s);
        setResumen(r);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Inicio] error cargando datos:", err);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtradas = useMemo(() => {
    if (filtro === "todas") return resumen;
    return resumen.filter((c) => c.estado === filtro);
  }, [resumen, filtro]);

  const cobertura = useMemo(() => {
    if (resumen.length === 0) return 0;
    const completas = resumen.filter((c) => c.estado === "completa").length;
    return Math.round((completas / resumen.length) * 100);
  }, [resumen]);

  const irACasilla = (clave: string) => {
    navigate(`/busqueda?clave=${encodeURIComponent(clave)}`);
  };

  return (
    <>
      <EditionStrip />

      <section className={styles.intro}>
        <h1 className={styles.headline}>
          Cada acta deja una huella <em>inalterable</em>.
        </h1>
        <p className={styles.lead}>
          Cuando un acta del PREP se captura en una casilla, su huella digital
          queda registrada en una bitácora pública. Lo mismo ocurre al
          transmitirla, validarla y publicarla. Aquí cualquier persona puede
          consultar el recorrido completo de un acta y verificar que ningún paso
          fue omitido ni alterado.
        </p>
      </section>

      <section className={styles.stats}>
        <Stat
          label="Casillas en la red"
          value={stats?.totalCasillas ?? "—"}
          sub="Registradas en la jornada actual"
          loading={loading}
        />
        <Stat
          label="Cobertura de bitácora"
          value={loading ? "—" : `${cobertura}`}
          unit="%"
          sub="Casillas con los 4 eventos completos"
          loading={loading}
        />
      </section>

      <div className={styles.metaBand}>
        <span>
          <strong>Red</strong> · {stats?.network ?? "—"}
        </span>
        <span>
          <strong>Contrato</strong> ·{" "}
          {stats ? acortarDireccion(stats.contractAddress) : "—"}
        </span>
        <span>
          <strong>Bloque</strong> · {stats?.bloqueActual ?? "—"}
        </span>
      </div>

      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Casillas registradas</h2>
        <div className={styles.filter} role="tablist" aria-label="Filtrar casillas">
          <FilterButton
            label="Todas"
            value="todas"
            current={filtro}
            onClick={setFiltro}
            count={resumen.length}
          />
          <FilterButton
            label="Completas"
            value="completa"
            current={filtro}
            onClick={setFiltro}
            count={resumen.filter((c) => c.estado === "completa").length}
          />
          <FilterButton
            label="En proceso"
            value="en-proceso"
            current={filtro}
            onClick={setFiltro}
            count={resumen.filter((c) => c.estado === "en-proceso").length}
          />
        </div>
      </div>

      <table className={styles.casillas}>
        <thead>
          <tr>
            <th style={{ width: "28%" }}>Clave</th>
            <th style={{ width: "22%" }}>Estado</th>
            <th style={{ width: "20%" }}>Eventos</th>
            <th style={{ width: "30%" }}>Última actualización</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className={styles.emptyState}>
                Cargando bitácora…
              </td>
            </tr>
          )}
          {!loading && filtradas.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.emptyState}>
                No hay casillas con este estado.
              </td>
            </tr>
          )}
          {!loading &&
            filtradas.map((c) => (
              <tr
                key={c.clave}
                onClick={() => irACasilla(c.clave)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") irACasilla(c.clave);
                }}
              >
                <td>
                  <span className={styles.clave}>{c.clave}</span>
                </td>
                <td>
                  <StatusPill estado={c.estado} />
                </td>
                <td>
                  <span className={styles.eventosCount}>
  {Math.min(c.eventosCount, 4)}{" "}
  <span className={styles.eventosTotal}>/ 4</span>
</span>
                </td>
                <td className={styles.ultimaActualizacion}>
                  {c.ultimoTimestamp != null
                    ? tiempoRelativo(c.ultimoTimestamp)
                    : "—"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Footnote>
        Esta es una bitácora de integridad técnica, no un conteo de votos.
        TrazaPREP no almacena nombres, direcciones ni el contenido del acta — solo
        huellas digitales y sellos de tiempo. Los resultados oficiales del
        proceso electoral son responsabilidad del Instituto Estatal Electoral.
      </Footnote>

      <Signature />
    </>
  );
}

/* ── Subcomponentes ───────────────────────────────── */

interface StatProps {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  loading: boolean;
}

function Stat({ label, value, unit, sub, loading }: StatProps) {
  return (
    <div className={styles.stat}>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${loading ? styles.skeleton : ""}`}>
        {value}
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </div>
      <div className={styles.statSub}>{sub}</div>
    </div>
  );
}

interface FilterButtonProps {
  label: string;
  value: Filtro;
  current: Filtro;
  onClick: (v: Filtro) => void;
  count: number;
}

function FilterButton({ label, value, current, onClick, count }: FilterButtonProps) {
  const active = current === value;
  return (
    <button
      role="tab"
      aria-selected={active}
      className={active ? `${styles.filterBtn} ${styles.filterActive}` : styles.filterBtn}
      onClick={() => onClick(value)}
    >
      {label} <span className={styles.filterCount}>{count}</span>
    </button>
  );
}