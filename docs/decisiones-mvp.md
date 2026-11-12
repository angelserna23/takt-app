# Takt — Decisiones del MVP (Estudios de tiempos)

Última actualización: 2026-11-11

## Alcance (cambio importante)
- **OEE y costo ya no son pilares/módulos aparte.** Se manejan solo dentro del **Speed Trial**. Se quitaron las secciones "OEE" y "Costo MO" del menú (laptop y teléfono). Angel definirá qué va en su lugar.
- Las instrucciones del proyecto todavía mencionan "un pilar a la vez: Tiempos → OEE → Costo de mano de obra directa"; Angel puede actualizarlas en la configuración del proyecto.

## Forma de trabajo
- Proceso por formato: 1) diseñar el formato y sus pestañas → 2) validarlo con ejemplos → 3) diseñar dónde se guarda.
- El guardado (paso 3) se diseña una sola vez, cuando todos los formatos estén diseñados.
- Los cálculos nuevos se validan primero en el chat con un ejemplo y Angel los aprueba antes de construir la pantalla.
- Los formatos se dan por cerrados en diseño y se corrigen después, conforme se prueben en piso.
- Mejoras extra ("algo más padre") por formato se evalúan al final, una vez que todos los formatos base estén terminados.
- Paleta de colores y UX/UI se replantean al final; ahora el foco es cálculos y flujo.
- Se trabaja sobre un **prototipo web interactivo** que se va modificando: https://claude.ai/artifact/PtmQXuoBcXnPbmmhkWdK8f
- Cada entregable visual se comparte como link web para recibir comentarios.
- Datos ficticios; pantallas separadas de los datos. El tablero de Inicio se diseña al final.

## Reglas generales (todos los formatos)
- Todo texto escrito se convierte a MAYÚSCULAS.
- La tablet es el dispositivo principal de trabajo; el teléfono no debe desbordarse (gráficas anchas se deslizan de lado).
- **Teléfono:** los botones de acción del encabezado (Continuar, Revisar tabla, Eliminar…) bajan al final de la pantalla, a lo ancho; en tablet y laptop se quedan arriba. En teléfono no hay flechas ▲▼ para reordenar: se arrastra (mantener presionado). "Nuevo estudio" se queda arriba en las listas.

## Regla de unidades (todos los formatos)
- **Todo el tiempo se mide y se muestra en minutos decimales.** 1 min 30 s = 1.50. Nunca mm:ss ni segundos en pantalla.
- Campos numéricos sin flechas (texto con teclado decimal); aceptan coma o punto. En dinero la coma es separador de miles (25,000 = 25000) y se muestra como $25,000.00.

## Formatos de estudio (6)
Orden: Work Sampling (listo) → Delay Study (listo) → Work Element (listo) → Speed Trial (concluido) → Man Machine Chart (concluido) → SMED (concluido).
- Work Sampling: muestreo de actividades necesarias e innecesarias; cualquier proceso.
- Delay Study: ocupación de operadores en actividades no cíclicas y balanceo (materiales, almacén, fundición).
- Work Element: ocupación del operador en operaciones cíclicas por microelementos y balanceo (ensamble, inspección, subestaciones de materiales).
- Speed Trial: velocidad real de la línea contra el objetivo; aquí viven OEE, pérdidas, Pareto, caída de JPH y costo.
- Man Machine Chart: interacción hombre-máquina (maquinados, fundición). Se reescribe desde la explicación de Angel de su lógica VBA.
- SMED: estudio de cambio de modelo. Idea inicial: cronómetro por pasos, clasificación Interno/Externo con un toque, gráfica antes/después del tiempo de paro y diagrama de espagueti simple (puntos sobre un croquis → metros recorridos). Ataca la pérdida "3 · Cambio de modelo" del Speed Trial.
- Los formatos de Excel y el VBA los creó Angel por su cuenta, fuera de cualquier empresa; se usan como base. Las 14 pérdidas vienen de fuentes públicas.

