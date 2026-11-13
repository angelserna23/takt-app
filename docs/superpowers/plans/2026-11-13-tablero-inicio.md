# Tablero de Inicio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir Inicio en el tablero de una planta (indicadores generales + todos los estudios en renglones por tipo + quién los hizo) y dejar la app llena con un historial ficticio de los 12 formatos hasta hoy.

**Architecture:** Todo vive en `index.html` (IIFE, vistas `vX`, eventos delegados). La lógica que no toca la pantalla va en un bloque `// <in-pure>` probado en Node. Los números de cada tarjeta y de la planta salen de las funciones de cálculo que ya usan la app y los reportes. El historial ficticio se genera una vez con un script (Playwright corre los tutoriales en modo demo y toma sus datos), se incrusta en `index.html` entre marcadores y se guarda en el almacén la primera vez que se abre la app.

**Tech Stack:** HTML/CSS/JS sin dependencias, IndexedDB, Node (pruebas puras), Python + Playwright (generador y pruebas de pantalla).

**Spec:** `docs/superpowers/specs/2026-11-13-tablero-inicio-design.md` (más el cambio de Angel del 2026-11-13: los ejemplos SÍ se guardan como historial real; al lanzar se deja todo en blanco).

## Global Constraints
- Datos 100 % ficticios. Nunca datos, nombres ni archivos de JATCO, ABC Autolíneas u otros empleadores.
- Textos de pantalla en español.
- No se promedian estudios entre sí; los indicadores de planta salen solo de Actual Time y Cálculo de personal.
- Sin dinero fuera del Speed Trial.
- Usable con una mano y con guantes: botones y flechas de al menos 44 px; nada que dependa de pasar el mouse.
- Regla de aislamiento: Inicio solo lee; no captura ni liga datos.
- Con `prefers-reduced-motion: reduce` no hay animación ni avance automático.
- El historial ficticio se guarda solo si `SEED_ON` es `true`, nunca bajo `navigator.webdriver` (las pruebas arrancan en blanco) y una sola vez por navegador (marca `semilla` en `ajustes`). Al lanzar: `SEED_ON=false` y se borra el bloque `<semilla>`.

## Review Focus
1. Planta con estudios pero sin Actual Time ni Cálculo de personal: la banda de indicadores invita a capturarlos; nunca muestra `NaN`, `Infinity` ni ceros falsos.
2. Estudio vacío o a medias (p. ej. Speed Trial sin piezas, SMED sin pasos, borrador «SIN GUARDAR»): su tarjeta muestra «—» y no truena.
3. Estudios con ubicación «Sin asignar» o con una planta que ya no existe en el catálogo: aparecen bajo el chip «Sin asignar».
4. El avance automático se detiene al tocar, deslizar o enfocar el renglón y no pelea con el deslizamiento manual; se apaga al salir de Inicio y durante los tutoriales.
5. Un tipo con 130 estudios: el renglón pinta los 12 más recientes y «Ver todos (130)»; Inicio sigue abriendo rápido.

---

### Task 1: Historial ficticio de los 12 formatos

**Files:**
- Modify: `index.html` (hook `TaktRep.data`, bloque `// <semilla>` … `// </semilla>`, `seedLoad`, llamada al final de `storeInit`, tarjeta «Datos de prueba» en `vConfig`, `window.TaktSeed`)
- Create: `tools/semilla.py`
- Modify: `tests/smoke/smoke_store.py`

**Interfaces:**
- Produces: `TaktRep.data(kind) -> object|null` (copia JSON del estudio abierto, solo para el generador).
- Produces: `const SEED_ON=true; const SEED_VER='2026-11-13'; const SEED={cat:{plantas:[…]}, est:[[kind, uuid, savedAt, data], …]}`.
- Produces: `seedLoad() -> Promise<number>` (cantidad de estudios agregados o reemplazados; upsert por `uuid` fijo `semilla-<kind>-<n>`; agrega al catálogo las plantas que falten por `id`; escribe `ajustes.semilla = SEED_VER`).
- Produces: `window.TaktSeed = {load: () => Promise<number>, count: () => number}`.

