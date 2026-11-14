#!/usr/bin/env bash
# Rutina de pruebas de Takt: se corre después de cualquier cambio y siempre antes de cada commit.
#   1) Cálculos (Node): todos los formatos + guiones de Aprende.
#   2) Guardado (Playwright): los 12 formatos se guardan, se recargan idénticos; cambios, descartar, borrar, tutoriales sin rastro.
#   2b) Inicio (Playwright): historial de ejemplo (semilla) y tablero.
#   3) Tutoriales de Aprende (Playwright): los 12, en demo y guiado, en laptop, tablet y teléfono (en paralelo).
#      Si una pantalla cambió, dice qué paso de qué tutorial ya no encuentra su botón.
# Uso: bash tests/correr_pruebas.sh        (todo)
#      bash tests/correr_pruebas.sh rapido (solo cálculos)
cd "$(dirname "$0")/.." || exit 1
fallas=0

echo "== Cálculos"
for t in test dstest wetest sttest mmtest smtest tktest hstest sptest pctest attest ectest dftest tuttest storetest intest i18ntest; do
  if node parts/$t.js >/tmp/takt_$t.txt 2>&1; then echo "  ok   $t"; else echo "  FALLA $t"; tail -5 /tmp/takt_$t.txt; fallas=1; fi
done

if python3 tools/i18n_build.py --check >/tmp/takt_i18n_build.txt 2>&1; then echo "  ok   diccionario (i18n/*.txt = index.html)"; else echo "  FALLA diccionario"; tail -5 /tmp/takt_i18n_build.txt; fallas=1; fi

[ -d tools/node_modules ] || (cd tools && npm install --silent >/dev/null 2>&1)   # acorn, solo la primera vez
if node tools/i18n_faltantes.js >/tmp/takt_i18n_falt.txt 2>&1; then echo "  ok   inglés: cobertura del diccionario"; else echo "  FALLA inglés: textos sin traducción"; tail -12 /tmp/takt_i18n_falt.txt; fallas=1; fi

if [ "$1" != "rapido" ]; then
  echo "== Guardado y tutoriales de Aprende (en paralelo; tarda unos minutos)"
  python3 tests/smoke/smoke_store.py >/tmp/takt_store.txt 2>&1 &
  python3 tests/smoke/smoke_inicio.py >/tmp/takt_inicio.txt 2>&1 &
  python3 tests/smoke/smoke_i18n.py >/tmp/takt_i18n.txt 2>&1 &
  for d in lap phone; do SOLO=$d python3 tests/smoke/smoke_en.py >/tmp/takt_en_$d.txt 2>&1 & done
  SOLO=phone LANG_APP=en python3 tests/smoke/smoke_tut.py >/tmp/takt_tut_en.txt 2>&1 &
  for d in lap tab phone; do SOLO=$d python3 tests/smoke/smoke_tut.py >/tmp/takt_tut_$d.txt 2>&1 & done
  wait
  if grep -q "^OK: guardado" /tmp/takt_store.txt; then echo "  ok   guardado (12 formatos)"; else echo "  FALLA guardado"; grep -E "FALLA|Error" /tmp/takt_store.txt | head -5; fallas=1; fi
  if grep -q "^OK: inicio" /tmp/takt_inicio.txt; then echo "  ok   inicio (historial de ejemplo y tablero)"; else echo "  FALLA inicio"; grep -E "FALLA|Error" /tmp/takt_inicio.txt | head -5; fallas=1; fi
  for d in lap phone; do
    if grep -q "^OK: inglés sin español" /tmp/takt_en_$d.txt; then echo "  ok   inglés sin español · $d"; else echo "  FALLA inglés · $d"; grep -E "FALLA|Error" /tmp/takt_en_$d.txt | head -8; fallas=1; fi
  done
  if grep -q "^OK: tutoriales" /tmp/takt_tut_en.txt; then echo "  ok   tutoriales en inglés · phone"; else echo "  FALLA tutoriales en inglés"; grep -E "FALLA|Error" /tmp/takt_tut_en.txt | head -5; fallas=1; fi
  if grep -q "^OK: idioma" /tmp/takt_i18n.txt; then echo "  ok   idioma (capa de traducción)"; else echo "  FALLA idioma"; grep -E "FALLA|Error" /tmp/takt_i18n.txt | head -5; fallas=1; fi
  for d in lap tab phone; do
    if grep -q "^OK: tutoriales" /tmp/takt_tut_$d.txt && ! grep -q "FALLA" /tmp/takt_tut_$d.txt; then echo "  ok   tutoriales · $d"
    else echo "  FALLA tutoriales · $d"; grep -E "FALLA|Error" /tmp/takt_tut_$d.txt | head -5; fallas=1; fi
  done
fi

if [ $fallas = 0 ]; then echo "== TODO PASA"; else echo "== HAY FALLAS: no subir"; fi
exit $fallas