## Tiempo estándar — en espera
- Valoración + suplementos + tiempo estándar encajarían dentro del Work Element, pero **queda en espera; no se toca por ahora**.
- Tiempos estándar y sistemas predeterminados (MTM, MODAPTS, MOST, tablas de una armadora) son licenciados o propiedad de cada empresa: **los provee el cliente, no el producto**. Nunca se cargan tablas de terceros ni de empleadores.

## Work Sampling — listo
Alcance: solo responde "¿en qué se le va el tiempo a cada operador?". OEE, costos, JPH y tiempos de ciclo NO van aquí.

Flujo:
1. Información del estudio: Título, Área, No. de parte, Analista, Fecha, Nivel de confianza (90/95/99 %, base 95) y Margen de error (base ±5 %).
2. Operadores: tarjeta por operador con estado (Pendiente / En conteo / Terminado), observaciones y % innecesario.
3. Por operador: Actividades → Conteo → Resultados. Hacia adelante solo con el botón de continuar; hacia atrás sí.
4. Al terminar un operador: Siguiente operador / Agregar otro operador / Ver general de línea / Finalizar estudio.
- Eliminar estudio y eliminar operador, con confirmación.
- Actividades por operador (el nuevo copia las del anterior). Plantilla: las 14 actividades de Angel; Limpieza, Plática y Espera = innecesarias.
- Hora de inicio = primera marca del conteo; fin = "Terminar conteo". Notas del analista por operador.

Cálculos (7 pruebas automáticas):
- % actividad = conteo / total del operador; % innecesario = suma de innecesarias; necesario = 1 − innecesario.
- General de línea = suma de conteos de todos los operadores (no promedio de %); une actividades por nombre.
- Precisión: e = Z·√(p(1−p)/n); n requerida = Z²·p(1−p)/e²; p = % innecesario; si p = 0 o 1 se usa 0.5. Z: 1.645 / 1.96 / 2.576.

## Delay Study — listo
Propósito: medir la ocupación de operadores en actividades no cíclicas y **simular el rebalanceo**. Es de análisis: el analista mueve actividades entre operadores.

Flujo (ciclo por operador):
1. Información: Título, Observador, Área, Fecha, Periodo (Hora 60 / Turno 480 / Día 720 / Otro), Tiempo disponible (min) y Objetivo estándar (piezas por periodo).
2. Cronometraje · Operador N: nombre y objetivo propio (vacío = estándar). Una sola tarjeta de captura pegada al cronómetro (Actividad, Material, Racks, SNP, No. de parte); "Siguiente actividad" guarda la actual y la baja a la lista (más reciente arriba). Material/racks/SNP/parte se conservan. Botón "Terminar Operador N y ver asignación" arriba.
3. Asignación y balanceo: columnas por operador con ocupación en vivo y objetivo editable; arrastrar actividades (táctil: mantener presionado) o tocar → "Mover aquí". "Cronometrar siguiente operador" repite el ciclo; "Cronometrar" por operador para agregar más; "Agregar operador vacío" para simular.
4. Resultados: Yamazumi con línea de tiempo disponible; escenario de demanda libre (piezas extra a cada operador y % escrito, con atajos +10/+20/+30/+50 %); ocupación promedio, personal requerido teórico, operadores > 100 %, detalle.
- Sin clasificación agrega/no agrega valor en este formato.

Cálculos (9 pruebas automáticas):
- Min por pieza = Tiempo / (Racks × SNP).
- Vuelta vacía (sin racks/SNP): se infiere; su tiempo se suma automáticamente al traslado con piezas más cercano hacia atrás del mismo operador (si no hay, al siguiente). El Excel lo convertía en 0 con IFERROR.
- Carga = Σ (min por pieza × objetivo del operador que tiene la actividad); Ocupación = carga / disponible; Libre = disponible − carga; Personal requerido = carga total / disponible.
- Escenario: objetivo = (objetivo + piezas extra) × (1 + %/100), mínimo 0.
- Validado contra el Excel de Angel: 47.5112 min → 79 % → 12.4888 libres.

