# Prueba «sin español» de la app en inglés (Angel, 2026-11-13: enfoque A con prueba que falla si queda español).
#
# Pasada 1 — todo en inglés: con EN corre los 12 tutoriales en demo y revisa la pantalla en cada paso, incluido lo que
#   marca translate="no" (los datos que escribe el bot también deben salir en inglés), y visita todas las rutas.
# Pasada 2 — datos del usuario en español: carga el historial de ejemplo (en español, a propósito), recorre listas e
#   Inicio y genera los 12 reportes PDF. Aquí el español solo se permite dentro de translate="no" (datos del usuario),
#   y se comprueba que esos datos NO se tradujeron.
#
# Detector: acentos y ¿¡«», o una palabra que solo existe en el español del diccionario, o una palabra común del español.
# Uso: python3 tests/smoke/smoke_en.py            (laptop y teléfono)
#      SOLO=lap python3 tests/smoke/smoke_en.py
import json, os, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[2]
IDX = 'file://' + str(R / 'index.html')
from playwright.sync_api import sync_playwright

H = (R / 'index.html').read_text(encoding='utf8')
DIC = json.loads(re.search(r'/\*<i18n-dic>\*/(.*?)/\*</i18n-dic>\*/', H, re.S).group(1))
TPL = json.loads(re.search(r'/\*<i18n-tpl>\*/(.*?)/\*</i18n-tpl>\*/', H, re.S).group(1))
W = lambda t: set(x.lower() for x in re.findall(r"[^\W\d_]+", t))
ENW = set().union(*[W(v) for v in list(DIC.values()) + [b for a, b in TPL]])
NEU = set(l.strip().lower() for l in (R / 'i18n' / 'neutras.txt').read_text(encoding='utf8').splitlines() if l.strip() and not l.startswith('#'))
LEX = {w for w in set().union(*[W(k) for k in list(DIC) + [a for a, b in TPL]]) - ENW - NEU if len(w) > 1}
COMUNES = {'de', 'del', 'la', 'las', 'los', 'el', 'con', 'para', 'por', 'que', 'sin', 'una', 'más', 'al', 'se', 'su', 'sus', 'lo', 'un', 'es', 'y'}
ESW = LEX | COMUNES

def espanol(s):
    if s.strip() in ('ES', 'EN'): return False   # el selector de idioma
    if re.search(r'[áéíóúñ¿¡«»]', s, re.I): return True
    return bool(W(s) & ESW)

# Texto visible + atributos; con todo=True también lo que está dentro de translate="no"
JS_TXT = r"""(todo)=>{const out=[];const skip=todo?'script,style,textarea':'script,style,textarea,[translate="no"]';
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let t;
 while((t=w.nextNode())){const p=t.parentElement;if(!p||p.closest(skip))continue;const s=t.data.trim();if(!s)continue;
  if(!p.getClientRects().length)continue;out.push(s);}
 document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{if(!todo&&e.closest('[translate="no"]'))return;
  if(!e.getClientRects().length)return;['placeholder','aria-label','title'].forEach(a=>{const v=e.getAttribute(a);if(v)out.push('@'+a+': '+v);});});
 return out;}"""

DEV = {'lap': (1366, 900, False), 'phone': (390, 844, True)}
SOLO = os.environ.get('SOLO')
fallas = []

MAYUS = re.compile(r"[A-ZÁÉÍÓÚÑÜ0-9][A-ZÁÉÍÓÚÑÜ0-9 .,/()#+&'-]{2,}")
def revisar(pg, donde, todo, quitar=()):
    for s in pg.evaluate(JS_TXT, todo):
        t = s
        for u in quitar:
            if u in t: t = t.replace(u, ' ')
        if quitar: t = MAYUS.sub(' ', t)   # datos del usuario (se capturan en MAYÚSCULAS)
        if espanol(t):
            fallas.append(f'{donde} → {s[:150]}')

