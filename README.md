# TrazaPREP · Frontend

Tablero público de auditoría ciudadana del PREP — Equipo TECINE, Hackathón de Ciberdemocracia 2026.

---

## Arranque rápido

Requisitos: **Node.js 18+**.

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

---

## Stack

- **Vite + React 18 + TypeScript**
- **React Router v6** para las 3 vistas
- **CSS Modules** + tokens en `src/styles/tokens.css`
- **Axios** para llamadas al backend
- **Sin Tailwind, sin UI kits** — diseño custom 100 %

---

## Estructura

```
src/
├── styles/           # tokens.css, reset.css, global.css
├── types/            # tipos compartidos (Evento, Stats, etc.)
├── services/
│   ├── api.ts        # llamadas reales al backend
│   └── mock.ts       # datos mock con la MISMA firma que api.ts
├── utils/
│   └── format.ts     # tiempoRelativo, fechaLarga, acortarHash, etc.
├── components/       # Masthead, EditionStrip, StatusPill, Footnote, Signature
├── pages/
│   ├── Inicio/       # ✅ implementada
│   ├── Busqueda/     # 🚧 placeholder
│   └── Verificador/  # 🚧 placeholder
├── App.tsx
└── main.tsx
```

---

## Swap a backend real

En cada page se importa de `../services/mock`. Cuando Jared tenga el backend:

```diff
- import { obtenerStats, obtenerResumenCasillas } from "../../services/mock";
+ import { obtenerStats, obtenerResumenCasillas } from "../../services/api";
```

Ambos archivos exponen la misma API.

### Endpoints que necesita el backend

| Método | Ruta                  | Devuelve                |
|--------|-----------------------|-------------------------|
| GET    | `/stats`              | `Stats`                 |
| GET    | `/casillas`           | `string[]`              |
| GET    | `/resumen`            | `CasillaResumen[]` ⚠️ nuevo |
| GET    | `/casilla/:clave`     | `Evento[]`              |
| POST   | `/verificar`          | `ResultadoVerificacion` |

> ⚠️ `/resumen` lo agregamos nosotros. Sirve para que el dashboard de Inicio no tenga que pedir las bitácoras una por una. Si Jared no lo implementa, podemos derivarlo en cliente iterando `/casillas` + N `/casilla/:clave`, pero será lento con muchas casillas.

### Campos extra en `Stats`

El frontend espera dos campos que el contrato no expone directamente:
- `totalEventos` — suma de eventos en toda la red. Backend puede cachear desde los logs del evento `ActaRegistrada`.
- `bloqueActual` — `provider.getBlockNumber()`.

---

## Sistema de diseño

**Paleta** — papel cálido + tinta cálida + sienna mexicana + estados apagados. Todos los tokens viven en `src/styles/tokens.css`.

**Tipografía**:
- `Fraunces` — display, serif modulada
- `IBM Plex Sans` — cuerpo
- `IBM Plex Mono` — claves, hashes, datos

**Principios**:
- Editorial sobre dashboard
- Datos densos en tablas, no en cards
- Status como pills tipográficas con punto de color (sin emojis)
- Cero gradientes, cero sombras, cero rounded-full
- Metadatos técnicos visibles como señal de transparencia, no escondidos

---

## Próximos pasos

1. Vista **Búsqueda** — timeline de los 4 eventos con timestamps y hashes
2. Vista **Verificador** — drag-and-drop con cálculo SHA-256 en cliente (Web Crypto API)
3. Animaciones de entrada para datos cargando
4. Versión mobile pulida (ya es responsive pero merece pulida)
5. Conexión al backend real cuando Jared lo tenga

---

*TrazaPREP — Equipo TECINE — Hackathón de Ciberdemocracia 2026*
