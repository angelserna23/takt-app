# Hoja de trabajo estándar — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Módulo aislado «Hoja estándar»: encabezado, secuencia con símbolos ASME y puntos clave, y la hoja final (tablet + impresión carta horizontal en una página).

**Architecture:** Igual que los demás módulos de `index.html`: estado `HS`, vistas `vHSList`/`vHS`, eventos delegados, funciones puras en el bloque `<hs-pure>` probadas en Node. Reusa `DF_SYM`/`dfIcon` (solo dibujo) y el almacén (`STORE_SCHEMA`). No lee datos de ningún otro módulo.

**Tech Stack:** HTML/CSS/JS en un archivo, Node (cálculos), Playwright (guardado, tutorial, PDF).

**Spec:** `docs/superpowers/specs/2026-11-13-hoja-trabajo-estandar-design.md`

## Global Constraints
- Aislado: no trae ni liga datos de otros módulos (takt capturado a mano).
- Clave `hs`, `STORE_SCHEMA.hs = 1`; `UB_DEEP.hs = 4`, `UB_REQ.hs = 4` (hasta estación).
- Tiempos en minutos decimales; texto en MAYÚSCULAS (regla global ya existente).
- Símbolos de paso: `op`, `insp`, `tra`, `dem`, `alm` (por omisión `op`). Puntos clave: `seg`, `cal`, `erg`.
- Impresión: `@page { size: letter landscape }`, una página; aviso con más de 18 pasos.

## Review Focus
1. Paso sin tiempo o con texto → cuenta 0, la hoja no muestra NaN.
2. Takt vacío → % del takt y holgura «—», sin dividir entre cero.
3. 25 pasos con descripciones largas → el PDF sigue en una página.
4. Teléfono: filas de la secuencia sin desbordar de lado.
5. Reabrir una hoja guardada → mismos pasos, símbolos, puntos clave y EPP.

---

### Task 1: Cálculos puros
**Files:** Modify `index.html` (bloque `<hs-pure>`); Create `parts/hstest.js`; Modify `tests/correr_pruebas.sh`.
**Produces:** `hsNum(v)`, `hsCalc(d) -> {tc, takt, pct, holg, over, n, res:{op|insp|tra|dem|alm:{n,t}}, kp:{seg,cal,erg}}`.
- [ ] Prueba: ejemplo de 8 pasos (Σ 1.12 min, takt 1.20 → 93.3 %, holgura 0.08); resumen ASME por símbolo; puntos clave por tipo; vacíos = 0; takt vacío → pct 0, over false.
- [ ] Correr `node parts/hstest.js` → falla; implementar; → `OK`.

### Task 2: Módulo (lista, encabezado, secuencia, hoja) + integración
**Files:** Modify `index.html` (icono, NAV, rutas, `sectionOf`, «Más», almacén, jerarquía, sandbox de tutoriales, CSS).
**Consumes:** `hsCalc`, `DF_SYM`, `dfIcon`, `ubicPicker`, `storeSave`.
- [ ] Pasos 01 Encabezado (operación* y analista elaboró*), 02 Secuencia (agregar, subir/bajar, quitar, símbolo, tiempo, puntos clave), 03 Hoja.
- [ ] EPP con íconos propios: lentes, guantes, tapones, casco, zapato, careta, mascarilla, mandil.
- [ ] Ejemplo ficticio de 8 pasos (botón «Cargar ejemplo»).

### Task 3: Impresión
- [ ] `@media print` que deja solo `.hssheet`; `hsPrintFit()` escala a una página (llamado en `beforeprint`, expuesto como `window.TaktHS.fit`).
- [ ] Prueba en `smoke_store.py`: PDF carta horizontal de 1 página con el ejemplo y con 25 pasos largos.

### Task 4: Tutorial 11 + pruebas de pantalla
- [ ] Tutorial `hs` (grupo `proc`), `tuttest.js` y `smoke_tut.py` a 11 tarjetas; `smoke_store.py` con `hs` (guardar, recargar, idéntico).
- [ ] `bash tests/correr_pruebas.sh` → `TODO PASA`.

### Task 5: Documentación, publicación y commit
- [ ] `decisiones-mvp.md`, `CONTINUAR.md`, `README.md`; publicar en el artifact; commit + push.
