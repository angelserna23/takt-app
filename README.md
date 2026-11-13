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
- Cálculo de personal (headcount): listo.
- Actual Time + Eficiencia compuesta y Diagramas de flujo: listos.
- Aprende (tutoriales con demo en vivo y modo guiado): los 9 listos (6 estudios, Personal, Actual Time + Eficiencia compuesta, Diagramas de flujo).

## Correr las pruebas

```bash
for t in test dstest wetest sttest mmtest smtest pctest attest ectest dftest tuttest; do node parts/$t.js; done
# Pantallas (requiere: pip install playwright && playwright install chromium)
python3 tests/smoke/smoke_pc.py
```

Regla: si un cálculo cambia en `index.html`, se actualiza también su `parts/*calc.js` y su prueba.
