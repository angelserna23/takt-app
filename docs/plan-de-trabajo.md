# Takt — plan de trabajo (seguimiento)

Actualizado: 2026-11-19 (noche, Legal hecho en borrador) · Orden acordado con Angel (2026-11-19): **Legal (borradores listos; falta abogado) → Diseño visual (siguiente) → Pagos**, y lo que quede pendiente; se agregan puntos conforme salgan.
Marca `[x]` al cerrar cada punto y anota la fecha. El detalle de cada decisión va en `docs/decisiones-mvp.md`.

## Ruta hasta el lanzamiento (acordada con Angel, 2026-11-19)
1. **Diseño visual**, con el nombre o la marca como primer paso.
2. **Pagos** (completa el documento legal 7).
3. **Cuentas y nube** (backend, usuarios y roles, sincronización).
4. **App completa y probada**, validada en piso.
5. **Actualizar los borradores legales** con los datos reales (responsable, nube, pagos, medidas de seguridad).
6. **Revisión del abogado** (enviarle Word o PDF con control de cambios).
7. **Lanzamiento.**
Antes del punto 5, y sin esperar: consulta corta con abogado o contador para definir **persona física o S.A.S.**

**Enlaces legales en la app (se construyen en el chat de diseño; el contenido entra al aprobarlo el abogado):**
- **Sitio web / página de entrada:** pie de página con «Aviso de privacidad · Términos y condiciones · Uso aceptable · Cookies y almacenamiento · Reembolsos».
- **Dentro de la app** (en una app no hay pie de página que se vea siempre): Configuración → sección **«Legal»** con los documentos y su fecha de versión, más «Acerca de Takt» (versión de la app).
- **Al crear cuenta:** casillas separadas con enlaces a Términos y Aviso de privacidad.
- **Perfil:** aviso simplificado con enlace al integral.
- **PDF:** pie con el aviso corto de los cálculos.
- Mientras estén en revisión, la sección muestra «En revisión» en lugar del texto, para no publicar borradores (y no obligar a traducir al inglés textos sin aprobar).

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

## 2b. Legal (borradores hechos 2026-11-19 · plan en `docs/plan-legal.md`)
Respaldarse legalmente de todo lo posible: la app maneja estudios de tiempos de personas en piso, datos de empresas clientes y pagos. En ese chat Claude actúa como abogado experto en derecho digital mexicano; Angel lo confirma con un abogado humano antes de lanzar.
Borradores en `docs/legal/` (índice, decisiones de Angel y marco legal verificado en `docs/legal/README.md`). Todos quedan **pendientes de revisión del abogado** antes de publicar.
Decisiones (2026-11-19): responsable, correo de privacidad y nube por definir (espacios); solo México por ahora; empresas y personas físicas (aplica PROFECO); operadores solo con claves; mayores de 18; al cancelar, 30 días para descargar y luego se borra.
- [x] 1. Aviso de privacidad integral + simplificado (2026-11-19) → `01-aviso-de-privacidad.md`. Incluye texto para la etapa actual (sin nube) y casillas de registro.
- [x] 2. Términos y condiciones del servicio (SaaS) (2026-11-19) → `02-terminos-y-condiciones.md`. Separa Cliente empresa y Consumidor (LFPC); cancelación por el mismo medio y aviso de renovación (art. 76 Bis, reforma DOF 12-12-2025).
- [x] 3. Contrato de tratamiento de datos para empresas cliente (2026-11-19) → `03-contrato-tratamiento-datos.md`. Cliente responsable, Takt encargado; claves en vez de nombres; revisión humana antes de decidir (art. 26); anexos de datos, seguridad y subencargados.
- [x] 4. Política de uso aceptable (2026-11-19) → `04-politica-uso-aceptable.md`. Uso ético con trabajadores, cuentas compartidas, ingeniería inversa, datos de otras empresas.
- [x] 5. Aviso sobre los cálculos (2026-11-19) → `05-aviso-sobre-calculos.md`. Tres versiones: completa (Legal), en pantalla (Cálculo de personal, Eficiencia, Takt y balanceo, GAP de Inicio) y pie de todos los PDF.
- [x] 6. Política de almacenamiento local y cookies (2026-11-19) → `06-politica-almacenamiento-local.md`. Describe lo que guarda hoy la app (base `takt`: `estudios` y `ajustes`), sin cookies; declara Google Fonts.
- [x] 7. Política de reembolsos y cancelación (2026-11-19, **con espacios**: se completa en el chat de pagos) → `07-politica-reembolsos-cancelacion.md`. Ya fijo por ley: aviso de renovación 5 días naturales, cancelación inmediata por el mismo medio.
- [x] 8. Guía para el cliente: cómo informar a sus trabajadores (2026-11-19) → `08-guia-informar-trabajadores.md`. Cinco puntos, sindicato, modelo de párrafo para el aviso del empleador, aviso al turno, lista del analista y preguntas frecuentes.
- [x] 9. Lista para registrar la marca «Takt» en el IMPI (2026-11-19) → `09-lista-registro-marca-impi.md`. **Ojo:** «Takt» solo es descriptivo (art. 173 LFPPI) y ya hay software «Takt» en EE. UU.; decidir con abogado nombre nuevo o marca compuesta **antes del chat de diseño**.
- [ ] Revisión con abogado humano de los 9 documentos.
- [ ] Dónde se muestran en la app: sección «Legal» en Configuración, aceptación al crear cuenta (casillas separadas, ninguna premarcada), aviso simplificado en Perfil, aviso de cálculos en pantalla y pie de todos los reportes PDF. Al llegar las cuentas: «Perfil → Comunicaciones» (no a finalidades secundarias) y botón real de cancelar en «Plan y pagos».
- [ ] Técnico (chat de diseño): servir las fuentes IBM Plex desde el propio sitio en lugar de Google Fonts (hoy el navegador manda la IP del usuario a Google).
- [ ] App: junto al campo de operador, aviso «usa clave o número, no el nombre».

