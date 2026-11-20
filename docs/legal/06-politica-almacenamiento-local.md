# Política de almacenamiento local y cookies — Takt

Versión: 2026-11-19 · Estado: **BORRADOR para revisión de abogado**
Relación: sección 10 del Aviso de privacidad y cláusula 4.2 de los Términos.

---

## 1. En corto

- Takt **no usa cookies** de publicidad, de rastreo ni de analítica.
- Takt guarda tus estudios y ajustes **en el almacenamiento de tu navegador** (IndexedDB) para que funcione **sin internet** en piso.
- Ese almacenamiento es **necesario** para que la App funcione; por eso no te pedimos aceptarlo por separado, pero te explicamos qué guarda y cómo borrarlo.

## 2. Qué se guarda en tu dispositivo

Takt crea en tu navegador una base de datos llamada **`takt`** con dos apartados:

| Apartado | Qué contiene | Para qué |
|---|---|---|
| **Estudios** (`estudios`) | Cada estudio que guardas (tiempos, observaciones, ubicación en planta, autor, fechas) con su versión | Trabajar y consultar estudios sin conexión; generar reportes |
| **Ajustes** (`ajustes`) | Tu perfil (nombre, apellidos, correo, puesto, planta, **foto opcional**), datos de la empresa (nombre y logotipo), preferencias (tamaño de hoja, usar tu nombre como analista), catálogo de plantas, áreas, líneas y estaciones, idioma, la vista que dejaste (filtros, año fiscal, planta y línea de Inicio) y una marca interna de los datos de ejemplo | Que la App recuerde tu configuración entre visitas |

Además, Takt puede pedir al navegador la **protección contra borrado automático** («almacenamiento persistente») para que no borre tus estudios si el dispositivo se queda sin espacio. Se pide al primer guardado y puedes verla en **Configuración → Almacenamiento**.

**Hoy, nada de esto sale de tu dispositivo hacia Takt.** Cuando existan cuentas en la nube, el almacenamiento local funcionará también como **bandeja de salida**: guardará lo que aún no se ha subido, y la App te mostrará cuántos estudios están pendientes de subir.

## 3. Servicios de terceros que se cargan al abrir la App

| Servicio | Qué hace | Qué recibe |
|---|---|---|
| **Google Fonts** (Google LLC) | Entrega las tipografías IBM Plex Sans e IBM Plex Mono | Tu **dirección IP**, el tipo de navegador y la página que la solicita, como cualquier descarga de un archivo de internet |
| **[PROVEEDOR DE NUBE / SITIO]** | Aloja la App | Registros técnicos del servidor (IP, fecha, hora, archivo solicitado) |

> Planeado: servir las tipografías desde el propio sitio de Takt para que Google no reciba tu IP. Al hacerlo, se quitará esa fila.

## 4. Cookies

Takt **no instala cookies** hoy. Cuando existan cuentas, usará solo cookies o almacenamiento **estrictamente necesarios** para mantener tu sesión iniciada y proteger contra ataques (por ejemplo, una cookie de sesión segura). Si algún día se agregan cookies de analítica, te pediremos permiso antes con una casilla y podrás negarte sin perder el servicio.

## 5. Cuánto tiempo se guarda y cómo borrarlo

- Los datos se quedan en tu dispositivo **hasta que los borres**: no caducan solos.
- **Borrar un estudio:** desde su lista (botón eliminar, con confirmación).
- **Borrar todo:** desde **Configuración → Almacenamiento**, o borrando los «datos del sitio» de Takt en la configuración de tu navegador. **Ojo:** si aún no existe la nube o hay estudios sin subir, borrarlos es **definitivo**. Descarga antes los PDF que necesites.
- **Modo incógnito:** el navegador borra todo al cerrar la ventana; no lo uses para trabajar en Takt.

## 6. Tu seguridad en el dispositivo

Cualquier persona que use tu mismo dispositivo y el mismo perfil del navegador puede ver lo guardado. Te recomendamos:

- Usar **bloqueo de pantalla** en tabletas y teléfonos de piso.
- **No compartir** el perfil del navegador entre varias personas; en equipos compartidos, cada usuario con su perfil.
- No usar Takt en computadoras públicas.

## 7. Cambios

Si cambia lo que guardamos en tu dispositivo (por ejemplo, al llegar la nube), actualizaremos esta política y te avisaremos en la App.

Última actualización: **[FECHA DE PUBLICACIÓN]**

---

## Notas para Angel

- **Esta política describe la app tal como está hoy** (revisé `index.html`: base `takt`, almacenes `estudios` y `ajustes`, sin cookies ni `localStorage`, con `navigator.storage.persist()` y Google Fonts). Si cambias eso, hay que actualizarla.
- **Google Fonts es el único dato que hoy sale del dispositivo a un tercero.** Autoalojar las fuentes es poco trabajo (descargar los `.woff2` y servirlos junto a la app) y quita el tema por completo. Lo dejé como pendiente del chat de diseño.
- **La sección 6** importa en piso: tabletas compartidas por turnos son el caso típico de fuga de datos entre usuarios.

## Cuando se venda fuera de México

- **UE (directiva ePrivacy + GDPR):** el almacenamiento estrictamente necesario no requiere consentimiento, pero la analítica sí, con banner que permita rechazar igual de fácil que aceptar. Google Fonts remoto debe quitarse antes de vender en Europa.

## Pendiente de confirmar con abogado

1. Si la dirección IP enviada a Google Fonts requiere mención en el aviso integral (ya está) o algo más bajo la LFPDPPP.
2. Si basta informar (sin casilla) del almacenamiento local por ser necesario para el servicio.
