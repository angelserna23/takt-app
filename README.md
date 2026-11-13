# Takt — App de tiempos y movimientos

App para ingenieros industriales (PWA en un solo archivo HTML/JS/CSS): estudios de tiempos, capacidad y eficiencia. Tablet como dispositivo principal; también teléfono y laptop. Datos ficticios; nada de código ni datos de empleadores.

Prototipo publicado: https://claude.ai/artifact/PtmQXuoBcXnPbmmhkWdK8f

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | La app completa (se publica tal cual como artifact). |
| `parts/*calc.js` | Cálculos puros por formato (copias de lo que vive dentro de `index.html`). |
| `parts/*test.js` | Pruebas automáticas de cada cálculo (Node, sin dependencias). |
| `parts/` (resto) | Piezas con las que se armó `index.html` en las primeras versiones. Históricas: la fuente actual es `index.html`. |
| `tests/smoke/` | Pruebas de pantalla con Playwright (Python). |
| `docs/decisiones-mvp.md` | Todas las decisiones de diseño y cálculo, formato por formato. |
| `CONTINUAR.md` | Cómo retomar el trabajo en un chat nuevo. |

## Formatos

- Estudios de tiempos: Work Sampling, Delay Study, Work Element, Speed Trial, Man Machine Chart, SMED (todos listos).
- Takt y balanceo de línea: takt + estaciones traídas de los Work Element + balanceo contra el takt: listo.
- Hoja de trabajo estándar: secuencia con símbolos ASME y puntos clave, flujo automático, impresión en una página: lista.
- Diagramas: Flujo de proceso + Diagrama de espagueti (recorrido sobre el layout, metros por ciclo, turno y día): listo.
- Cálculo de personal (headcount): listo.
- Actual Time + Eficiencia compuesta y Diagramas de flujo: listos.
- Aprende (tutoriales con demo en vivo y modo guiado): los 12 listos (6 estudios, Takt y balanceo, Hoja estándar, Espagueti, Personal, Actual Time + Eficiencia compuesta, Diagramas de flujo).
- Guardado: almacén en el navegador (IndexedDB) con versiones y migraciones; «Guardar» explícito; jerarquía Planta → Área → Línea → Estación en Configuración y en cada estudio.

## Correr las pruebas

```bash
bash tests/correr_pruebas.sh          # todo: cálculos + guardado + los 12 tutoriales en laptop, tablet y teléfono (≈ 5 min)
bash tests/correr_pruebas.sh rapido   # solo cálculos
# Requiere: pip install playwright && playwright install chromium
```

Se corre completo antes de cada commit. Si cambia una pantalla y un tutorial ya no encuentra su botón, dice cuál paso de cuál tutorial.

Regla: si un cálculo cambia en `index.html`, se actualiza también su `parts/*calc.js` y su prueba.
