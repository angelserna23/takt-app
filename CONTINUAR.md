# Cómo retomar Takt en un chat nuevo

Cada chat de Claude trabaja en una máquina temporal: lo que no está en este repositorio se pierde al cambiar de chat. Al cerrar cada chat se hace un commit con todo lo nuevo.

## Mensaje para abrir el chat nuevo (dentro del proyecto Takt)

> Seguimos con Takt. Clona mi repo `angelserna23/takt-app` y lee `CONTINUAR.md` y `docs/decisiones-mvp.md`. Corre las pruebas para confirmar que todo pasa. Siguiente: **lo que Angel indique** (Aprende ya tiene los 6 estudios; faltan tutoriales de Personal, Actual Time y Diagramas de flujo; hoja de ruta: guardado de estudios y exportación).

## Pasos para Claude al iniciar

1. Clonar `angelserna23/takt-app` (rama `main`).
2. Leer `docs/decisiones-mvp.md` completo: reglas generales, unidades, reglas de teléfono y la hoja de ruta.
3. Correr `for t in test dstest wetest sttest mmtest smtest pctest attest ectest dftest tuttest; do node parts/$t.js; done`: todas deben decir OK.
4. Para publicar cambios de la app: el artifact ya existe (slug `b963594a-ed0b-4bfe-9897-a3ee86914094`). Republicar `index.html` sobre ese mismo slug (pedir la versión actual con get_artifact y usarla como base_version). No crear un artifact nuevo.
5. Al terminar el chat: seguir la rutina de cierre (abajo).

## Rutina de cierre ("por hoy terminamos")

Cuando Angel diga que por hoy terminamos, Claude hace, en este orden:

1. Correr todas las pruebas. Si algo falla, avisar y **no** subir.
2. Actualizar `docs/decisiones-mvp.md` y la sección "Estado" de este archivo con lo hecho en el día.
3. `git status` y revisar la lista; agregar solo lo que corresponde (nunca `git add .` a ciegas). Los Excel de Angel y los temporales quedan fuera por `.gitignore`.
4. `git commit` con mensaje descriptivo (p. ej. `Actual Time: cálculo validado + 8 pruebas`).
5. `git push` a `main` y confirmar a Angel el número de commit. Sin push, el trabajo se pierde al cerrar el chat.

Además: commit + push intermedio cada vez que se cierre algo importante (cálculo validado, pantalla lista), por si el chat se corta.

## Forma de trabajo acordada

- Un formato a la vez: Angel manda su formato y explicación → comentarios y errores → validar el cálculo en el chat con un ejemplo → construir → pruebas automáticas.
- Explicar cada decisión técnica (Angel estudia Full Stack Python); ser directo y decir cuando algo sea mala idea.
- Datos ficticios siempre. Nunca usar código, archivos ni datos de empleadores, ni tablas de tiempos estándar de terceros.
- Tiempo en minutos decimales; texto en MAYÚSCULAS; campos numéricos sin flechas (coma o punto); tablet primero; en teléfono botones de acción abajo y arrastrar en lugar de flechas.

## Estado al 2026-11-12 (noche)

- Listos: 6 estudios de tiempos, Cálculo de personal, Actual Time + Eficiencia compuesta, Diagramas de flujo y **Aprende con tutoriales de los 6 estudios** (demo en vivo con bot + «Hazlo tú» guiado; las explicaciones corren solas como video y solo se espera al usuario cuando debe actuar; sin historial).
- Agregados: «Cargar ejemplo» en Delay Study y «Cargar tiempos de ejemplo» en Work Element. Corregido: seleccionar con un toque + «Mover aquí» en Asignación y balanceo.
- Pruebas: 11 de cálculo (incluye `tuttest`) + pantallas; `tests/smoke/smoke_tut.py` corre los 6 tutoriales en demo y guiado en 3 dispositivos (`SOLO=lap|tab|phone` para uno).
- Menú: Inicio · Estudios de tiempos · Cálculo de personal · Actual Time · Diagramas de flujo · Aprende · Configuración. En teléfono: Personal en la barra; Actual Time, Diagramas de flujo y Aprende desde «Más».
- Pendiente menor: `smoke_ds.py`, `smoke_ds2.py` y `smoke_we_tab.py` buscan botones de diseños anteriores (fallaban desde antes); actualizarlas o quitarlas.
- Después: tutoriales de Personal / Actual Time / Diagramas de flujo, guardado de estudios (y exportación PDF/Excel), pagos (suscripción, sin publicidad), Inicio (tablero del analista), diseño final (paleta y UX/UI).
