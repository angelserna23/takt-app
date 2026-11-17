# Guardado Fase 3: avisos de almacenamiento (no disponible, lleno, casi lleno) y ajustes de vista recordados.
# Las fallas del navegador se simulan con scripts de arranque (add_init_script): así se prueban sin llenar un disco de verdad.
import json, pathlib as _pl
from playwright.sync_api import sync_playwright
IDX = 'file://' + str(_pl.Path(__file__).resolve().parents[2] / 'index.html') + '#'
fallas = []
def check(c, msg):
    print(('OK   ' if c else 'FALLA ') + msg)
    if not c: fallas.append(msg)

SEMILLA = "Object.defineProperty(navigator,'webdriver',{get:()=>false})"   # carga el historial de ejemplo
SIN_ALMACEN = "IDBFactory.prototype.open=function(){throw new DOMException('bloqueado','SecurityError')}"
LLENO = """window.__lleno=false;const _put=IDBObjectStore.prototype.put;
IDBObjectStore.prototype.put=function(...a){if(window.__lleno)throw new DOMException('sin espacio','QuotaExceededError');return _put.apply(this,a);}"""
CASI = """navigator.storage.estimate=()=>Promise.resolve({usage:90e6,quota:100e6});
navigator.storage.persisted=()=>Promise.resolve(false);navigator.storage.persist=()=>Promise.resolve(window.__concede=true)"""