## Work Element — listo
Misma lógica y resultados que el Delay Study, para operaciones cíclicas rápidas (microelementos: tomar, colocar, ajustar, mover, girar…).

Flujo (ciclo por operador, 5 pasos):
1. Información: Título, No. de parte, Analista, Área, Fecha. Base de medición: **Por hora** (60 min, objetivo = JPH) o **Por tiempo ciclo de la línea** (disponible = TC de la línea, objetivo = 1 pieza). Ciclos a cronometrar (estándar 10).
2. Elementos: primero se observa y se registra la lista de elementos en orden (botones rápidos de verbos, escribir + Enter, reordenar, quitar).
3. Cronometraje: botón grande "Siguiente: <elemento>"; al cerrar el último elemento **el cronómetro se detiene** y el analista inicia el siguiente ciclo cuando está listo. Tabla N1…Nn editable con promedio por elemento y total por ciclo; Deshacer y Pausar.
4. Asignación y 5. Resultados: iguales al Delay Study.

Cálculos (4 pruebas automáticas):
- Tiempo del elemento = promedio de sus ciclos capturados (celdas vacías no cuentan; un 0 escrito sí).
- Carga = Σ promedios × objetivo; Ocupación = carga / disponible.
- Validado contra el Excel de Angel: 1.99 min × 10 = 19.9 → 33 % (libre 40.1); × 20 = 39.8 → 66 % (libre 20.2).

## Speed Trial — CONCLUIDO (2026-11-10)
1. Información complementaria. Obligatorios (*): No. de parte, Nombre del proceso, Nombre del modelo, Costo unitario ($), Tiempo ciclo objetivo, Nombre del analista, Periodo de análisis. Opcional: Paro programado (min). Fecha fija al crear el estudio. Calculados: muestras, TC real (promedio de todos los ciclos), tiempo registrado, máx/mín T.T, piezas OK/NG.
   Supuestos de costo: OEE plan (estándar 85 %), horas productivas por día (ej. 24 − 0.5 comedor − 0.5 TPM − 0.5 break = 22.5, editable), días por semana (6), semanas por mes (4). **JPH plan automático y bloqueado** = (60 ÷ TC objetivo) × OEE plan; vive en la sección de calculados.
2. Registro: cronómetro por pieza ("Pieza terminada"); causa de las 14 pérdidas antes de cerrar la pieza; problema del catálogo; "Repetir anterior"; tabla editable con problema y 6M. Botón para cargar los 99 registros de ejemplo.
   Catálogo de problemas por línea/proceso (opción A) + clasificación 6M elegida una vez por problema y presugerida según la causa (opción B). Al crear un problema nuevo la estación inicia vacía; las estaciones ya usadas aparecen como botones.
3. Resultados, en este orden:
   - KPIs: OEE, JPH real vs plan, TC real vs objetivo, piezas OK/NG.
   - Gráfica de fluctuación pieza por pieza (rojo arriba del objetivo, verde en/abajo, detalle al tocar).
   - Estadísticas de la línea: capacidad (JPH 100 %, JPH plan, piezas posibles), real (JPH real; máx = 60 ÷ T.T mín; mín = 60 ÷ T.T máx), pérdida (minutos, piezas = min ÷ TC objetivo, JPH perdido) y afectación (**WA = con afectación**, promedio = TC real; **WOA = sin afectación**, promedio = (tiempo − pérdidas) ÷ muestras).
   - Proyección de costo (tarjetas hora/día/semana/mes/año + barras de tendencia anual acumulada).
   - Árbol de pérdidas OEE (A × P × Q) con semáforo: verde si OEE ≥ OEE plan, rojo abajo. OEE > 100 % se muestra con aviso "TC objetivo holgado".
   - Pareto de afectaciones.
   - Caída de JPH (cascada).

