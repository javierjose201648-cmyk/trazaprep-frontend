import type { Evento, TipoEvento } from "../../types";
import { acortarDireccion, acortarHash, fechaPrecisa } from "../../utils/format";
import styles from "./Timeline.module.css";

interface Props {
  eventos: Evento[];
}

const ACTOS: Array<{
  numero: string;
  tipo: TipoEvento;
  titulo: string;
  descripcion: string;
}> = [
  {
    numero: "I",
    tipo: "CAPTURA",
    titulo: "Captura",
    descripcion: "Acta capturada en la casilla",
  },
  {
    numero: "II",
    tipo: "TRANSMISION",
    titulo: "Transmisión",
    descripcion: "Datos transmitidos al CEDAT",
  },
  {
    numero: "III",
    tipo: "VALIDACION",
    titulo: "Validación",
    descripcion: "Validación automática del registro",
  },
  {
    numero: "IV",
    tipo: "PUBLICACION",
    titulo: "Publicación",
    descripcion: "Publicación en el PREP",
  },
];

export default function Timeline({ eventos }: Props) {
  return (
    <ol className={styles.timeline}>
      {ACTOS.map((acto) => {
        const evento = eventos.find((e) => e.tipoLabel === acto.tipo);
        return (
          <li
            key={acto.tipo}
            className={`${styles.event} ${evento ? styles.done : styles.pending}`}
          >
            <span className={styles.bullet} aria-hidden="true" />

            <div className={styles.body}>
              <div className={styles.eyebrow}>
                Acto {acto.numero} · {acto.titulo}
              </div>

              {evento ? (
                <>
                  <div className={styles.timestamp}>
                    {fechaPrecisa(evento.timestamp)}
                  </div>
                  <dl className={styles.metaList}>
                    <dt>Huella digital</dt>
                    <dd>
                      <code
                        className={styles.hash}
                        onClick={() =>
                          navigator.clipboard?.writeText(evento.hashSHA256)
                        }
                        title="Clic para copiar el hash completo"
                      >
                        {acortarHash(evento.hashSHA256)}
                      </code>
                    </dd>
                    <dt>Registrador</dt>
                    <dd>
                      <code className={styles.addr}>
                        {acortarDireccion(evento.registrador)}
                      </code>
                    </dd>
                  </dl>
                </>
              ) : (
                <div className={styles.pendingText}>
                  <span className={styles.pendingTag}>Pendiente</span>
                  <span>{acto.descripcion}</span>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}