def pagina(b, scripts=(), w=1280, h=900, ctx=None):
    ctx = ctx or b.new_context(viewport={'width': w, 'height': h}, has_touch=w < 800)
    for s in scripts: ctx.add_init_script(s)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(IDX + 'inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.wait_for_timeout(400)
    return ctx, pg, errs
def barra(pg): return pg.evaluate("(()=>{const e=document.getElementById('storebar');return {vis:!e.hidden&&e.offsetHeight>0,cls:e.className,txt:e.innerText,x:!!e.querySelector('[data-storebarx]')}})()")

with sync_playwright() as p:
    b = p.chromium.launch()

    # 1. Ajustes de vista: se recuerdan al recargar
    ctx, pg, errs = pagina(b, [SEMILLA])
    check(pg.evaluate('TaktStore.aviso()') is None, 'todo bien: sin franja')
    # El historial de ejemplo trae un solo FY: se guarda una copia como FY anterior para poder elegir
    pg.evaluate("(()=>{const T=TaktStore._t;const a=T.storeBox('at').studies[0];const c=JSON.parse(JSON.stringify(a));delete c._uuid;c.id=T.nid();c.fy=a.fy-1;T.storeSave('at',c);})()")
    pg.wait_for_timeout(500)
    pg.goto(IDX + 'at'); pg.wait_for_timeout(300); pg.click('[data-ecopen]'); pg.wait_for_timeout(300)
    fys = pg.eval_on_selector_all('[data-ecfy]', 'e=>e.map(x=>x.dataset.ecfy)')
    fy = int(fys[-1]) if fys else None
    if fy: pg.click(f'[data-ecfy="{fy}"]'); pg.wait_for_timeout(200)
    pg.click('[data-ecmode="sin"]'); pg.wait_for_timeout(200)
    pg.goto(IDX + 'ws'); pg.wait_for_timeout(300)
    pl = pg.eval_on_selector('select[data-ubf="planta"]', 'e=>[...e.options].map(o=>o.value).filter(Boolean)[0]')
    pg.select_option('select[data-ubf="planta"]', pl); pg.wait_for_timeout(300)
    pg.goto(IDX + 'inicio'); pg.wait_for_timeout(300)
    chips = pg.eval_on_selector_all('[data-inplanta]', 'e=>e.map(x=>x.dataset.inplanta)')
    if len(chips) > 1: pg.click(f'[data-inplanta="{chips[-1]}"]'); pg.wait_for_timeout(300)
    antes = json.loads(pg.evaluate('TaktStore.vista()'))
    pg.wait_for_function('TaktStore.vistaGuardada()===TaktStore.vista()', timeout=3000)
    pg.reload(); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.wait_for_timeout(400)
    despues = json.loads(pg.evaluate('TaktStore.vista()'))
    check(len(fys) > 1, f'el historial tiene varios FY para elegir ({fys})')
    check(despues['ecfy'] == fy and despues['ecmode'] == 'sin', 'FY elegido a mano y modo SIN AFECTACIÓN se recuerdan')
    check(despues['ubf']['planta'] == pl, 'filtro de planta de las listas se recuerda')
    check(len(chips) < 2 or despues['inplanta'] == chips[-1], 'planta de Inicio se recuerda')
    pg.goto(IDX + 'ws'); pg.wait_for_timeout(300)
    check(pg.eval_on_selector('select[data-ubf="planta"]', 'e=>e.value') == pl, 'la lista abre ya filtrada')
    check('ocult' in pg.inner_text('#view').lower(), 'la lista avisa cuántos estudios esconde el filtro')
    pg.goto(IDX + 'at'); pg.wait_for_timeout(200); pg.click('[data-ecopen]'); pg.wait_for_timeout(300)
    check(pg.get_attribute('[data-ecmode="sin"]', 'aria-pressed') == 'true', 'Eficiencia compuesta abre en SIN AFECTACIÓN')
    check(pg.get_attribute(f'[data-ecfy="{fy}"]', 'aria-pressed') == 'true', 'Eficiencia compuesta abre en el FY elegido (no salta al más reciente)')
    # Tutorial: arranca con vista limpia, no guarda nada y al salir regresa la vista
    guardada = pg.evaluate('TaktStore.vistaGuardada()')
    pg.evaluate("TaktTut.start('ws','demo')"); pg.wait_for_timeout(600)
    check(pg.evaluate("(()=>{const T=TaktStore._t;return T.UBF.planta===''&&T.EC.mode==='con'&&T.VISTA.ecfy===null})()"), 'tutorial arranca con la vista de siempre')
    pg.evaluate('TaktTut.exit()'); pg.wait_for_timeout(400)
    check(pg.evaluate('TaktStore.vistaGuardada()') == guardada and json.loads(pg.evaluate('TaktStore.vista()')) == despues,
          'al salir del tutorial la vista regresa y lo guardado no cambió')
    # Planta borrada del catálogo: al abrir, el filtro se limpia solo
    pg.evaluate("(async()=>{const v=JSON.parse(TaktStore.vista());v.ubf={planta:'no-existe',area:'',linea:''};await TaktStore._t.storeTx(['ajustes'],'readwrite',tx=>tx.objectStore('ajustes').put({key:'vista',value:v}));})()")
    pg.wait_for_timeout(200); pg.reload(); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.wait_for_timeout(300)
    check(json.loads(pg.evaluate('TaktStore.vista()'))['ubf']['planta'] == '', 'filtro hacia una planta que ya no existe: se limpia')
    check(not errs, f'sin errores de JavaScript {errs[:2]}')
    ctx.close()

    # 2. Navegador sin almacenamiento (modo privado o bloqueado): franja roja fija, en ES y EN
    for w, h, nom in [(1280, 900, 'laptop'), (390, 844, 'teléfono')]:
        ctx, pg, errs = pagina(b, [SIN_ALMACEN], w, h)
        r = barra(pg)
        check(pg.evaluate('TaktStore.aviso()') == 'nodisp' and r['vis'] and 'rojo' in r['cls'] and not r['x'], f'{nom}: no disponible → franja roja sin botón de cerrar')
        check('no permite guardar' in r['txt'], f'{nom}: el texto explica que se pierde al cerrar')
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(sw <= w, f'{nom}: la franja no se sale de la pantalla ({sw}px)')
        pg.goto(IDX + 'ws'); pg.wait_for_timeout(300); check(barra(pg)['vis'], f'{nom}: la franja sigue en otras pantallas')
        pg.click('#storebar [data-go="config"]'); pg.wait_for_timeout(400)
        check('no permite guardar' in pg.inner_text('#storecard'), f'{nom}: Ver detalle lleva a la tarjeta de Configuración')
        pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(400)
        t = barra(pg)['txt'] + ' ' + pg.inner_text('#storecard')
        check('does not allow saving' in t and 'Storage on this device' in t and 'guardar' not in t, f'{nom}: en inglés no queda español ({t[:90]})')
        if nom == 'teléfono': pg.screenshot(path='/tmp/fase3_nodisp_phone.png')
        check(not errs, f'{nom}: sin errores de JavaScript {errs[:2]}')
        ctx.close()

    # 3. Almacenamiento lleno: franja roja; el estudio queda sin guardar; al volver a guardar bien, se quita
    ctx, pg, errs = pagina(b, [LLENO])
    pg.evaluate("window.__lleno=true;TaktStore._t.ubAdd('planta',null,'PLANTA LLENA')"); pg.wait_for_timeout(500)
    r = barra(pg)
    check(pg.evaluate('TaktStore.aviso()') == 'lleno' and 'rojo' in r['cls'] and not r['x'], 'catálogo sin espacio → franja roja de lleno')
    pg.evaluate("window.__d={id:TaktStore._t.nid(),titulo:'X',ops:[],ubic:{}};TaktStore._t.storeSave('ws',window.__d)"); pg.wait_for_timeout(500)
    check(pg.evaluate("!TaktStore.saved().includes(window.__d._uuid)&&TaktStore._t.storeStateOf(window.__d,TaktStore._t.STORE.saved)==='nuevo'"), 'el estudio que no cupo sigue marcado como sin guardar')
    check('Sin espacio' in pg.inner_text('#savetoast'), 'aviso inmediato: sin espacio para guardar')
    pg.evaluate("window.__lleno=false;TaktStore._t.storeSave('ws',window.__d)"); pg.wait_for_timeout(500)
    check(pg.evaluate('TaktStore.aviso()') is None and not barra(pg)['vis'], 'al guardar bien otra vez, la franja se quita')
    check(pg.evaluate("TaktStore.saved().includes(window.__d._uuid)"), 'y el estudio queda guardado')
    check(not errs, f'sin errores de JavaScript {errs[:2]}'); ctx.close()

    # 4. Casi lleno (85 % o más): franja ámbar que se puede cerrar; tarjeta con medidor y protección contra borrado
    ctx, pg, errs = pagina(b, [CASI], 820, 1180)
    r = barra(pg)
    check(pg.evaluate('TaktStore.aviso()') == 'casi' and 'ambar' in r['cls'] and r['x'] and '90 %' in r['txt'], f'casi lleno → franja ámbar con % y botón cerrar ({r["txt"][:60]})')
    pg.click('#storebar [data-storebarx]'); pg.wait_for_timeout(200)
    check(not barra(pg)['vis'], 'al cerrarla desaparece')
    pg.goto(IDX + 'config'); pg.wait_for_timeout(400)
    c = pg.inner_text('#storecard')
    check('Usado: 90.0 MB de 100.0 MB' in c and pg.query_selector('#storecard .sbmeter.hi'), 'tarjeta: espacio usado y medidor en naranja')
    check('no activa' in c and pg.query_selector('#storecard [data-storepersist]'), 'tarjeta: protección no activa con botón para activarla')
    pg.click('#storecard [data-storepersist]'); pg.wait_for_timeout(400)
    check('Protección contra borrado: activa' in pg.inner_text('#storecard') and pg.evaluate('TaktStore.persist()') is True, 'al tocar Activar protección queda activa')
    pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(400); c = pg.inner_text('#storecard')
    check('Used: 90.0 MB of 100.0 MB' in c and 'Protection against deletion: on' in c, f'tarjeta en inglés ({c[:80]})')
    pg.screenshot(path='/tmp/fase3_card_tablet.png')
    check(not errs, f'sin errores de JavaScript {errs[:2]}'); ctx.close()
    b.close()

if fallas: print(f'HAY FALLAS: {len(fallas)}')
else: print('OK: guardado Fase 3 (avisos de almacenamiento y ajustes de vista)')
