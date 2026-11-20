# Takt — plan de trabajo (seguimiento)

Actualizado: 2026-11-19 · Orden acordado con Angel: **guardado Fase 3 → pagos (chat aparte) → diseño visual al final**.
Marca `[x]` al cerrar cada punto y anota la fecha. El detalle de cada decisión va en `docs/decisiones-mvp.md`.

## Hecho (referencia)
- [x] 12 formatos con cálculos validados y pruebas (WS, DS, WE, ST, MM, SM, TK, HS, DF, SP, PC, AT/EC).
- [x] Guardado Fases 1 y 2 (guardar, cambios sin guardar, descartar, ubicación en planta).
- [x] Reportes PDF de los 12 formatos · tablero de Inicio · 12 tutoriales (demo y guiado).
- [x] La app en inglés (2026-11-14): diccionario `i18n/*.txt`, selector ES / EN, prueba que falla si queda español.
- [x] Teléfono: barra Inicio · Actual Time · cronómetro (elige estudio) · Personal · Configuración; menú y encabezado responsivos.
- [x] Teléfono (2026-11-15): las 12 listas de estudios ya no se salen de la pantalla; PDF, descartar y eliminar van dentro de la tarjeta (prueba `smoke_listas.py`). Lo detectó Angel en Actual Time y Cálculo de personal.

## 1. Guardado Fase 3 (hecho 2026-11-17)
- [x] Aviso visible en pantalla: franja bajo el encabezado en todas las pantallas. Rojo (no se cierra): el navegador no permite guardar / almacenamiento lleno (se quita al guardar bien). Ámbar (se cierra): casi lleno ≥ 85 %, estudios que no se pudieron abrir. Tarjeta «Almacenamiento en este dispositivo» en Configuración (estudios guardados, espacio usado, protección contra borrado del navegador con botón para activarla; se pide sola al primer guardado).
- [x] Recordar ajustes de vista entre visitas: FY elegido a mano y modo con/sin afectación de Eficiencia compuesta (Angel: el FY se queda en el que elijas; si nunca eliges, el más reciente), filtros de planta/área/línea de las listas, planta y línea de Inicio. Lo que ya no existe en el catálogo se limpia solo; los tutoriales arrancan con la vista limpia y no guardan nada. Pruebas: `parts/storetest.js` (37) y `tests/smoke/smoke_fase3.py`.

## 2. Pagos (chat aparte)
- [ ] Definir modelo de cobro (planes, prueba gratis, por usuario o por planta) y proveedor de pagos.
- [ ] Integrarlo cuando exista el backend con cuentas (ver sección 6).

## 3. Diseño visual (al final)
- [ ] Visual y movimiento de toda la app (tablero incluido), paleta y UX/UI: superficies de vidrio claro, gráficas animadas, uso con una mano y con guantes, nada que se vea genérico.
- [ ] Mejoras extra por formato, incluida la idea grande de Angel para Work Element.

## 4. Pendientes chicos
- [ ] Eficiencia compuesta junta todas las plantas; solo Inicio separa por planta. Decidir si se separa también ahí.
- [ ] El GAP de personal del tablero de Inicio no incluye manejo de materiales.
- [x] Buscador del encabezado conectado (2026-11-19): busca en los 12 formatos por nombre, ubicación, analista, formato (ES o EN) u operación escrita adentro; sin acentos ni mayúsculas; máximo 8 resultados, Enter abre el primero, Esc cierra. En tablet y teléfono una lupa abre el campo. Pruebas: `parts/srchtest.js` y `tests/smoke/smoke_buscar.py`.
- [x] Menú lateral contraído (2026-11-19): ya no se aplasta el texto de la marca arriba ni aparece barra de desplazamiento.
- [x] Configuración (2026-11-19): se quitaron las tarjetas «Takt de la línea» y «Usuarios y permisos» (Angel).
- [x] Configuración rediseñada (2026-11-19, ideas de Angel): se entra con el círculo de iniciales (arriba a la derecha) o el engrane del menú (solo laptop; en tablet y teléfono queda el círculo). Secciones: **Perfil** (nombre, apellidos, correo, puesto, planta; avance %, «te falta», dónde se usa, tu actividad), **Empresa** (nombre y logo, con vista previa del encabezado del reporte), **Preferencias** (hoja Carta/A4 para reportes, usar mi nombre como analista, recordar/restablecer la vista, reglas de la app), **Plantas y líneas**, **Almacenamiento** (con conteo por formato) y **Plan y pagos** (plan de prueba; se define en el chat de pagos). Sin fecha de nacimiento (no se usa; obligaría a justificarla en el aviso de privacidad). Teléfono: la barra trae «Más» con las herramientas y Configuración. Usos: iniciales en el círculo, analista sugerido en estudios nuevos (no en tutoriales), logo/empresa/«Elaborado por» en los PDF. Pruebas: `parts/cfgtest.js` (23) y `tests/smoke/smoke_config.py`.
- [ ] Mes de inicio del año fiscal configurable por empresa (hoy fijo abril–marzo): toca Actual Time, Cálculo de personal, Eficiencia compuesta, Inicio y reportes; los meses ya capturados deben conservar su mes real.
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