with sync_playwright() as p:
    b = p.chromium.launch()
    for dev, (w, h, mob) in DEV.items():
        if SOLO and SOLO != dev: continue
        errs = []
        # ---------- Pasada 1: tutoriales y rutas, todo en inglés ----------
        ctx = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(IDX + '#inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
        pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(200)
        tuts = ['ws', 'ds', 'we', 'st', 'mm', 'sm', 'pc', 'at', 'tk', 'hs', 'sp', 'df']
        for tid in tuts:
            pg.evaluate(f"TaktTut.start('{tid}','demo',20)")
            last = -1
            for _ in range(700):
                pg.wait_for_timeout(120)
                st = pg.evaluate('TaktTut.state()')
                if st and st.get('err'): fallas.append(f'{dev} tutorial {tid}: ERROR {st["err"]}'); break
                i = st['i'] if st else 'fin'
                if i != last: revisar(pg, f'{dev} · tutorial {tid} · paso {i}', True); last = i
                if not st or pg.evaluate('document.body.dataset.tut') == 'fin': break
            revisar(pg, f'{dev} · tutorial {tid} · fin', True)
            pg.evaluate('TaktTut.exit()'); pg.wait_for_timeout(200)
        for r in ['inicio', 'estudios', 'ws', 'ds', 'we', 'st', 'mm', 'sm', 'tk', 'hs', 'diag', 'df', 'sp', 'pc', 'at', 'at-planta', 'aprende', 'config',
                  'ws-nuevo', 'st-nuevo', 'mm-nuevo', 'sm-nuevo', 'tk-nuevo', 'hs-nuevo', 'df-nuevo', 'sp-nuevo', 'pc-nuevo', 'at-nuevo']:
            pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(250)
            revisar(pg, f'{dev} · ruta {r}', True)
        if dev == 'phone':
            pg.evaluate("location.hash='inicio'"); pg.wait_for_timeout(200)
            pg.locator('.fab').click(); pg.wait_for_timeout(300); revisar(pg, f'{dev} · hoja del cronómetro', True)
        ctx.close()
        # ---------- Pasada 2: historial de ejemplo en español + 12 PDF ----------
        ctx = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(IDX + '#inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
        pg.evaluate('TaktSeed.load()'); pg.reload(); pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
        pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(500)
        kinds = pg.evaluate('TaktRep.kinds()')
        # textos del usuario (para quitarlos de los atributos, que no pueden llevar translate="no")
        datos = set()
        def hojas(o):
            if isinstance(o, str):
                if len(o) >= 3: datos.add(o)
            elif isinstance(o, dict): [hojas(v) for v in o.values()]
            elif isinstance(o, list): [hojas(v) for v in o]
        for k in kinds: hojas(json.loads(pg.evaluate(f"TaktStore.dump('{k}')") or '[]'))
        quitar = sorted(datos, key=len, reverse=True)
        for r in ['inicio', 'estudios', 'ws', 'ds', 'we', 'st', 'mm', 'sm', 'tk', 'hs', 'df', 'sp', 'pc', 'at', 'at-planta', 'config']:
            pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(350)
            revisar(pg, f'{dev} · con historial · ruta {r}', False, quitar)
        vistos = pg.evaluate("[...document.querySelectorAll('#view [translate=\"no\"]')].length")
        for k in kinds:
            L = json.loads(pg.evaluate(f"TaktStore.dump('{k}')") or '[]')
            if not L: continue
            ok = pg.evaluate(f"TaktRep.build('{k}',{json.dumps(L[0]['id'])})"); pg.wait_for_timeout(300)
            if not ok: fallas.append(f'{dev} · PDF {k}: no se generó'); continue
            revisar(pg, f'{dev} · PDF {k}', False, quitar)
            css = pg.evaluate("[...document.querySelectorAll('style')].map(s=>s.textContent).join(' ')")
            for m in re.findall(r'content:"([^"]*)"', css):
                for u in quitar:
                    if u in m: m = m.replace(u, ' ')
                if espanol(m): fallas.append(f'{dev} · PDF {k} · pie de página → {m}')
            pg.evaluate('TaktRep.close()'); pg.wait_for_timeout(100)
        # los datos del usuario siguen en español (no se tradujeron)
        pg.evaluate("location.hash='inicio'"); pg.wait_for_timeout(400)
        es_usuario = pg.evaluate("[...document.querySelectorAll('[translate=\"no\"]')].map(e=>e.textContent).filter(t=>/[ÁÉÍÓÚÑáéíóúñ]|PLANTA|LÍNEA|ENSAMBLE|MAQUINADO/.test(t)).length")
        if es_usuario < 1: fallas.append(f'{dev} · los datos del historial (en español) no se ven como datos del usuario')
        if errs: fallas.append(f'{dev} · errores de JavaScript: {errs[:3]}')
        ctx.close()
        print(f'{dev}: {len(tuts)} tutoriales, rutas y {len(kinds)} reportes revisados')
    b.close()

# una línea por texto distinto (el primer lugar donde apareció)
vist, txt = [], set()
for f in fallas:
    k = f.split(' → ', 1)[-1]
    if k not in txt: txt.add(k); vist.append(f)
for f in vist[:int(os.environ.get('MAX', '150'))]: print('FALLA', f)
print('OK: inglés sin español' if not vist else f'HAY FALLAS: {len(vist)}')
sys.exit(1 if vist else 0)
