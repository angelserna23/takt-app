# Hoja de trabajo estándar de la estación — diseño

Fecha: 2026-11-13 · Estado: **para aprobación de Angel (v2: módulo aislado)**

## Para qué
Documento oficial de **cómo se hace el trabajo en una estación**: documentación de la línea y lo que se usa para enseñar al operador nuevo. Se **imprime y se pega** en la estación y se **consulta en la tablet**.

## Metas / no-metas / anti-metas
- Metas: una hoja por estación, **capturada desde cero dentro del módulo (aislado, como los estudios, Cálculo de personal y Actual Time)**; secuencia con símbolos ASME y su flujo dibujado en automático; puntos clave de seguridad, calidad y ergonomía; equipo de protección; impresión en **carta horizontal, una página**; en tablet con el estilo de la app.
- No-metas (v1): fotos (el navegador tiene poco espacio; llegan con servidor); firmas y control de revisiones con usuarios (por ahora la revisión es texto); croquis espacial.
- Anti-metas: **conectar con otros módulos** (decisión de Angel 2026-11-13: ni ligar ni traer/copiar; evita que falte algo en otro campo y se confunda). Regla general: **todos los módulos son aislados; la única excepción es Takt y balanceo**, que sí trae los Work Element porque lo necesita. Tabla de combinación de trabajo estándar: no (el Man Machine ya la supera).

## Enfoques considerados
- **A (elegido por Angel): cada paso lleva su símbolo ASME y el flujo se dibuja solo** con esos pasos. Una sola captura; secuencia y diagrama nunca se contradicen.
- B: ligar un diagrama de «Diagramas de flujo» — descartado (dos documentos que mantener; ligar estudios es mala práctica).
- C: croquis espacial con la cuadrícula del Man Machine — descartado por Angel; el flujo comunica mejor el «qué y en qué orden».

## Decisiones
- Clave `hs` en `STORE_SCHEMA`, **v1** con ubicación desde el inicio; ubicación obligatoria hasta **estación**. Tutorial 11 en Aprende.
- Pasos: 01 Encabezado → 02 Secuencia → 03 Hoja.
  - **Encabezado:** ubicación (planta › área › línea › estación), operación, número de parte / modelo, revisión, fecha, elaboró / revisó / aprobó, operadores; **takt capturado a mano**; equipo de protección (íconos propios a elegir).
  - **Secuencia:** captura desde cero; cada paso: descripción, símbolo ASME (por omisión operación), tiempo (min), puntos clave (texto + tipo ⚠ seguridad / ◆ calidad / ergonomía); reordenar, agregar, quitar.
  - **Hoja:** la vista final (tablet) + botón Imprimir.
- Cálculos (pruebas automáticas `parts/hstest.js`, bloque `<hs-pure>`): TC = Σ tiempos de los pasos; % del takt y holgura; resumen ASME (cantidad y minutos por símbolo); conteo de puntos clave por tipo.
- Texto capturado en MAYÚSCULAS; tiempos en minutos decimales (reglas de todos los estudios).
- Impresión: `@media print` + `@page letter landscape`; quita vidrio y sombras, alto contraste; si la hoja no cabe, se escala para **una página**. Con más de ~18 pasos se avisa que la letra saldrá chica. En el enlace de prueba la impresión está bloqueada: se avisa en pantalla; se valida generando el PDF en las pruebas.
- Menú: entrada propia «Hoja estándar» (en teléfono desde «Más»). *Decisión de Claude.*

## Lo que queda al constructor
Íconos de equipo de protección (dibujados desde cero), acomodo del flujo (serpentina) y estilo final de la hoja.

## Pruebas
`hstest.js` (cálculo), `smoke_store.py` (guardado + PDF de una página), `smoke_tut.py` (tutorial 11 en 3 dispositivos).
