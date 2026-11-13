# Diagrama de espagueti — diseño

Fecha: 2026-11-13 · Estado: **para aprobación de Angel**

## Para qué
Ver de un golpe el desperdicio de movimiento: por dónde camina realmente el operador (o viaja el material) sobre el layout del área, y cuántos metros recorre por ciclo, turno y día.

## Metas / no-metas / anti-metas
- Metas: cuadrícula con escala, puntos fijos con nombre, trazar el recorrido tocando puntos en orden, distancias calculadas solas, diagrama limpio para presentar.
- No-metas (v1): dibujo libre, subir plano o foto del área, varios operadores en el mismo diagrama, impresión.
- Anti-metas: ligar con otros módulos (regla de aislamiento); comparar actual vs propuesto (se descartó el antes/después: el propuesto es otro diagrama marcado «Propuesto», como en Flujo de proceso); valores estándar de caminata (los da el cliente).

## Menú (decidido por Angel)
La entrada «Diagramas de flujo» se renombra **«Diagramas»**. Adentro, dos tarjetas: **Flujo de proceso** (el módulo actual, sin cambios) y **Espagueti** (nuevo). Comparten la entrada, no los datos.

## Decisiones
- Clave `sp` en `STORE_SCHEMA`, **v1** con ubicación desde el inicio; ubicación pedida hasta **área** (los recorridos suelen abarcar más que una línea; línea opcional). Tutorial 12 en Aprende (grupo Procesos).
- Pasos: 01 Información → 02 Layout → 03 Recorrido → 04 Resultados.
  - **Información:** título, analista*, fecha, ubicación, método Actual / Propuesto, qué se sigue (Operador / Material), escala (metros por cuadro, 1 por omisión), ciclos por turno y turnos por día (opcionales), velocidad de caminata en m/min (opcional).
  - **Layout:** cuadrícula de 24 × 14 cuadros (ajustable); tocar un cuadro libre agrega un punto con nombre (estación, rack, contenedor, máquina…); arrastrar para mover; quitar.
  - **Recorrido:** tocar los puntos en el orden en que se camina; lista de trayectos; deshacer el último; borrar todo. Los trayectos repetidos se dibujan más gruesos y con su número de veces.
  - **Resultados:** diagrama + indicadores.
- Distancia de cada trayecto: **en escuadra** (por pasillos: |Δx| + |Δy|) por omisión, con opción **en línea recta**. *Decisión de Claude* (en planta se camina por pasillos; la recta subestima).
- Cálculos (pruebas automáticas `parts/sptest.js`, bloque `<sp-pure>`):
  - distancia por ciclo = Σ trayectos × escala (m);
  - viajes = número de trayectos; trayecto más repetido (A↔B, sin importar el sentido); punto más visitado;
  - por turno = distancia por ciclo × ciclos por turno; por día = por turno × turnos (si se capturan);
  - tiempo caminando = distancia ÷ velocidad (min), solo si se captura la velocidad.
- Texto en MAYÚSCULAS; tiempos en minutos (reglas de todos los estudios).

## Lo que queda al constructor
Estilo del diagrama (grosor por repeticiones, flechas de sentido, numeración), interacción táctil para colocar y mover puntos.

## Pruebas
`sptest.js` (cálculo), `smoke_store.py` (guardado + recarga), `smoke_tut.py` (tutorial 12 en 3 dispositivos) y que el Flujo de proceso siga igual dentro de «Diagramas».
