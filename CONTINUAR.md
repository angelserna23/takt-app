# Cómo retomar Takt en un chat nuevo

Cada chat de Claude trabaja en una máquina temporal: lo que no está en este repositorio se pierde al cambiar de chat. Al cerrar cada chat se hace un commit con todo lo nuevo.

## Mensaje para abrir el chat nuevo (dentro del proyecto Takt)

> Seguimos con Takt. Clona mi repo `angelserna23/takt-app` y lee `CONTINUAR.md` y `docs/decisiones-mvp.md`. Corre `bash tests/correr_pruebas.sh` para confirmar que todo pasa. Siguiente: **estudios complementarios** (Angel elige cuáles; ver «Análisis de brechas» en `docs/decisiones-mvp.md`). El guardado (Fases 1 y 2) ya está; la Fase 3 es menor.

## Pasos para Claude al iniciar

1. Clonar `angelserna23/takt-app` (rama `main`).
2. Leer `docs/decisiones-mvp.md` completo: reglas generales, unidades, reglas de teléfono y la hoja de ruta.
3. Instalar Chromium para Playwright (`playwright install chromium`) y correr `bash tests/correr_pruebas.sh`: cálculos + los 9 tutoriales en laptop, tablet y teléfono (≈ 5 min). Debe terminar en «TODO PASA». Durante el trabajo, `bash tests/correr_pruebas.sh rapido` corre solo los cálculos.
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

## Estado al 2026-11-12 (noche, guardado Fases 1 y 2)

- Listos: 6 estudios de tiempos, Cálculo de personal, Actual Time + Eficiencia compuesta, Diagramas de flujo, Aprende (9 tutoriales) y **Guardado**:
  - Fase 1: almacén IndexedDB con sobre, versiones y migraciones; «Guardar» explícito todo o nada; SIN GUARDAR / CAMBIOS SIN GUARDAR / Descartar; aviso al salir; tutoriales sin rastro; «Puesto» en lugar de nombre; fechas locales.
  - Fase 2: catálogo Planta → Área → Línea → Estación en Configuración; selector en los 9 formatos (con «+» para crear desde el estudio); filtros y ubicación en las listas; migración v1 → v2.
- Pruebas: `bash tests/correr_pruebas.sh` = 12 de cálculo/lógica + guardado y jerarquía + 9 tutoriales en 3 dispositivos (≈ 5 min). Obligatoria antes de cada commit.
- **Reglas:** si cambia la forma de los datos de un formato, se sube su versión en `STORE_SCHEMA` y se agrega su migración en `STORE_MIGS` con prueba. Los estudios guardan identificadores del catálogo, nunca nombres.
- Fase 3 (menor, cuando convenga): avisos visibles de almacenamiento lleno o no disponible; recordar filtros y FY de Eficiencia compuesta.
- Siguiente: estudios complementarios en un chat nuevo. Exportación PDF/Excel casi al final.
- Pendiente menor: `smoke_ds.py`, `smoke_ds2.py` y `smoke_we_tab.py` buscan botones de diseños anteriores; actualizarlas o quitarlas.
