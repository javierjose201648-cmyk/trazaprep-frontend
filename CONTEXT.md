# Contexto del proyecto — para Claude Code

> Este archivo es un traspaso desde una sesión previa de Claude (web).
> Léelo antes de hacer cambios. Contiene decisiones de diseño que NO
> deben revertirse sin discutirlo con el usuario.

---

## El proyecto en una frase

**TrazaPREP** es un tablero público de auditoría ciudadana del PREP (Programa
de Resultados Electorales Preliminares de México). Frontend del Hackathón
de Ciberdemocracia 2026, Eje 6: blockchain aplicado a procesos electorales.
Equipo: **TECINE** (4 integrantes). El jurado evalúa este prototipo el día
del evento.

Hay 3 piezas en el equipo:
- **Backend** (Jared) — Node + Express, expone los endpoints que consume
  este frontend, conecta con el contrato Solidity en Sepolia testnet.
- **Contrato Solidity** — ya existe, registra eventos `CAPTURA`,
  `TRANSMISION`, `VALIDACION`, `PUBLICACION` con hash SHA-256 + timestamp.
- **Frontend** (este repo) — lo que estás viendo.

---

## Estado actual del frontend

### ✅ Implementado
- Scaffold completo (Vite + React 18 + TS + React Router v6 + Axios).
- Sistema de diseño tokenizado en `src/styles/tokens.css`.
- Componentes compartidos: `Masthead`, `EditionStrip`, `StatusPill`,
  `Footnote`, `Signature`, `SearchBar`, `Timeline`.
- **Vista Inicio** completamente funcional con mock data, filtros
  funcionales, timestamps relativos en español, click-to-navigate.
- **Vista Búsqueda** completamente funcional con timeline editorial,
  estados loading / found / not-found / error, URL sincronizada
  (`?clave=...`), sugerencias clickeables.
- **Vista Verificador** sigue siendo un placeholder.

### 🚧 Pendiente
1. **Vista Verificador** — drag-and-drop de archivo + cálculo SHA-256 en
   cliente con Web Crypto API + comparación contra el registro.
2. **Conexión al backend real** cuando Jared lo tenga listo. El swap es
   trivial: cambiar imports `from "../services/mock"` por
   `from "../services/api"` en cada page.
3. Pulida mobile (ya es responsive pero merece refinamiento).
4. (Opcional) Animaciones de entrada con stagger reveal.

---

## DECISIONES DE DISEÑO — no revertir sin avisar

Estas decisiones se tomaron deliberadamente para evitar el look "hecho con
IA" que el jurado detecta de inmediato. Antes de cambiar cualquiera de
estas, confirma con el usuario.

### Dirección visual: "cívico contemporáneo"
- Inspirada en gacetas institucionales / documentos editoriales / NYT
  noche electoral, no en SaaS dashboards.
- Editorial sobre dashboard: datos densos en tablas, no en card grids.
- Decisiones tipográficas y de color son intencionales — no son
  defaults a cambiar.

### Tipografía (NO cambiar sin discutirlo)
- **Fraunces** — display, serif modulada con carácter. NO sustituir por
  Inter, Roboto, system fonts, ni "fuentes seguras".
- **IBM Plex Sans** — cuerpo. Institucional sin ser corporativa.
- **IBM Plex Mono** — todo lo que es dato técnico: claves de casilla,
  hashes, direcciones, eyebrows.

### Paleta (NO cambiar sin discutirlo)
- Papel cálido `#F5F1E8`, tinta cálida `#1A1815` (no negro puro).
- Acento sienna mexicana `#9E3B23`. Aprobado por el usuario.
  - **NO usar** azul SaaS, morado, gradientes, ni acentos brillantes.
- Estados *apagados* (verde musgo, ocre, ladrillo). NO verde fluo, NO
  amarillo plátano, NO rojo Coca-Cola.

### Patrones explícitamente prohibidos
- ❌ Tailwind. Usamos CSS Modules. NO sugerir migrar a Tailwind.
- ❌ `rounded-2xl` o radios grandes. Pills usan radio 2px casi cuadrado.
- ❌ Emojis funcionales (✅⚠️❌). Usar `StatusPill` con punto de color.
- ❌ Iconos decorativos (Lucide, Heroicons, etc.). Cero íconos en la UI
  actual. Si necesitas comunicar algo, usa tipografía + color.
- ❌ Gradientes, sombras, blur, glow, glassmorphism.
- ❌ Hero centrado con título + subtítulo gris + dos botones de CTA.
- ❌ Card grids para todo. Las tablas son tablas; los stats van en línea
  con separadores verticales.
- ❌ "Click here" / "Learn more" tipo SaaS. Lenguaje editorial.

### Lenguaje
- Español-MX en TODA la UI.
- "Huella digital del acta" en lugar de "hash SHA-256" frente al
  ciudadano (en eyebrows técnicos o tooltips sí puede aparecer "hash").
