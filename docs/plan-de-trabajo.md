# Takt — plan de trabajo (seguimiento)

Actualizado: 2026-11-15 · Orden acordado con Angel: **guardado Fase 3 → pagos (chat aparte) → diseño visual al final**.
Marca `[x]` al cerrar cada punto y anota la fecha. El detalle de cada decisión va en `docs/decisiones-mvp.md`.

## Hecho (referencia)
- [x] 12 formatos con cálculos validados y pruebas (WS, DS, WE, ST, MM, SM, TK, HS, DF, SP, PC, AT/EC).
- [x] Guardado Fases 1 y 2 (guardar, cambios sin guardar, descartar, ubicación en planta).
- [x] Reportes PDF de los 12 formatos · tablero de Inicio · 12 tutoriales (demo y guiado).
- [x] La app en inglés (2026-11-14): diccionario `i18n/*.txt`, selector ES / EN, prueba que falla si queda español.
- [x] Teléfono: barra Inicio · Actual Time · cronómetro (elige estudio) · Personal · Configuración; menú y encabezado responsivos.
- [x] Teléfono (2026-11-15): las 12 listas de estudios ya no se salen de la pantalla; PDF, descartar y eliminar van dentro de la tarjeta (prueba `smoke_listas.py`). Lo detectó Angel en Actual Time y Cálculo de personal.

## 1. Guardado Fase 3 (siguiente)
- [ ] Aviso visible en pantalla cuando el almacenamiento está lleno o el navegador no permite guardar (hoy solo un aviso chico).
- [ ] Recordar ajustes de vista entre visitas (p. ej. el año fiscal elegido en Eficiencia compuesta).

## 2. Pagos (chat aparte)
- [ ] Definir modelo de cobro (planes, prueba gratis, por usuario o por planta) y proveedor de pagos.
- [ ] Integrarlo cuando exista el backend con cuentas (ver sección 6).

## 3. Diseño visual (al final)
- [ ] Visual y movimiento de toda la app (tablero incluido), paleta y UX/UI: superficies de vidrio claro, gráficas animadas, uso con una mano y con guantes, nada que se vea genérico.
- [ ] Mejoras extra por formato, incluida la idea grande de Angel para Work Element.

## 4. Pendientes chicos
- [ ] Eficiencia compuesta junta todas las plantas; solo Inicio separa por planta. Decidir si se separa también ahí.
- [ ] El GAP de personal del tablero de Inicio no incluye manejo de materiales.
- [ ] El buscador del encabezado no hace nada (es de adorno): conectarlo para buscar estudios o quitarlo.
- [ ] Pruebas viejas `tests/smoke/smoke_ds.py`, `smoke_ds2.py` y `smoke_we_tab.py` buscan botones de diseños anteriores: actualizarlas o borrarlas (no están en `correr_pruebas.sh`).

## 5. Al lanzar
- [ ] `SEED_ON=false` y borrar el bloque `<semilla>` (la app arranca en blanco).

## 6. Para convertirlo en producto de pago real
- [ ] Cuentas de usuario y datos en la nube (cada empresa ve solo lo suyo).
- [ ] Usuarios y roles (Analista, Capturista; permisos por planta).
- [ ] Funcionar sin internet como app instalable (PWA) y sincronizar al volver la señal.
- [ ] Validación en piso real con analistas (tablet y teléfono, con guantes).
- [ ] Pasar de un solo archivo a módulos + backend en Python (el diccionario de inglés se reutiliza).
- [ ] Política para nombres de operadores (datos personales): aviso de privacidad, opción de usar solo puesto o número.
- [ ] Cobro y facturación (sección 2) conectados a las cuentas.

## Regla permanente
- Todo texto nuevo de pantalla lleva su traducción en `i18n/*.txt` (`python3 tools/i18n_build.py`); `bash tests/correr_pruebas.sh` debe terminar en «TODO PASA» antes de subir.
