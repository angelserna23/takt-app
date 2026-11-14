# Takt en inglés — diseño (enfoque A: capa de traducción)

Fecha: 2026-11-13 · Estado: aprobado por Angel y construido (2026-11-14)

## Intención
El producto será bilingüe (ES/EN) para venderse también a plantas que trabajan en inglés. La app sigue escrita en español; con EN, una capa cambia los textos al pintarse. Angel eligió este enfoque (A) en el chat anterior: costo aceptado = al migrar a módulos + Python se rehace la conexión, pero el diccionario se reutiliza.

## Metas
- Todo lo que la app escribe se ve en inglés con EN: pantallas, menús, modales, avisos, SVG, globos y fichas de los 12 tutoriales, reportes PDF (incluido el pie de página), título de la pestaña y fechas.
- Lo que captura el usuario **no se traduce** nunca (títulos, puestos, actividades, problemas, nombres del catálogo).
- Los datos que pone la app (plantilla de 14 actividades, «Cargar ejemplo», 99 registros del Speed Trial, valores que escriben los tutoriales) se crean en inglés cuando el idioma es EN.
- Una prueba automática falla si queda texto en español, y dice en qué pantalla y cuál.

## No metas
- No se reescriben las pantallas con `t('…')`.
- No se traduce la semilla de 47 estudios (decidido por Angel: se queda en español, como datos de usuario, y sirve para probar que no se traducen).
- No se cambian cálculos, guardado ni versiones de datos (`STORE_SCHEMA` no sube: solo se guarda el idioma en ajustes).
- No se traduce lo ya guardado al cambiar de idioma: un estudio creado en ES con la plantilla en español conserva sus actividades en español.

## Anti-metas (sería fracaso aunque «funcione»)
- Que se traduzca algo que escribió el usuario (p. ej. su actividad «LIMPIEZA» aparece como «CLEANING»).
- Que un tutorial deje de encontrar su botón en ES o en EN.
- Términos de ingeniería que suenen a traductor automático en vez de al inglés de planta.

## Enfoques considerados
- **A · Capa sobre la pantalla + diccionario (elegido por Angel).** No toca las 5,500 líneas; lo nuevo queda cubierto solo si se agrega al diccionario (lo vigila la prueba estática).
- B · `t('clave')` en cada texto: lo «correcto» en un framework, pero tocaría casi todo el archivo y rompería lo probado; se hará natural al migrar a módulos.
- C · Traductor automático del navegador: sin control de términos ni de datos del usuario. Descartado.

## Diseño

### 1. Motor (función pura, bloque `/*<i18n-pure>*/ … /*</i18n-pure>*/` en index.html)
- `I18N_DIC`: objeto `'texto en español': 'English text'`.
- `I18N_TPL`: plantillas con huecos `{n}` (número: dígitos, punto, coma, signo, %) y `{x}` (texto): `'Página {n} de {n}': 'Page {n} of {n}'`. Los `{x}` se traducen a su vez si están en el diccionario (si no, se dejan igual).
- `trText(s)`: conserva espacios al inicio y final; busca 1) exacto, 2) sin distinguir mayúsculas y reaplica el estilo del original (TODO MAYÚSCULAS / Primera mayúscula / minúsculas), 3) plantillas en orden. Si nada coincide, regresa el texto igual.
- Pruebas en Node (`parts/i18ntest.js`) leen el bloque directo de index.html, como `<store-pure>` y `<tk-pure>`.

### 2. Capa sobre el DOM
- `MutationObserver` en `document.body` (nodos agregados, cambios de texto y de `placeholder`, `aria-label`, `title`, `alt`). Traduce nodos de texto (HTML y SVG) y esos atributos.
- Se salta: `input`/`textarea` (su valor), `<script>`, `<style>` y todo dentro de `[translate="no"]`. Un `WeakMap` recuerda lo ya traducido para no ciclarse con sus propios cambios.
- `<option>` y botones se traducen como texto normal (su `value` no se toca: los handlers usan valores, no textos).
- Al cambiar de idioma se vuelve a pintar todo (`render()`), lo que regresa al español de origen o lo pasa a inglés.