Cálculos (16 pruebas automáticas):
- TC real = promedio de todos los registros (ya no se escribe a mano).
- Balance cerrado contra el TC objetivo: productivo = TC objetivo × piezas OK; registro OK lento → exceso a su causa (sin causa → 12. Pérdida de tiempo ciclo); registro defectivo (13/14) → todo su tiempo a esa causa; registro más rápido → "Ganancia vs TC objetivo". Suma 100 %.
- OEE = TC objetivo × piezas OK ÷ tiempo registrado. JPH real = piezas OK ÷ (tiempo registrado / 60).
- Costo: GAP = JPH plan − JPH real; costo/hora = GAP × costo unitario; día × horas/día; semana × días; mes × semanas; año × 12. Se presenta siempre como proyección.
- Pareto: solo piezas que exceden el TC objetivo (o defectivas, con todo su tiempo). Pieza a tiempo con falla se ignora (no cuenta en repetibilidad). Lenta sin causa = "CAÍDA DE VELOCIDAD". Top 10 por minutos; con más de 10, la posición 10 = OTROS. Barras azules pegadas; Pareto estándar: eje izquierdo de 0 al total de minutos y eje derecho de 0 a 100 % (coinciden), cada punto del % acumulado al centro de su columna y el primero en la cima de la barra 1; la tabla resalta los pocos vitales (80/20).
- Caída de JPH: arranca en **JPH al 100 % = 60 ÷ TC objetivo** (no en el JPH plan: el plan ya descuenta pérdidas genéricas y la cascada no cerraría), resta cada afectación del Pareto en su orden, suma la **ganancia** (piezas más rápidas que el TC) y termina en el JPH real. Puntos de JPH = (minutos ÷ TC objetivo) ÷ horas registradas. Línea punteada del JPH plan como referencia; etiqueta = posición del Pareto y al tocar se ve el nombre; eje recortado para que se vean las barras chicas.
- Validado con los 99 registros de Angel: OEE 91.1 %, JPH real 45.56, TC real 1.25, 94 OK / 5 NG; Pareto 17.913 min = 14.93 piezas; cascada 50.00 − 7.24 + 2.79 = 45.56 (cierra exacto).
- Errores encontrados en el Excel original: pérdidas por causa leían solo la fila 39; TC real tecleado provocaba pérdidas negativas; COUNTA contaba 98 de 99 registros; JPH real apuntaba al JPH plan (GAP y costo daban 0); JPH máx/mín invertidos; la fórmula de caída de JPH (fila 12) no cerraba exacto con el JPH real.
- Paro programado: se asume fuera del tiempo registrado (confirmar).

## Man Machine Chart — CONCLUIDO (2026-11-11)
Objetivo: ver el recorrido del operador contra el tiempo ciclo de las máquinas. Partes: llenado → gráfica → indicadores (todo validado por Angel).

Llenado (4 pasos, listo y validado por Angel 2026-11-11):
1. Información: Línea/celda* y Analista*, No. de parte, Fecha, Metros por paso (0.7, editable: pasos × metros = distancia por vuelta).
2. Estaciones, capturadas **en el orden en que camina el operador** (arrastrar o ▲▼ para reordenar). Tipos: Máquina, Estación manual (sopleteadora, mesa de inspección: sin TC de máquina), Entrada, Salida. Nada viene precargado.
   - Máquina: TC de máquina (de que cierra la puerta a que abre), TC plan opcional (GAP = TC plan − TC real).
   - **Gemelas / trillizas** (botones 1·2·3): una sola vuelta del operador; TC efectivo = promedio de las máquinas iguales ÷ cantidad (2 gemelas de 2.0 → 1.0).
   - Carga y descarga: 0.03 + 0.03 = 0.06 en máquina y estación manual; 0.03 en Entrada/Salida. Precargado, editable (pieza pesada sube).
   - Actividades manuales (sopleteo, inspección, calibración, registro, otra) marcadas **Fuera del ciclo** o **Durante el ciclo**.
   - Pasos hacia la siguiente estación (botones − / + grandes).
   - ⏱ junto a cada campo de tiempo; GAP solo en máquinas (en manuales se quitó).