- [ ] **Step 1: Test (smoke_store.py, sección nueva «semilla»)**
  - Al abrir con Playwright (webdriver) los 12 formatos siguen vacíos: `TaktStore.dump(k)` de cada formato es `[]`.
  - `await TaktSeed.load()` devuelve `TaktSeed.count()`; tras recargar, la suma de `JSON.parse(TaktStore.dump(k)).length` de los 12 formatos es igual a `TaktSeed.count()`, y los 12 tienen al menos uno.
  - Llamar `TaktSeed.load()` otra vez no duplica (mismo total).
  - Cada estudio sembrado tiene `ubic.planta` de una planta que existe en el catálogo.
- [ ] **Step 2:** Correr `python3 tests/smoke/smoke_store.py` → falla («TaktSeed is not defined»).
- [ ] **Step 3: Generador `tools/semilla.py`**
  - Corre `TaktTut.start(k,'demo',20)` de cada formato y toma `TaktRep.data(k)` al llegar a `fin`.
  - Catálogo ficticio: PLANTA NORTE (ENSAMBLE: LÍNEA 1 y LÍNEA 2 con EST 10–40; MAQUINADO: LÍNEA M1 y LÍNEA M2; ALMACÉN) y PLANTA SUR (ENSAMBLE: LÍNEA S1). Todos los formatos tienen estudios en PLANTA NORTE; PLANTA SUR tiene unos cuantos; 2 estudios quedan «Sin asignar».
  - Cantidades: Work Element 8, Speed Trial 5, Work Sampling 4, SMED 4, Hoja estándar 4, Delay Study 3, Man Machine 3, Takt 3, Flujo 3, Espagueti 3, Cálculo de personal 2, Actual Time 3.
  - Variación: tiempos ×(0.85–1.15) con semilla aleatoria fija (`random.seed(26)`); títulos, analistas (J. PÉREZ, M. LÓPEZ, A. RAMÍREZ, L. GARCÍA, R. TORRES), fechas de abril al 13 de noviembre de 2026; Cálculo de personal y Actual Time con meses de abril a octubre del FY26.
  - Escribe el JSON entre los marcadores de `index.html`. Si el bloque pasa de 200 KB, bajar copias de Speed Trial.
- [ ] **Step 4: Cargador en `index.html`** (`seedLoad`, llamada al final de `storeInit` cuando `SEED_ON && !navigator.webdriver` y `ajustes.semilla !== SEED_VER`; recalcula `uid` con `storeMaxId`; tarjeta en Configuración «Datos de prueba» con botón «Volver a cargar el historial de ejemplo»).
- [ ] **Step 5:** Correr `python3 tools/semilla.py` y luego `python3 tests/smoke/smoke_store.py` → PASA.
- [ ] **Step 6: Commit** `Historial ficticio de los 12 formatos (semilla)`.

### Task 2: Lógica pura de Inicio

**Files:**
- Modify: `index.html` (bloque `// <in-pure>` … `// </in-pure>`)
- Create: `parts/intest.js`; Modify: `tests/correr_pruebas.sh` (agregar `intest`)

**Interfaces:**
- Produces: `inDate(d) -> 'YYYY-MM-DD'|''` (primera fecha AAAA-MM-DD en `d.fecha`, si no en `d.periodo`).
- Produces: `inWhoOf(d) -> string` (`analista` || `observador` || `elaboro`, en mayúsculas y sin espacios sobrantes).
- Produces: `inFilter(items, planta, linea) -> items` con `items=[{kind,d}]`; `planta=''` = sin asignar (sin planta o planta que no está en `plantIds`); firma completa `inFilter(items, planta, linea, plantIds)`.
- Produces: `inGroups(items, order) -> [{kind, n, items}]` en el orden fijo `order`, cada grupo del más reciente al más viejo (`inDate` desc; sin fecha al final), omitiendo tipos sin estudios.
- Produces: `inWho(items) -> [{name, n, kinds:{kind:n}, last}]` ordenado por `n` desc y luego `name`; ignora nombres vacíos.