## 3. Diseño visual (al final)
- [ ] **Primer paso del chat de diseño: definir el nombre o la marca** (antes del logotipo y la paleta). «Takt» solo es descriptivo para el IMPI y ya hay software «Takt» en EE. UU.; opciones y pasos en `docs/legal/09-lista-registro-marca-impi.md`. Hacer la búsqueda gratuita en MARCia del IMPI de 2 o 3 candidatos antes de elegir.
- [ ] Autoalojar las fuentes (hoy vienen de Google Fonts).
- [ ] Visual y movimiento de toda la app (tablero incluido), paleta y UX/UI: superficies de vidrio claro, gráficas animadas, uso con una mano y con guantes, nada que se vea genérico.
- [ ] Mejoras extra por formato, incluida la idea grande de Angel para Work Element.

## 4. Pendientes chicos
- [ ] Eficiencia compuesta junta todas las plantas; solo Inicio separa por planta. Decidir si se separa también ahí.
- [ ] El GAP de personal del tablero de Inicio no incluye manejo de materiales.
- [x] Buscador del encabezado conectado (2026-11-19): busca en los 12 formatos por nombre, ubicación, analista, formato (ES o EN) u operación escrita adentro; sin acentos ni mayúsculas; máximo 8 resultados, Enter abre el primero, Esc cierra. En tablet y teléfono una lupa abre el campo. Pruebas: `parts/srchtest.js` y `tests/smoke/smoke_buscar.py`.
- [x] Menú lateral contraído (2026-11-19): ya no se aplasta el texto de la marca arriba ni aparece barra de desplazamiento.
- [x] Configuración (2026-11-19): se quitaron las tarjetas «Takt de la línea» y «Usuarios y permisos» (Angel).
- [x] Configuración rediseñada (2026-11-19, ideas de Angel): se entra con el círculo de iniciales (arriba a la derecha) o el engrane del menú (solo laptop; en tablet y teléfono queda el círculo). Secciones: **Perfil** (nombre, apellidos, correo, puesto, planta; avance %, «te falta», dónde se usa, tu actividad), **Empresa** (nombre y logo, con vista previa del encabezado del reporte), **Preferencias** (hoja Carta/A4 para reportes, usar mi nombre como analista, recordar/restablecer la vista, reglas de la app), **Plantas y líneas**, **Almacenamiento** (con conteo por formato) y **Plan y pagos** (plan de prueba; se define en el chat de pagos). Sin fecha de nacimiento (no se usa; obligaría a justificarla en el aviso de privacidad). Teléfono: la barra trae «Más» con las herramientas y Configuración. Usos: iniciales en el círculo, analista sugerido en estudios nuevos (no en tutoriales), logo/empresa/«Elaborado por» en los PDF. Pruebas: `parts/cfgtest.js` (23) y `tests/smoke/smoke_config.py`.
- [x] Foto de perfil opcional (2026-11-19): recorte cuadrado 256 × 256 JPG; en el círculo, la tarjeta de perfil y la lista de secciones; no sale en los PDF ni cuenta en el avance; se puede quitar.
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