### 3. Fuera del DOM
- `LOC()` = `'en-US'` o `'es-MX'` en las 22 llamadas `toLocale…` (fechas y horas). `toLocaleUpperCase('es-MX')` se queda.
- Reporte PDF: el CSS de `@page` («Página … de …», «Takt · tipo · título») pasa por `trText`; `document.title` también.
- `<html lang>` cambia a `en`/`es`.

### 4. Datos que pone la app
- Función `trData(s)` = `trText` solo si el idioma es EN. Se aplica al crear: plantilla del WS, ejemplos de cada formato, registros de ejemplo, y en los tutoriales a `valor` (lo que escribe el bot) y a `txt` (el texto con que busca un elemento).
- La semilla no pasa por aquí.

### 5. Datos del usuario
- Los lugares que pintan texto capturado se envuelven con `ud(s)` = `<span translate="no">esc(s)</span>` (en SVG, el atributo va en el `<text>`). Prioridad: listas y tarjetas, encabezados de estudio, nombres de actividades/elementos/estaciones/pasos en tablas y gráficas, catálogo de ubicaciones, tablero de Inicio, metadatos y cuerpo de reportes.
- La segunda pasada de la prueba (con la semilla en español) obliga a cubrirlos todos.

### 6. Selector de idioma
- Configuración: control segmentado «Idioma · ES / EN». Se guarda en ajustes (`lang`).
- Primera vez: `navigator.language` empieza con `es` → ES; si no → EN.
- Las pruebas existentes fijan ES para no cambiar su comportamiento.

### 7. Glosario (Angel aprueba antes de llenar el diccionario)
Ver `docs/glosario-en.md`. Abreviaturas que se quedan igual: OEE, JPH, TC → CT, LAT, DST/DSTR, JPMH, HC, SMED, Takt, ASME, FY, KPI, GAP.

### 8. Pruebas
- **Motor** (`parts/i18ntest.js`): exacto, mayúsculas, plantillas, huecos anidados, desconocido sin cambio, espacios.
- **Cobertura estática** (`tools/i18n_faltantes.py`, en la parte rápida de `correr_pruebas.sh`): extrae los textos en español de `index.html` (texto entre etiquetas, literales y atributos; también `di`, `tu`, fichas y `valor` de los tutoriales) y falla con la lista de los que no traduce el diccionario ni una plantilla. Lista explícita de excepciones para lo que no es texto (selectores, claves).
- **En vivo** (`tests/smoke/smoke_en.py`, Playwright, laptop y teléfono): en EN corre los 12 tutoriales en demo (y revisa la pantalla en cada paso), visita todas las rutas, abre cada pestaña de cada formato con su ejemplo, abre los modales principales y genera los 12 PDF. Detector de español sobre el texto visible y atributos fuera de `[translate=no]`: acentos y ¿¡«», palabras exclusivas del español del diccionario (las que no aparecen en ningún valor inglés) y una lista de palabras comunes (de, del, la, los, con, para, por, que, sin, una, más…). Reporta ruta/paso y el texto.
- **Segunda pasada:** misma revisión con la semilla cargada; el español solo se permite dentro de `[translate=no]`, y se comprueba que títulos de la semilla siguen en español.
- Las pruebas actuales (en ES) deben seguir pasando sin cambios.

## Lo que queda al constructor
- Orden de llenado del diccionario por módulo, guiado por la prueba estática.
- Redactar plantillas donde el español arma frases con números o nombres; si una frase no se puede plantillar porque está partida en varios nodos, juntarla en un solo nodo en el HTML (cambio mínimo de pantalla).

## Decisiones de Angel (2026-11-13)
- Enfoque A. Glosario: Claude propone, Angel aprueba. Semilla en español. Selector en Configuración + idioma del navegador la primera vez.