- [ ] **Step 1: Tests (`parts/intest.js`)**, leyendo el bloque de `index.html` como los demás:
  - `inDate({fecha:'2026-10-02'})==='2026-10-02'`; `inDate({fecha:'13 nov 2026', periodo:'2026-11-10 turno 1'})==='2026-11-10'`; `inDate({})===''`.
  - `inWhoOf({observador:' m. lópez '})==='M. LÓPEZ'`.
  - `inFilter` con plantas `['P1']`: un estudio de P1, uno sin ubicación y uno de `'P9'` (borrada) → `inFilter(...,'P1','',ids).length===1`; `inFilter(...,'','',ids).length===2`; filtro de línea `'L1'` deja solo los de esa línea.
  - `inGroups` con orden `['ws','st']`: devuelve `ws` antes que `st` aunque `st` venga primero; dentro del grupo `2026-09-01` antes que `2026-04-01` y el sin fecha al final; un tipo sin estudios no aparece.
  - `inWho`: dos estudios de J. PÉREZ (ws, st) y uno de M. LÓPEZ → `[{name:'J. PÉREZ',n:2,kinds:{ws:1,st:1},last:'…'}, …]`; un estudio sin analista no cuenta.
- [ ] **Step 2:** `node parts/intest.js` → falla (bloque no existe).
- [ ] **Step 3:** Implementar el bloque `<in-pure>`.
- [ ] **Step 4:** `bash tests/correr_pruebas.sh rapido` → PASA.
- [ ] **Step 5: Commit** `Inicio: lógica pura + pruebas`.

### Task 3: Indicadores de la planta

**Files:** Modify: `index.html` (`ecData(fy, planta)`, `inKpis(planta)`, banda de indicadores en `vInicio`)

**Interfaces:**
- Consumes: `atMonth`/`atAll`, `ecSeries`, `ecPlant`, `ecYear`, `pcMonth` (existentes).
- Produces: `ecData(fy, planta)` — con `planta` indefinida se comporta igual que hoy (Eficiencia compuesta no cambia).
- Produces: `inKpis(planta) -> null | {fy, mes, efic, eficSA, eficPrev, areas:[{lbl, at, meta}], gap, ausentismo, occ, hcVol, hcEsq}` — año fiscal más reciente con datos de esa planta; `mes` = último mes capturado de la planta; cada valor que no exista es `null`.

- [ ] **Step 1: Test (smoke_store.py, sección «inicio»)** tras `TaktSeed.load()` y recarga: en Inicio con PLANTA NORTE, el KPI «Eficiencia de planta» muestra el mismo % que Eficiencia compuesta filtrada a esa planta (`TaktInicio.kpis(id).efic` contra el cálculo de `ecYear` de la vista); con una planta sin Actual Time ni Cálculo de personal la banda muestra la invitación y ningún `NaN`.
- [ ] **Step 2:** Correr → falla.
- [ ] **Step 3:** Implementar `ecData(fy,planta)`, `inKpis`, la banda (eficiencia con/sin afectación + mini tendencia, Actual Time contra meta por área en barras, GAP de personal, ausentismo, ocupación, HC volumen vs esquema) y `window.TaktInicio={kpis:inKpis}`.
- [ ] **Step 4:** Correr → PASA.
- [ ] **Step 5: Commit** `Inicio: indicadores de planta`.

### Task 4: Renglones de estudios y «Quién lo hizo»

**Files:** Modify: `index.html` (`IN_HEAD`, `vInicio`, eventos de Inicio), `tests/smoke/smoke_store.py`

