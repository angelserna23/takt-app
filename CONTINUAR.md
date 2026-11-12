# Cómo retomar Takt en un chat nuevo

Cada chat de Claude trabaja en una máquina temporal: lo que no está en este repositorio se pierde al cambiar de chat. Al cerrar cada chat se hace un commit con todo lo nuevo.

## Mensaje para abrir el chat nuevo (dentro del proyecto Takt)

> Seguimos con Takt. Clona mi repo `angelserna23/takt-app` y lee `CONTINUAR.md` y `docs/decisiones-mvp.md`. Corre las pruebas para confirmar que todo pasa. Siguiente formato: **Actual Time**. Te adjunto mi Excel/VBA y te explico qué responde: analízalo y pásame comentarios antes de construir.

## Pasos para Claude al iniciar

1. Clonar `angelserna23/takt-app` (rama `main`).
2. Leer `docs/decisiones-mvp.md` completo: reglas generales, unidades, reglas de teléfono y la hoja de ruta.
3. Correr `for t in test dstest wetest sttest mmtest smtest pctest; do node parts/$t.js; done`: todas deben decir OK.
4. Para publicar cambios de la app: el artifact ya existe (slug `b963594a-ed0b-4bfe-9897-a3ee86914094`). Republicar `index.html` sobre ese mismo slug (pedir la versión actual con get_artifact y usarla como base_version). No crear un artifact nuevo.
5. Al terminar el chat: copiar cambios al repo (index.html, parts/, tests/smoke/, docs/decisiones-mvp.md), correr pruebas, commit y push a `main`.

## Forma de trabajo acordada

- Un formato a la vez: Angel manda su formato y explicación → comentarios y errores → validar el cálculo en el chat con un ejemplo → construir → pruebas automáticas.
- Explicar cada decisión técnica (Angel estudia Full Stack Python); ser directo y decir cuando algo sea mala idea.
- Datos ficticios siempre. Nunca usar código, archivos ni datos de empleadores, ni tablas de tiempos estándar de terceros.
- Tiempo en minutos decimales; texto en MAYÚSCULAS; campos numéricos sin flechas (coma o punto); tablet primero; en teléfono botones de acción abajo y arrastrar en lugar de flechas.

## Estado al 2026-11-11

- Listos: 6 estudios de tiempos + Cálculo de personal. Todas las pruebas pasan.
- Siguiente: Actual Time (esperando el formato de Angel).
- Después: Eficiencia compuesta, Diagrama de flujo de proceso, guardado de datos, Inicio, pagos y diseño final.
