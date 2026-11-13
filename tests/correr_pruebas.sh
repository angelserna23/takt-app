#!/usr/bin/env bash
# Rutina de pruebas de Takt: se corre después de cualquier cambio y siempre antes de cada commit.
#   1) Cálculos (Node): todos los formatos + guiones de Aprende.
#   2) Tutoriales de Aprende (Playwright): los 9, en demo y guiado, en laptop, tablet y teléfono (en paralelo).
#      Si una pantalla cambió, dice qué paso de qué tutorial ya no encuentra su botón.
# Uso: bash tests/correr_pruebas.sh        (todo)
#      bash tests/correr_pruebas.sh rapido (solo cálculos)
cd "$(dirname "$0")/.." || exit 1
fallas=0

echo "== Cálculos"
for t in test dstest wetest sttest mmtest smtest pctest attest ectest dftest tuttest; do
  if node parts/$t.js >/tmp/takt_$t.txt 2>&1; then echo "  ok   $t"; else echo "  FALLA $t"; tail -5 /tmp/takt_$t.txt; fallas=1; fi
done

if [ "$1" != "rapido" ]; then
  echo "== Tutoriales de Aprende (laptop, tablet y teléfono en paralelo; tarda unos minutos)"
  for d in lap tab phone; do SOLO=$d python3 tests/smoke/smoke_tut.py >/tmp/takt_tut_$d.txt 2>&1 & done
  wait
  for d in lap tab phone; do
    if grep -q "^OK: tutoriales" /tmp/takt_tut_$d.txt && ! grep -q "FALLA" /tmp/takt_tut_$d.txt; then echo "  ok   tutoriales · $d"
    else echo "  FALLA tutoriales · $d"; grep -E "FALLA|Error" /tmp/takt_tut_$d.txt | head -5; fallas=1; fi
  done
fi

if [ $fallas = 0 ]; then echo "== TODO PASA"; else echo "== HAY FALLAS: no subir"; fi
exit $fallas