**Interfaces:**
- Produces: `IN_HEAD[kind](d) -> {big, lbl, sub, g}` para los 12 tipos (`g` = fracción 0–1 para el anillo o `null`), con la tabla «Resultado principal por tipo» del spec; datos vacíos → `big:'—'`.
- Produces: estado `IN={planta, linea}`; chips `data-inplanta`, `data-inlinea`; tarjeta `data-inopen="kind|id"` que abre el estudio igual que su lista (reusar el handler de cada formato; si alguno depende de la ruta, abrir desde un despachador por tipo).
- Produces: `TaktInicio.head(kind,id)` para las pruebas.

- [ ] **Step 1: Tests (smoke_store.py)** con la semilla cargada, en laptop:
  - PLANTA NORTE muestra 12 renglones `[data-inrow]` en el orden: Work Sampling, Delay Study, Work Element, Speed Trial, Man Machine, SMED, Takt y balanceo, Hoja estándar, Flujo de proceso, Espagueti, Cálculo de personal, Actual Time.
  - El OEE de la tarjeta del Speed Trial más reciente es el mismo que muestra su pantalla de resultados.
  - Tocar la primera tarjeta de cada renglón abre ese estudio (la ruta cambia a `<kind>-nuevo` y el título coincide); regresar a Inicio.
  - El chip de línea LÍNEA 1 reduce las tarjetas a las de esa línea; el chip «Sin asignar» muestra los 2 sin planta.
  - «Quién lo hizo» lista a los 5 analistas y la suma de sus estudios es igual al total de tarjetas de la planta con analista.
  - Un renglón con más de 12 estudios pinta 12 y el botón dice «Ver todos (n)».
- [ ] **Step 2:** Correr → falla.
- [ ] **Step 3:** Implementar `IN_HEAD`, renglones (12 más recientes por tipo, flechas, «Ver todos (n)» → `go(kind)`), filtro de línea, sección «Quién lo hizo».
- [ ] **Step 4:** Correr → PASA.
- [ ] **Step 5: Commit** `Inicio: estudios por tipo y quién lo hizo`.

### Task 5: Dinamismo

**Files:** Modify: `index.html` (CSS de Inicio, `inAnimate()` llamado después de pintar Inicio, temporizadores)

**Interfaces:**
- Produces: `inAnimate()` — conteo desde 0 en `[data-count]`, anillos que se dibujan, entrada escalonada de tarjetas; avance automático por renglón cada 5 s que se detiene en `pointerdown`, `wheel`, `touchstart`, `scroll` del usuario o `focusin`; todo se limpia al salir de Inicio; no corre con reducir movimiento ni con un tutorial activo.

- [ ] **Step 1: Test (smoke_store.py)**: con `reduced_motion='reduce'` el `scrollLeft` de un renglón no cambia en 6 s; sin reducir movimiento cambia; después de tocar el renglón deja de cambiar en los siguientes 6 s; al ir a otra pantalla no quedan temporizadores (`TaktInicio.timers()===0`).
- [ ] **Step 2:** Correr → falla.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr → PASA.
- [ ] **Step 5: Commit** `Inicio: animación y avance automático`.

### Task 6: Revisión en 3 dispositivos, publicar y documentar

**Files:** Modify: `tests/smoke/smoke_store.py` (Inicio en tablet y teléfono), `docs/decisiones-mvp.md`, `CONTINUAR.md`, `README.md` si lista pantallas

- [ ] **Step 1:** Prueba: en tablet (1024×768) y teléfono (390×844) Inicio pinta los 12 renglones sin desbordar la pantalla a lo ancho (`document.documentElement.scrollWidth <= innerWidth+1`) y las flechas miden al menos 44 px.
- [ ] **Step 2:** Capturas de laptop, tablet y teléfono con la semilla; revisarlas y corregir lo visual.
- [ ] **Step 3:** `bash tests/correr_pruebas.sh` completo → «TODO PASA».
- [ ] **Step 4:** Publicar `index.html` en el artifact (slug `b963594a-ed0b-4bfe-9897-a3ee86914094`), actualizar docs (tablero, semilla, cómo dejar en blanco al lanzar) y commit + push.
