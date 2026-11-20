# Buscador del encabezado (12 formatos) y menú lateral contraído.
# Carga el historial de ejemplo (semilla) para tener estudios donde buscar.
import pathlib as _pl
from playwright.sync_api import sync_playwright
IDX = 'file://' + str(_pl.Path(__file__).resolve().parents[2] / 'index.html') + '#'
fallas = []
def check(c, msg):
    print(('OK   ' if c else 'FALLA ') + msg)
    if not c: fallas.append(msg)
SEMILLA = "Object.defineProperty(navigator,'webdriver',{get:()=>false})"

def pagina(b, w, h):
    ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=w < 1000); ctx.add_init_script(SEMILLA)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(IDX + 'inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.evaluate("TaktI18n.set('es')"); pg.wait_for_timeout(500)
    return ctx, pg, errs
def res(pg): return pg.eval_on_selector_all('#srchpanel .srchres', 'e=>e.map(x=>x.innerText.replace(/\\s+/g," "))')

with sync_playwright() as p:
    b = p.chromium.launch()
    # 1. Laptop: el campo del encabezado busca en los 12 formatos
    ctx, pg, errs = pagina(b, 1366, 900)
    check(pg.is_visible('#srchq') and not pg.is_visible('#srchbtn'), 'laptop: campo visible, sin lupa')
    pg.click('#srchq'); pg.wait_for_timeout(150)
    check('12 formatos' in pg.inner_text('#srchpanel'), 'al enfocar, explica qué se puede buscar')
    # toma el nombre de un estudio real de la semilla y búscalo sin acentos y en minúsculas
    nombre = pg.evaluate("TaktSrch.index().filter(x=>x.k==='st').map(x=>x.name).find(n=>n.split(' ').some(w=>w.length>4))")
    palabra = [w for w in nombre.split() if len(w) > 4][0]
    import unicodedata
    q = ''.join(c for c in unicodedata.normalize('NFD', palabra.lower()) if unicodedata.category(c) != 'Mn')
    pg.fill('#srchq', q); pg.wait_for_timeout(150)
    r = res(pg)
    check(len(r) >= 1 and any(palabra.upper() in x.upper() for x in r), f'«{q}» encuentra el estudio «{nombre}» ({len(r)} resultados)')
    check(len(r) <= 8, 'máximo 8 resultados en pantalla')
    # búsqueda por formato
    pg.fill('#srchq', 'smed'); pg.wait_for_timeout(150); r = res(pg)
    check(len(r) >= 1 and all(x.startswith('SM') for x in r), f'«smed» trae solo estudios SMED ({len(r)})')
    # búsqueda por contenido (operación/paso escrito adentro)
    dentro = pg.evaluate("(()=>{const it=TaktSrch.index().find(x=>x.k==='sm');return it.text.split('\\n').find(l=>l.split(' ').length>=3&&!it.name.includes(l))||''})()")
    pg.fill('#srchq', dentro.lower()); pg.wait_for_timeout(150)
    check(bool(dentro) and 'Coincide en' in pg.inner_text('#srchpanel'), f'busca dentro del estudio y dice dónde coincidió («{dentro}»)')
    pg.fill('#srchq', 'zzqqxx'); pg.wait_for_timeout(150)
    check('Sin resultados' in pg.inner_text('#srchpanel'), 'sin coincidencias: lo dice')
    # elegir con teclado: Enter abre el primero y el buscador se cierra
    pg.fill('#srchq', 'smed'); pg.wait_for_timeout(150); pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
    check(pg.evaluate('location.hash').startswith('#sm'), f'Enter abre el primer resultado ({pg.evaluate("location.hash")})')
    check(pg.is_hidden('#srchpanel') and pg.input_value('#srchq') == '', 'al abrir, el buscador se cierra y se limpia')
    # Escape cierra
    pg.click('#srchq'); pg.fill('#srchq', 'linea'); pg.wait_for_timeout(150); pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    check(pg.is_hidden('#srchpanel'), 'Escape cierra el panel')
    # clic con el mouse en un resultado
    pg.click('#srchq'); pg.fill('#srchq', 'work element'); pg.wait_for_timeout(150)
    pg.click('#srchpanel .srchres >> nth=0'); pg.wait_for_timeout(500)
    check(pg.evaluate('location.hash').startswith('#we') or pg.evaluate('location.hash').startswith('#ds'), f'clic en un resultado abre el estudio ({pg.evaluate("location.hash")})')
    # inglés: los textos del panel no quedan en español
    pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(300)
    pg.click('#srchq'); pg.wait_for_timeout(200); t = pg.inner_text('#srchpanel')
    check('all 12 formats' in t, f'inglés: mensaje inicial traducido ({t[:60]})')
    pg.fill('#srchq', 'zzqqxx'); pg.wait_for_timeout(200); t = pg.inner_text('#srchpanel')
    check('No results' in t and 'Sin resultados' not in t, f'inglés: sin resultados traducido ({t[:60]})')
    pg.fill('#srchq', 'headcount'); pg.wait_for_timeout(200); r = res(pg)
    check(len(r) >= 1 and all(x.startswith('PC') for x in r), f'inglés: «headcount» encuentra Cálculo de personal ({len(r)})')
    pg.keyboard.press('Escape'); pg.evaluate("TaktI18n.set('es')"); pg.wait_for_timeout(200)
    # 2. Menú contraído: sin texto de la marca, nada se sale ni se aplasta
    pg.goto(IDX + 'inicio'); pg.wait_for_timeout(200); pg.click('#collapse'); pg.wait_for_timeout(400)
    st = pg.evaluate("""(()=>{const s=document.querySelector('.side');const r=s.getBoundingClientRect();const lbl=document.querySelector('.brand .lbl');
      const fuera=[...s.querySelectorAll('*')].filter(e=>{const q=e.getBoundingClientRect();return q.width&&(q.right>r.right+1||q.left<r.left-1)}).length;
      return {w:r.width,lbl:getComputedStyle(lbl).display,fuera,bar:s.offsetWidth-s.clientWidth-parseFloat(getComputedStyle(s).borderLeftWidth)-parseFloat(getComputedStyle(s).borderRightWidth)}})()""")
    check(st['w'] <= 90 and st['lbl'] == 'none' and st['fuera'] == 0 and st['bar'] == 0, f'menú contraído: angosto, sin texto de marca, sin barra que lo aplaste ({st})')
    pg.set_viewport_size({'width': 1366, 'height': 600}); pg.wait_for_timeout(300)
    st = pg.evaluate("(()=>{const s=document.querySelector('.side');return {bar:s.offsetWidth-s.clientWidth-parseFloat(getComputedStyle(s).borderLeftWidth)-parseFloat(getComputedStyle(s).borderRightWidth),lbl:getComputedStyle(document.querySelector('.brand .lbl')).display}})()")
    check(st['bar'] == 0 and st['lbl'] == 'none', f'menú contraído en pantalla baja: igual de limpio ({st})')
    pg.screenshot(path='/tmp/buscar_menu_col.png', clip={'x': 0, 'y': 0, 'width': 400, 'height': 600})
    pg.click('#collapse'); pg.wait_for_timeout(300)
    check(pg.evaluate("getComputedStyle(document.querySelector('.brand .lbl')).display") != 'none', 'al expandir regresa el texto de la marca')
    check(not errs, f'laptop: sin errores de JavaScript {errs[:2]}'); ctx.close()

    # 3. Tablet y teléfono: la lupa abre el campo en su propio renglón; nada se sale de la pantalla
    for w, h, nom in [(820, 1180, 'tablet'), (390, 844, 'teléfono')]:
        ctx, pg, errs = pagina(b, w, h)
        check(pg.is_visible('#srchbtn') and not pg.is_visible('#srchq'), f'{nom}: lupa visible, campo oculto')
        pg.click('#srchbtn'); pg.wait_for_timeout(250)
        check(pg.is_visible('#srchq') and pg.evaluate("document.activeElement.id") == 'srchq', f'{nom}: la lupa abre el campo y pone el cursor')
        pg.fill('#srchq', 'linea'); pg.wait_for_timeout(200)
        box = pg.evaluate("(()=>{const r=document.getElementById('srchpanel').getBoundingClientRect();const bb=document.querySelector('.tabbar,.mobnav,.bottombar,nav.bnav');const top=bb&&getComputedStyle(bb).display!=='none'?bb.getBoundingClientRect().top:innerHeight;return {l:r.left,r:r.right,b:Math.round(r.bottom),bar:Math.round(top),n:document.querySelectorAll('#srchpanel .srchres').length}})()")
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(box['n'] >= 1 and box['l'] >= 0 and box['r'] <= w and sw <= w and box['b'] <= box['bar'], f'{nom}: resultados dentro de la pantalla ({box}, ancho {sw})')
        pg.screenshot(path=f'/tmp/buscar_{nom}.png')
        pg.click('#srchpanel .srchres >> nth=0'); pg.wait_for_timeout(500)
        check(not pg.is_visible('#srchq') and pg.is_hidden('#srchpanel'), f'{nom}: al elegir, el campo se vuelve a esconder')
        pg.click('#srchbtn'); pg.wait_for_timeout(150); pg.click('#srchbtn'); pg.wait_for_timeout(150)
        check(not pg.is_visible('#srchq'), f'{nom}: la lupa también lo cierra')
        check(not errs, f'{nom}: sin errores de JavaScript {errs[:2]}'); ctx.close()
    b.close()
if fallas: print(f'HAY FALLAS: {len(fallas)}')
else: print('OK: buscador y menú contraído')