- NO mencionar "blockchain", "smart contract", "nodo", "Web3" en copy
  visible. Esos términos solo aparecen en comentarios de código.
- Acentos correctos siempre (búsqueda, validación, transmisión).
- Footnote al pie de cada vista aclarando que esto NO es un conteo de
  votos y que los resultados oficiales son del IEE. Crítico
  legalmente — NO quitarla.

---

## Arquitectura del código

### Servicios — patrón mock/api espejo
`src/services/mock.ts` y `src/services/api.ts` exponen **exactamente las
mismas funciones con las mismas firmas**. Cuando entre el backend de
Jared, el switch es cambiar imports — cero refactor.

Funciones expuestas en ambos:
- `obtenerStats(): Promise<Stats>`
- `obtenerCasillas(): Promise<string[]>`
- `obtenerResumenCasillas(): Promise<CasillaResumen[]>` (lo agregamos
  nosotros; Jared necesita exponer `GET /resumen` o lo derivamos en
  cliente)
- `obtenerBitacora(clave): Promise<Evento[]>`
- `verificarHash(clave, hash): Promise<ResultadoVerificacion>`

**Si modificas firmas en `mock.ts`, replicar en `api.ts` SIEMPRE.**

### Tipos
`src/types/index.ts` es la fuente de verdad. Reflejan el contrato
Solidity. Si necesitas un campo nuevo, agrégalo aquí primero.

### Estilos
- CSS Modules por componente (`Component.module.css`).
- Todos los valores vienen de tokens en `src/styles/tokens.css`. NO
  hardcodear colores ni font-sizes — usar variables CSS.
- Media queries en cada module CSS, breakpoints comunes: 860px y 600px.

### Utilidades
`src/utils/format.ts` — `tiempoRelativo`, `fechaLarga`, `fechaPrecisa`,
`acortarDireccion`, `acortarHash`, `timestampActual`. Antes de escribir
formatos de fecha, revisar si ya existe el helper.

---

## Decisión técnica del Verificador (próximo paso)

El usuario ya aprobó esta dirección:

- **Drag-and-drop del archivo del acta** + cálculo SHA-256 **en el
  navegador** con `crypto.subtle.digest('SHA-256', ...)` (Web Crypto
  API, nativo, cero dependencias).
- El archivo del acta NUNCA sale del dispositivo del ciudadano. Solo
  viaja el hash (64 chars hex) al backend para comparar.
- El hash calculado se manda al endpoint `/verificar` con la clave de
  casilla.
- Resultado UI: si coincide → bloque verde musgo con timestamp; si no →
  bloque rojo brick.
- Conviene mostrar el hash calculado para que el ciudadano vea qué
  está enviando (transparencia técnica).

Limitación honesta (mencionar en el footnote): el ciudadano necesita el
archivo digital canónico. Una foto del acta con su celular NO va a
coincidir porque cualquier byte distinto cambia el hash. Esto sirve para
auditores, observadores, medios, y ciudadanos que descarguen el archivo
oficial publicado.

---

## Notas para Jared (backend)

Cosas que el frontend espera y que conviene confirmar con él:
1. Endpoint nuevo: `GET /resumen` que devuelve `CasillaResumen[]`. Sin
   esto, el dashboard tendría que pedir las bitácoras una por una.
2. Campos extra en `Stats`:
   - `totalEventos` — suma de eventos en toda la red (puede cachearse
     desde los logs del evento `ActaRegistrada` del contrato).
   - `bloqueActual` — `provider.getBlockNumber()`.
3. Las claves de casilla deben estar siempre en mayúsculas en el
   contrato. El frontend fuerza `.toUpperCase()` en el input. Si Jared
   permite minúsculas o mixtas, ajustar en `src/pages/Busqueda/Busqueda.tsx`.

---

## Cómo trabaja el usuario

- Prefiere **paso a paso**: una decisión, un mockup/código, validar,
  siguiente paso. NO entregar 5 features de un solo trancazo.
- Pide **honestidad técnica**: si algo no escala o tiene un punto débil,
  decírselo antes de implementarlo, no después.
- Tiene preferencias explícitas (ver `<userPreferences>` si aparece):
  cuestionar antes de validar, evitar halagos, señalar suposiciones
  débiles, ser directo, no repetir lo que él acaba de decir.
- El proyecto se presenta ante jurado — todo debe sentirse profesional,
  llamativo, pero sin recursos que delaten "esto lo generó una IA en 5
  minutos".

---

## Comandos útiles

```bash
npm install           # primera vez
npm run dev           # arranca en localhost:5173
npm run build         # build de producción (verifica que TS pase limpio)
npm run lint          # solo type-check (tsc --noEmit)
```

---

*Última actualización: 15 mayo 2026 · al finalizar la vista Búsqueda.*
