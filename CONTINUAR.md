# Cómo retomar Takt en un chat nuevo

Cada chat de Claude trabaja en una máquina temporal: lo que no está en este repositorio se pierde al cambiar de chat. Al cerrar cada chat se hace un commit con todo lo nuevo.

## Mensaje para abrir el chat nuevo (dentro del proyecto Takt)

> Seguimos con Takt. Clona mi repo `angelserna23/takt-app` y lee `CONTINUAR.md` y `docs/decisiones-mvp.md`. Corre las pruebas para confirmar que todo pasa. Siguiente: **sección «Aprende» (tutoriales, opción B: demo en vivo con un bot)**. Propónme el diseño del motor y de las pantallas antes de construir; empezamos con el motor y uno o dos tutoriales para validarlo.

## Pasos para Claude al iniciar

1. Clonar `angelserna23/takt-app` (rama `main`).
2. Leer `docs/decisiones-mvp.md` completo: reglas generales, unidades, reglas de teléfono y la hoja de ruta.
3. Correr `for t in test dstest wetest sttest mmtest smtest pctest attest ectest dftest; do node parts/$t.js; done`: todas deben decir OK.
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

## Estado al 2026-11-12 (cierre del chat)

- Listos: 6 estudios de tiempos (Work Sampling, Delay Study, Work Element, Speed Trial, Man Machine, SMED), Cálculo de personal, Actual Time con Eficiencia compuesta (vista de planta) y Diagramas de flujo de proceso (sección propia del menú). Todas las pruebas pasan.
- Menú actual: Inicio · Estudios de tiempos · Cálculo de personal · Actual Time · Diagramas de flujo · Configuración. En teléfono: Personal en la barra; Actual Time y Diagramas de flujo desde «Más».
- Año fiscal: se nombra por el año en que empieza (FY26 = abr 2026 – mar 2027).
- **Siguiente: «Aprende» (tutoriales), opción B elegida por Angel (2026-11-12):**
  - Sección propia del menú «Aprende», con una tarjeta por herramienta: los 6 estudios, Cálculo de personal, Actual Time (+ Eficiencia compuesta) y Diagramas de flujo. Se elige el tutorial de cada uno.
  - Cada tutorial: qué pregunta responde y cuándo usarlo → **demo en vivo** dentro de la app real: un cursor «bot» se mueve, toca los botones reales y escribe en los campos reales, con un globo que explica cada paso → cómo leer los resultados.
  - Controles: pausar, siguiente paso, repetir y «ahora hazlo tú». Usa las pantallas reales para que nunca quede viejo; los pasos se definen como datos (selector + acción + texto del globo) y una prueba automática corre cada tutorial para avisar si una pantalla cambió.
  - Datos ficticios (los ejemplos que ya tiene cada formato). Más adelante, de la misma demo se graban videos (Playwright) para redes y la página de venta.
  - Plan: primero el motor + 1 o 2 tutoriales para validar con Angel; los demás después (lo ideal es terminarlos tras el diseño final, porque dependen de que las pantallas ya no cambien).
- Pendiente menor: 3 pruebas de pantalla viejas fallan desde antes de 2026-11-11 porque buscan botones de diseños anteriores (`tests/smoke/smoke_ds.py`, `smoke_ds2.py`, `smoke_we_tab.py`); actualizarlas o quitarlas. Las demás pruebas de pantalla pasan.
- Después: guardado de estudios (y exportación PDF/Excel), pagos (suscripción, sin publicidad), Inicio (tablero del analista) y diseño final (paleta y UX/UI).