3. Revisar tabla (Concentración de datos automática, editable; lo corregido queda en naranja): arranca en la máquina con el **TC efectivo más alto** y conserva el orden de la vuelta. Op. manual = carga/descarga + fuera del ciclo; Op. manual durante el TC aparte. Totales por vuelta: manual, pasos, metros.
4. Layout: cuadrícula (filas/columnas) acomodada en U; flechas siguen el recorrido con los pasos. Arrastrar a casilla libre = mover y **entra en el recorrido donde quedó** (inserción más barata, distancia en línea recta); soltar sobre otra = intercambiar en dibujo y en la vuelta. Tocar una casilla libre (+) agrega Máquina / Estación manual / Entrada / Salida ahí mismo.
- Pruebas automáticas: 9 casos (incluye el caso de Angel de la estación manual entre Máquina 3 y 4).

Gráfica (paso 5): representa **solo la caminata**, igual que el VBA de Angel: renglón por estación desde la de TC más alto; línea negra = operador trabajando; punteada azul = máquina corriendo desde que termina la carga; diagonal delgada = caminata (**pasos × 0.01 min, estándar fijo**); escalón = manual durante el ciclo; regreso a la primera estación; cuadro arriba = ciclo del operador. La escala se ajusta sola (el 166.67 % del Excel era solo escala de dibujo). Validado: con el 0.6 del Excel da su 1.17.
Cálculos (fuera de la gráfica): ciclo del operador = Σ manual + Σ durante + pasos × 0.01; necesita cada máquina = su manual + su TC efectivo; **ciclo real de la celda** = el mayor; espera del operador = celda − operador; ocio de máquina = celda − lo que necesita. Ejemplo corregido: operador 0.63, celda 1.18 (Máquina 3), espera 0.55. OPER/CELDA/espera/ocio se quitaron del dibujo (saturaban); se usarán como KPIs.

Indicadores (debajo de la gráfica). **Sin dinero en el Man Machine** (el costo vive solo en el Speed Trial): solo piezas y tiempos. Información agrega TC objetivo de la línea, OEE plan (85 %, editable), horas por día (22.5), días por semana (6), semanas por mes (4).
- JPH real = 60 ÷ ciclo de la celda vs **JPH plan = (60 ÷ TC objetivo) × OEE plan** (igual que el Speed Trial); piezas perdidas por hora = JPH plan − JPH real, proyectadas hora/día/semana/mes/año.
- **La espera del operador NO son piezas perdidas** (la celda la limita la máquina): son horas-hombre sin trabajo = espera ÷ ciclo de la celda × horas; proyección hora/día/semana/mes/año.
- Ocupación de máquinas = TC de cada máquina ÷ TC objetivo; barras con línea de objetivo y de promedio; en rojo las que pasan del objetivo.
- Ejemplo (TC objetivo 1.10, OEE 85 %): JPH real 50.85 vs plan 46.36 → +4.49 arriba del plan; espera 46.6 % = 10.5 h-h/día; ocupación promedio 86.0 %, Máquina 3 en 101.8 %. Con TC objetivo 0.95 se pierden 2.84 pz/h.
- Pruebas: 19 casos en total del Man Machine.

