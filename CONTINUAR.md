# Cómo retomar Takt en un chat nuevo

Cada chat de Claude trabaja en una máquina temporal: lo que no está en este repositorio se pierde al cambiar de chat. Al cerrar cada chat se hace un commit con todo lo nuevo.

## Mensaje para abrir el chat nuevo (dentro del proyecto Takt)

> Seguimos con Takt. Clona mi repo `angelserna23/takt-app` y lee `CONTINUAR.md` y `docs/decisiones-mvp.md` (sobre todo «Pendientes» y «La app en inglés»). Corre `bash tests/correr_pruebas.sh` para confirmar que todo pasa. Toca: **guardado Fase 3** (avisos de almacenamiento lleno o no disponible y recordar ajustes de vista). Pagos van en otro chat; el diseño visual al final. Recuerda: todo texto nuevo de pantalla lleva su traducción en `i18n/*.txt`.

## Pasos para Claude al iniciar

1. Clonar `angelserna23/takt-app` (rama `main`).
2. Leer `docs/decisiones-mvp.md` completo: reglas generales, unidades, reglas de teléfono y la hoja de ruta.
3. Instalar Chromium para Playwright (`playwright install chromium`) y correr `bash tests/correr_pruebas.sh`: cálculos + guardado de los 12 formatos (incluye PDF de una página) + los 12 tutoriales en laptop, tablet y teléfono + la app en inglés sin español (≈ 9 min). `cd tools && npm install` la primera vez (acorn para la prueba de cobertura del inglés). Debe terminar en «TODO PASA». Durante el trabajo, `bash tests/correr_pruebas.sh rapido` corre solo los cálculos.
4. Para publicar cambios de la app: el artifact ya existe (slug `b963594a-ed0b-4bfe-9897-a3ee86914094`). Republicar `index.html` sobre ese mismo slug (pedir la versión actual con get_artifact y usarla como base_version). No crear un artifact nuevo.
5. Al terminar el chat: seguir la rutina de cierre (abajo).

## Rutina de cierre ("por hoy terminamos")

Cuando Angel diga que por hoy terminamos, Claude hace, en este orden:

1. Correr `bash tests/correr_pruebas.sh` (incluye los tutoriales). Si algo falla, avisar y **no** subir.
2. Actualizar `docs/decisiones-mvp.md` y la sección "Estado" de este archivo con lo hecho en el día.
3. `git status` y revisar la lista; agregar solo lo que corresponde (nunca `git add .` a ciegas). Los Excel de Angel y los temporales quedan fuera por `.gitignore`.
4. `git commit` con mensaje descriptivo (p. ej. `Actual Time: cálculo validado + 8 pruebas`).
5. `git push` a `main` y confirmar a Angel el número de commit. Sin push, el trabajo se pierde al cerrar el chat.

Además: commit + push intermedio cada vez que se cierre algo importante (cálculo validado, pantalla lista), por si el chat se corta. **Cualquier cambio de pantalla se prueba con `bash tests/correr_pruebas.sh` completo antes de subir**: si un tutorial deja de encontrar su botón, se corrige el guion (o la pantalla) en el mismo cambio, no después.

## Forma de trabajo acordada

- Un formato a la vez: Angel manda su formato y explicación → comentarios y errores → validar el cálculo en el chat con un ejemplo → construir → pruebas automáticas.
- Explicar cada decisión técnica (Angel estudia Full Stack Python); ser directo y decir cuando algo sea mala idea.
- Datos ficticios siempre. Nunca usar código, archivos ni datos de empleadores, ni tablas de tiempos estándar de terceros.
- Tiempo en minutos decimales; texto en MAYÚSCULAS; campos numéricos sin flechas (coma o punto); tablet primero; en teléfono botones de acción abajo y arrastrar en lugar de flechas.

## Estado al 2026-11-14 (la app en inglés)

- Hecho: la app completa en inglés (enfoque A): 12 formatos, Inicio, Configuración, avisos, 12 reportes PDF y 12 tutoriales; selector ES / EN visible en el encabezado; prueba que falla si queda español. Detalle en `docs/decisiones-mvp.md` → «La app en inglés».
- Teléfono: barra Inicio · Actual Time · [cronómetro: elige el tipo de estudio] · Personal · Configuración; menú lateral y encabezado responsivos en pantallas bajas o medianas.
- Siguiente: guardado Fase 3 → pagos (otro chat) → diseño.

## Estado al 2026-11-13 (cierre del día)

- Hecho hoy: reportes PDF de los 11 formatos (aprobados), tablero de Inicio (aprobado) con líneas contra el takt, cobertura y actividad, e historial ficticio de 47 estudios.
- Orden acordado: **inglés (siguiente chat, enfoque A ya elegido) → pagos → guardado Fase 3 → diseño al final**. Se quitó el pendiente «qué va en el menú en lugar de OEE / Costo MO».

## Estado al 2026-11-13 (noche: tablero de Inicio)

