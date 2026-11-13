# Reportes en PDF — diseño

Fecha: 2026-11-13 · Estado: **aprobado por Angel (opción A)**; se construye un módulo a la vez.

## Para qué
Descargar cada estudio o análisis como reporte para enviarlo. **Solo lectura:** todo se trabaja en la app; nada se exporta a Excel (un Excel se edita y deja de coincidir con la app; protegerlo no lo evita).

## Decisiones
- **Opción A (elegida):** «Descargar PDF» abre la impresión del navegador con «Guardar como PDF» (en tablet, compartir por correo/WhatsApp/Drive). Sin librerías; texto y gráficas nítidos y buscables.
  - Descartada B (librería que genera el archivo): ~300 KB más y gráficas como imagen borrosa.
- **Formato común:** carta vertical, varias páginas. Encabezado (TAKT, tipo de reporte, título, ubicación y datos del estudio, fecha de generación, leyenda «solo lectura»), secciones con indicadores, gráficas, tablas y detalle; pie con «Takt · tipo · título» y «Página x de y».
- La hoja de trabajo estándar conserva su propia página (carta horizontal, una página) con `@page hoja`.
- Dónde está el botón: en cada renglón de la lista (ícono PDF junto a eliminar) y dentro del estudio.
- En el enlace de prueba la impresión está bloqueada: se avisa en pantalla; se valida generando el PDF en las pruebas.

## Orden (uno a la vez, Angel revisa cada uno)
1. Work Sampling (hecho, para comentarios) → 2. Delay Study → 3. Work Element → 4. Speed Trial → 5. Man Machine → 6. SMED → 7. Takt y balanceo → 8. Diagramas (Flujo de proceso, Espagueti) → 9. Cálculo de personal (reporte, no Excel).
- Hoja estándar: ya imprime. Actual Time: **por confirmar con Angel**.

## Pruebas
`smoke_store.py`: por cada tipo con reporte — botón en la lista, reporte armado con los datos, PDF generado, el reporte se quita al cerrar.