## SMED — CONCLUIDO (2026-11-11; propuesta por Claude, validada por Angel)
Base: método SMED público (Shingo). Sin material de empleadores; ejemplo ficticio (cambio de dado en prensa, 11 pasos, 44 min). Sin dinero: solo tiempos y piezas.
1. Información: Línea/máquina* y Analista*, modelo que sale → que entra, personas en el cambio, fecha. Opcionales para proyecciones: TC objetivo, cambios por semana, semanas por mes (4).
2. Registro: cronómetro del cambio real (última pieza buena → primera pieza buena). Botones rápidos por paso (preparar/buscar herramienta, traslado, aflojar, quitar/colocar herramental, apretar, ajuste, primera pieza/inspección, limpieza, espera, otro) con categoría; "Terminar paso" / "Terminar cambio"; tabla editable (descripción, categoría, tiempo).
3. Análisis: cada paso Interno (máquina parada) / Externo (máquina corriendo) / Eliminar, con tiempo mejorado opcional. Sugerencia por categoría: Preparación y Búsqueda/traslado → Externo; Espera → Eliminar; resto → Interno. El analista decide.
4. Resultados: paro propuesto = Σ internos (con tiempo mejorado); reducción vs paro actual; meta SMED < 10 min; piezas que se dejan de hacer por cambio = paro ÷ TC; recuperadas = reducción ÷ TC; horas y piezas recuperadas por semana/mes/año (× cambios por semana). Gráficas: barras actual (interno/externo/eliminado) vs propuesto con línea de meta 10 min; tiempo por categoría.
- Pruebas: 6 casos (44 → 24.5 con la sugerencia; 26 con las decisiones del ejemplo).
- Pendiente para después: diagrama de espagueti.

## Cálculo de personal (headcount) — CONCLUIDO (2026-11-11)
Sección propia del menú ("Cálculo de personal"; en teléfono, pestaña "Personal"). Base: formato y VBA propios de Angel (headcount_sheet, v1.13), con datos ficticios.
Estructura en 3 niveles: **Cálculo** (un área, p. ej. MAQUINADO, por año fiscal) → **12 meses** (abril a marzo; FY27 = abr 2026 – mar 2027) → **renglones** por mes (sublíneas: Línea 1…8 en maquinado, por modelo en fundición, uno en ensamble). Cada mes tiene sus propios renglones (personal e indirectos pueden variar mes a mes); "Copiar del mes anterior" para no recapturar.
Por renglón: nombre, parte, proceso, días, horas/día, TPM (h/día), domingos, JPH plan (capturado), OEE plan (solo visual), volumen, esquema A/B/C (1/2/3 grupos), operadores, líderes, supervisores (por grupo), indirectos TPM/proyectos/otros.
Fórmulas (todas se muestran como KPI):
- TC = (60 ÷ JPH) × OEE (visual, no afecta el HC).
- Horas disponibles = días × (h/día − TPM) + domingos × h/día (domingos sin TPM).
- Horas requeridas = volumen ÷ JPH; % ocupación = requeridas ÷ disponibles; capacidad máxima = disponibles × JPH; **GAP = capacidad − volumen (positivo = sobra capacidad)** — se corrigió el texto del entrenamiento.
- Min-hombre por pieza (Line Actual Time) = (60 ÷ JPH) × (operadores + líderes); Actual Time = LAT ÷ ocupación; HH requeridas = volumen × LAT ÷ 60; horas por persona = disponibles ÷ grupos.
- **HC por volumen = ⌈personas directas por grupo⌉ × grupos + supervisores × grupos + indirectos** (redondeo por grupo, cambio vs Excel).
- HC por esquema = (op + líd + sup) × grupos + indirectos. Meta = ⌈HC esquema × (1 − % reducción)⌉, 5 % anual por cálculo.
- Total del mes = suma de renglones; ocupación del mes ponderada por horas.
- Validado con el Excel: enero 25 / 28 / 27, febrero 21 / 27 / 26. Pruebas: 7 casos.
Captura: tipo de área ENSAMBLE / MAQUINADO / FUNDICIÓN / OTRO (con OTRO se escribe el área); volumen con coma de miles; "Resumen anual" al final de la pantalla de Meses.
Resumen anual:
- 8 KPI en pares (4 × 2 en laptop/tablet, 2 × 4 en teléfono): % ocupación promedio, LAT promedio, Actual Time promedio, piezas por persona promedio (volumen ÷ HC esquema); y del último mes: meta de reducción (esquema − meta), % de afectación, personas arriba del volumen (esquema − volumen), holgura de capacidad (GAP ÷ capacidad).
- LAT del área ponderado = HH totales × 60 ÷ volumen total; AT = LAT ÷ ocupación.
- Meta de reducción por renglón redondeando hacia arriba (como el Excel): 66 → 64 en el ejemplo.
- Gráficas: HC por mes (volumen vs esquema + meta), % de ocupación por mes, **personal que agrega valor (operadores + líderes) vs afectación (supervisores, TPM, proyectos, otros)** sobre la plantilla del esquema, con alerta en rojo arriba de 35 % (umbral confirmado por Angel), y **trazabilidad por línea** (JPH plan, TC, OEE, LAT, Actual Time, % ocupación) con una serie por renglón.
- Tabla por mes con reducir, LAT, Actual Time y afectación. Pruebas: 11 casos.

