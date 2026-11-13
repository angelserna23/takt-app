# Tablero de Inicio — diseño

Fecha: 2026-11-13 · Estado: aprobado por Angel (2026-11-13)

## Para qué
Inicio es la foto de **una planta**: cómo va (indicadores generales) y todo lo que se ha analizado ahí (estudios y análisis, con su resultado y quién los hizo). Sirve para que el ingeniero vea de un vistazo lo que tiene y para enseñarlo. Debe sentirse dinámico (tipo dashboard, gráficas animadas, vidrio claro), sin estorbar el uso con una mano o con guantes.

## Metas
- Selector de planta arriba (chips; «Sin asignar» es una opción más para los estudios sin planta).
- Indicadores generales de la planta, del último mes capturado del año fiscal más reciente que tenga datos (si no hay Actual Time ni Cálculo de personal, la sección invita a capturarlos):
  - Eficiencia de planta con y sin afectación (misma cuenta que Eficiencia compuesta, filtrada por planta).
  - Actual Time contra meta por área.
  - GAP de personal y ausentismo (Actual Time).
  - % de ocupación y headcount según volumen contra esquema (Cálculo de personal).
- Todos los estudios y análisis de la planta, **un renglón por tipo** (lo más reciente primero, se desliza de lado, contador por tipo, «Ver todos» lleva a la lista del módulo). Filtro por línea arriba de los renglones.
- Cada tarjeta: tipo, título, ubicación (línea / estación), fecha, analista y el **resultado principal del tipo** (ver tabla). Tocarla abre el estudio.
- «Quién lo hizo»: cada analista con cuántos estudios tiene, de qué tipos y su fecha más reciente.

## No metas / anti-metas
- **No se promedian estudios entre sí** (un OEE de una línea en marzo con otro de otra línea en octubre no significa nada). Los indicadores de planta salen solo de lo mensual por área: Actual Time y Cálculo de personal.
- Sin «estudios vencidos»: todo es historial (Angel, 2026-11-13).
- No se captura nada en Inicio y no se guarda ningún resumen: los números se calculan al abrir, con las mismas funciones de la app y de los reportes (una sola versión de cada resultado).
- Sin dinero fuera de lo que ya trae el Speed Trial.

## Resultado principal por tipo (tarjeta)
| Tipo | Número grande | Debajo |
|---|---|---|
| Work Sampling | % innecesario | % necesario · observaciones |
| Delay Study | ocupación promedio | operadores arriba de 100 % |
| Work Element | ocupación promedio | operadores · ciclos |
| Speed Trial | OEE | JPH real vs plan · costo mensual por GAP (si hay costo) |
| Man Machine | ciclo de la celda | espera del operador · qué la limita |
| SMED | paro propuesto | actual → propuesto · −% |
| Takt y balanceo | eficiencia de balanceo | estaciones sobre takt · takt |
| Hoja estándar | tiempo ciclo | pasos |
| Flujo de proceso | actividades | tiempo · distancia |
| Espagueti | metros por ciclo | viajes |
| Cálculo de personal | % de ocupación (último mes) | HC volumen vs esquema |
| Actual Time | Actual Time (último mes) | meta · eficiencia |

## Dinamismo (cómo, sin estorbar)
- Las tarjetas entran escalonadas; los números grandes cuentan desde 0; cada tarjeta trae una mini gráfica de su tipo que se dibuja al aparecer.
- Cada renglón avanza solo, despacio (una tarjeta cada ~5 s), y **se detiene en cuanto la persona lo toca o lo desliza**. Flechas grandes para guantes.
- Con «reducir movimiento» del sistema, todo queda quieto.

## Datos de ejemplo (cambio de Angel, 2026-11-13)
- Mientras la app está en pruebas se deja **llena, como si se hubiera usado hasta hoy**: un historial ficticio de los 12 formatos (dos plantas, varias líneas y analistas, fechas de abril a noviembre de 2026) que **sí se guarda** como cualquier estudio. Angel irá agregando los suyos.
- Se carga sola la primera vez que se abre la app en un navegador (una sola vez; si Angel borra algo, no vuelve). En Configuración, «Datos de prueba» permite volver a cargarla. Las pruebas automáticas arrancan en blanco.
- **Al lanzar:** se apaga (`SEED_ON=false`), se borra el bloque del historial y todo queda en blanco para el usuario.

## Enfoques considerados
- **A. Un renglón por tipo (elegido por Angel):** vista de todo lo que hay y cuánto de cada cosa; natural en teléfono.
- B. Una sola cuadrícula mezclada por fecha: con 130 Work Element taparía todo lo demás.
- Guardar el resumen de cada estudio al guardarlo (más rápido con miles): descartado por ahora; duplica datos y obliga a migraciones. Se calcula en vivo.

## Lo que decide quien construye
Diseño visual fino (se ajusta con Angel viendo el tablero con los ejemplos), mini gráfica de cada tipo, tamaños por dispositivo.

## Pruebas
- Cálculo de los indicadores de planta y del resultado de cada tipo: pruebas en Node contra los mismos números que muestra la app.
- `smoke_store.py`: con el historial cargado, Inicio muestra los 12 renglones, el filtro de planta y línea filtra, tocar una tarjeta abre el estudio, cargar el historial dos veces no duplica.
- Laptop, tablet y teléfono.