- Nuevo: **tablero de Inicio** por planta (indicadores de planta, los 12 tipos de estudio en renglones con su resultado, quién lo hizo, animación) y **historial ficticio** (47 estudios, `tools/semilla.py`) que se carga solo una vez. Pruebas: `parts/intest.js` (17) y `tests/smoke/smoke_inicio.py` (semilla, indicadores, renglones, animación, tablet y teléfono). Publicado.
- Angel lo aprobó; además se agregaron líneas contra el takt, cobertura y actividad por mes. **Siguiente chat: diseño** (visual y movimiento de toda la app, incluido el tablero). Al lanzar: `SEED_ON=false` y borrar el bloque `<semilla>`.

## Estado al 2026-11-13 (noche: reportes en PDF)

- Reportes en PDF de los 11 formatos (Work Sampling, Delay Study, Work Element, Speed Trial, Man Machine, SMED, Takt y balanceo, Flujo de proceso, Espagueti, Cálculo de personal, Actual Time), con botón en la lista y en resultados. Formato común aprobado; WS, DS y WE con visto bueno; el resto, en revisión de Angel. Probado: los 11 generan PDF en `smoke_store.py`; reportes vacíos no truenan; WE con 60 operadores.
- TERMINADO: Angel aprobó todos, incluido Actual Time.

## Estado al 2026-11-13 (tarde: Diagrama de espagueti)

- Nuevo: sección **«Diagramas»** (Flujo de proceso + Espagueti) y el **Diagrama de espagueti** (aislado, clave `sp` v1, ubicación hasta área, tutorial 12). 16 pruebas de cálculo + guardado + tutorial en 3 dispositivos. Publicado.
- Tutoriales: el globo de «Hazlo tú» deja pasar los toques. Pruebas: el clic forzado en SVG espera a que el objetivo deje de moverse; el guardado espera confirmación en vez de 250 ms fijos.
- TERMINADO: Angel lo probó y lo cerró.

## Estado al 2026-11-13 (tarde: Hoja de trabajo estándar)

- Nuevo: **Hoja de trabajo estándar** (módulo aislado, clave `hs` v1, ubicación hasta estación, tutorial 11): encabezado + EPP, secuencia con símbolos ASME y puntos clave, hoja con flujo dibujado solo; impresión carta horizontal en una página. 15 pruebas de cálculo + guardado + PDF + tutorial en 3 dispositivos. Publicado.
- Regla nueva de Angel: todos los módulos aislados; única excepción Takt y balanceo.
- Prueba de tutoriales: en «escribe» espera 150 ms y vuelve a ubicar el campo (con más carga, el texto de Diagramas de flujo caía en la nube anterior).
- TERMINADO: Angel la probó y la cerró.

## Estado al 2026-11-13 (Takt y balanceo)

- Nuevo: **Takt y balanceo de línea** (pestaña propia): takt con demanda/turnos/paros, estaciones traídas de los Work Element de la línea (cada operador = una estación), balanceo arrastrando elementos contra el takt, resultados con antes → simulado. Clave `tk` v1, ubicación hasta línea, tutorial 10, 24 pruebas de cálculo + guardado + tutorial en 3 dispositivos. Publicado en el mismo artifact.
- TERMINADO (Angel lo probó y lo cerró). Confirmado: el takt vive en cada balanceo (fechado); Configuración muestra el más reciente por línea.
- Siguiente complementario: plan de acción + antes/después (antes, decidir si habla de dinero).

## Estado al 2026-11-12 (noche, guardado Fases 1 y 2)

- Listos: 6 estudios de tiempos, Cálculo de personal, Actual Time + Eficiencia compuesta, Diagramas de flujo, Aprende (9 tutoriales) y **Guardado**:
  - Fase 1: almacén IndexedDB con sobre, versiones y migraciones; «Guardar» explícito todo o nada; SIN GUARDAR / CAMBIOS SIN GUARDAR / Descartar; aviso al salir; tutoriales sin rastro; «Puesto» en lugar de nombre; fechas locales.
  - Fase 2: catálogo Planta → Área → Línea → Estación en Configuración; selector en los 9 formatos (con «+» para crear desde el estudio); filtros y ubicación en las listas; migración v1 → v2.
- Pruebas: `bash tests/correr_pruebas.sh` = 12 de cálculo/lógica + guardado y jerarquía + 9 tutoriales en 3 dispositivos (≈ 5 min). Obligatoria antes de cada commit.
- **Reglas:** si cambia la forma de los datos de un formato, se sube su versión en `STORE_SCHEMA` y se agrega su migración en `STORE_MIGS` con prueba. Los estudios guardan identificadores del catálogo, nunca nombres.
- Fase 3 (menor, cuando convenga): avisos visibles de almacenamiento lleno o no disponible; recordar filtros y FY de Eficiencia compuesta.
- Siguiente: estudios complementarios en un chat nuevo. Exportación PDF/Excel casi al final.
- Pendiente menor: `smoke_ds.py`, `smoke_ds2.py` y `smoke_we_tab.py` buscan botones de diseños anteriores; actualizarlas o quitarlas.