## Usuarios
- Roles = permisos, no tipos de usuario: Analista y Capturista. Una persona puede tener los dos.

## Diseño
- Fondo claro y cálido con cuadrícula de papel milimétrico; vidrio claro con moderación.
- IBM Plex Sans + IBM Plex Mono (números tabulares). Naranja #C2410C = acción principal / innecesario / pérdida; tinta #1B2430; azul #1D5FA8 = necesario / ventaja; rojo #B42318 solo para eliminar; línea roja = tiempo disponible. En gráficas del Speed Trial: rojo = arriba del objetivo / pérdida, verde = en/abajo / ganancia (pedido de Angel).
- Laptop: menú lateral contraíble (Inicio, Estudios de tiempos, Configuración) + barra superior. Tablet: menú lateral solo con íconos. Teléfono: barra inferior (Inicio, Estudios, botón central naranja, Más).
- Botones principales arriba, donde el usuario no tenga que desplazarse. Botones ≥ 48 px; contraste ≥ 4.5:1.
- Canvas de la carcasa (referencia): https://claude.ai/artifact/3m1eVYym44bfsqv9oLByaz

## Tablero del Analista — 4 KPI (se diseña al final)
1. Operaciones sobre takt, con el cuello de botella destacado.
2. Capacidad teórica (pzs/h).
3. Eficiencia de balanceo (%).
4. Estudios vencidos.

## Datos
- Jerarquía planta → línea → estación desde el día uno.

## Hoja de ruta acordada (nov 2026)
- Siguiente formato: **Actual Time** (Angel manda su Excel/VBA y su explicación → comentarios → validar en chat → construir). Después: Eficiencia compuesta y Diagrama de flujo de proceso (símbolos ASME; idea de armarlo solo desde DS/SMED).
- Un formato a la vez, sin adelantarse. Menú agrupado propuesto (sin confirmar): Inicio · Estudios de tiempos · Capacidad y eficiencia · Herramientas · Aprende · Configuración.
- Después de esos tres: guardado. Pagos (suscripción, sin publicidad), Inicio y diseño final al último.

## Dónde vive el código
- **Fuente de verdad: GitHub `angelserna23/takt-app` (rama main).** Ver CONTINUAR.md para retomar en un chat nuevo. Un commit al cerrar cada chat.
- App publicada: artifact https://claude.ai/artifact/PtmQXuoBcXnPbmmhkWdK8f (slug b963594a-ed0b-4bfe-9897-a3ee86914094); se republica sobre el mismo slug.
- Respaldo en el proyecto: takt-app/codigo-calculos-1.md y -2.md (cálculos y pruebas al 2026-11-11).

## Pendientes
- Tiempo estándar: en espera.
- Qué va en el menú en lugar de OEE / Costo MO (Angel lo define).
- Al final: mejoras extra por formato (incluye la idea grande de Angel para Work Element), paleta de colores y UX/UI.
- Guardado de estudios y exportación a PDF/Excel (al final, para todos los formatos).

- Botón ‹ Todos los estudios junto al título en todos los formatos (solo flecha en tablet/teléfono).
- Botón eliminar (con confirmación) en cada tarjeta de la lista de estudios, en todos los formatos.
