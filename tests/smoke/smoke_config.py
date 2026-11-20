# Configuración (perfil, empresa, preferencias, secciones) y navegación: círculo, engrane y «Más».
import io, pathlib as _pl, tempfile, os
from playwright.sync_api import sync_playwright
from PIL import Image
IDX = 'file://' + str(_pl.Path(__file__).resolve().parents[2] / 'index.html') + '#'
fallas = []
def check(c, msg):
    print(('OK   ' if c else 'FALLA ') + msg)
    if not c: fallas.append(msg)
SEMILLA = "Object.defineProperty(navigator,'webdriver',{get:()=>false})"
# logo de prueba: PNG 900×300 con transparencia (la app lo debe reducir a máx. 480×160)
LOGO = os.path.join(tempfile.mkdtemp(), 'logo.png')
im = Image.new('RGBA', (900, 300), (0, 0, 0, 0)); im.paste((29, 95, 168, 255), (60, 60, 840, 240)); im.save(LOGO)

def pagina(b, w, h, semilla=True):
    ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=w < 1000)
    if semilla: ctx.add_init_script(SEMILLA)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    pg.goto(IDX + 'inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.evaluate("TaktI18n.set('es')"); pg.wait_for_timeout(400)
    return ctx, pg, errs
def go(pg, r): pg.evaluate(f"location.hash='{r}'"); pg.wait_for_timeout(300)
def reload(pg): pg.reload(); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- Laptop ----------
    ctx, pg, errs = pagina(b, 1366, 900)
    check(pg.is_visible('#nav2 [data-go="config"]') and pg.is_visible('.top .avatar'), 'laptop: engrane en el menú y círculo arriba')
    pg.click('.top .avatar'); pg.wait_for_timeout(300)
    check(pg.evaluate('location.hash') == '#config' and pg.is_visible('.cfgnav') and pg.is_visible('#cfghero'), 'el círculo lleva a Configuración (abre en Perfil)')
    check(pg.locator('.cfgitem').count() == 6, 'seis secciones: Perfil, Empresa, Preferencias, Plantas, Almacenamiento, Plan')
    t = pg.inner_text('#view')
    check('Idioma' not in pg.inner_text('.cfgnav') and 'Datos de prueba' not in t and 'Más herramientas' not in t, 'sin Idioma, Datos de prueba ni Más herramientas')
    check('Te falta' in t and '0%' in pg.inner_text('#cfghero'), 'perfil vacío: 0 % y lista de lo que falta')
    # llenar perfil
    pg.fill('[data-cfg="perfil.nombre"]', 'angel'); pg.press('[data-cfg="perfil.nombre"]', 'Tab')
    pg.fill('[data-cfg="perfil.apellidos"]', 'serna hernández'); pg.press('[data-cfg="perfil.apellidos"]', 'Tab')
    check(pg.inner_text('.top .avatar').strip() == 'AS', f'el círculo muestra las iniciales al escribir ({pg.inner_text(".top .avatar").strip()})')
    pg.fill('[data-cfg="perfil.correo"]', 'angel@'); pg.wait_for_timeout(100)
    check(pg.locator('label.miss [data-cfg="perfil.correo"]').count() == 1, 'correo inválido se marca')
    pg.fill('[data-cfg="perfil.correo"]', 'angel@manufacturas.mx'); pg.press('[data-cfg="perfil.correo"]', 'Tab')
    check(pg.locator('label.miss [data-cfg="perfil.correo"]').count() == 0, 'correo válido se desmarca')
    pg.fill('[data-cfg="perfil.puesto"]', 'ingeniero industrial sr.'); pg.press('[data-cfg="perfil.puesto"]', 'Tab')
    pl = pg.eval_on_selector('[data-cfg="perfil.planta"]', 'e=>[...e.options].map(o=>o.value).filter(Boolean)[0]')
    pg.select_option('[data-cfg="perfil.planta"]', pl); pg.wait_for_timeout(300)
    h = pg.inner_text('#cfghero')
    check('ANGEL SERNA HERNÁNDEZ' in h and 'INGENIERO INDUSTRIAL SR.' in h and '71%' in h, f'tarjeta de perfil al día: nombre, puesto y 71 % ({h[:80]!r})')
    check('Guardado' in pg.inner_text('#cfgsaved'), 'aviso de guardado')
    check(pg.inner_text('[data-cfgres="perfil"]').startswith('ANGEL SERNA HERNÁNDEZ'), 'el resumen de la sección se actualiza')
    # te falta → lleva al campo
    pg.click('[data-cfgfocus="empresa.nombre"]'); pg.wait_for_timeout(400)
    check(pg.evaluate('location.hash') == '#config-empresa' and pg.evaluate("document.activeElement.dataset.cfg") == 'empresa.nombre', '«Te falta: Empresa» lleva al campo')
    pg.fill('[data-cfg="empresa.nombre"]', 'manufacturas del norte'); pg.press('[data-cfg="empresa.nombre"]', 'Tab'); pg.wait_for_timeout(200)
    pg.set_input_files('[data-cfglogo]', LOGO); pg.wait_for_timeout(800)
    lg = pg.evaluate("(()=>{const l=TaktStore._t.EMPRESA.logo;return {png:l.startsWith('data:image/png'),n:l.length}})()")
    wh = pg.evaluate("new Promise(r=>{const i=new Image();i.onload=()=>r([i.width,i.height]);i.src=TaktStore._t.EMPRESA.logo})")
    check(lg['png'] and wh[0] <= 480 and wh[1] <= 160, f'logo subido, reducido a {wh} y guardado como PNG')
    check(pg.locator('.cfglogobox img').count() == 1 and pg.locator('.cfgrep-b img').count() == 1 and 'MANUFACTURAS DEL NORTE' in pg.inner_text('.cfgrep'), 'vista previa del logo y del encabezado del reporte')
    # recarga: todo persiste
    reload(pg); go(pg, 'config-perfil')
    check('100%' in pg.inner_text('#cfghero') and pg.inner_text('.top .avatar').strip() == 'AS' and pg.locator('#cfgmiss[hidden]').count() == 1, 'al recargar: perfil 100 %, iniciales y sin «Te falta»')
    # preferencias: A4 y reporte con empresa, logo y «Elaborado por»
    go(pg, 'config-pref'); pg.click('[data-cfgset="prefs.hoja|a4"]'); pg.wait_for_timeout(300)
    check(pg.get_attribute('[data-cfgset="prefs.hoja|a4"]', 'aria-pressed') == 'true', 'hoja A4 elegida')
    sid = pg.evaluate("TaktStore._t.storeBox('st').studies[0].id")
    pg.evaluate(f"TaktRep.build('st',{sid})"); pg.wait_for_timeout(300)
    rep = pg.evaluate("(()=>({css:document.getElementById('repstyle').textContent,img:!!document.querySelector('#rep .rlogo'),txt:document.querySelector('#rep .rhead').innerText}))()")
    check('size:A4 portrait' in rep['css'], 'reporte PDF en hoja A4')
    check(rep['img'] and 'MANUFACTURAS DEL NORTE' in rep['txt'] and 'Elaborado por ANGEL SERNA HERNÁNDEZ' in rep['txt'], f'reporte con logo, empresa y «Elaborado por» ({rep["txt"][:120]!r})')
    pg.evaluate('TaktRep.close()')
    # analista sugerido en estudios nuevos
    go(pg, 'tk'); pg.click('[data-tknew]'); pg.wait_for_timeout(300)
    an = pg.evaluate("(document.querySelector('input[name=analista]')||{}).value")
    check(an == 'ANGEL SERNA HERNÁNDEZ', f'estudio nuevo trae mi nombre como analista ({an})')
    go(pg, 'config-pref'); pg.click('label.switch:has([data-cfgchk="prefs.miAnalista"])'); pg.wait_for_timeout(300)
    go(pg, 'sm'); pg.click('[data-smnew]'); pg.wait_for_timeout(300)
    an = pg.evaluate("(document.querySelector('input[name=analista]')||{}).value")
    check(an == '', f'con «Usar mi nombre» apagado, el analista queda vacío ({an!r})')
    # recordar vista apagado: no se guarda la vista
    go(pg, 'config-pref'); pg.click('label.switch:has([data-cfgchk="prefs.recordar"])'); pg.wait_for_timeout(200)
    guardada = pg.evaluate('TaktStore.vistaGuardada()')
    go(pg, 'ws'); pg.select_option('select[data-ubf="planta"]', pl); pg.wait_for_timeout(300)
    check(pg.evaluate('TaktStore.vistaGuardada()') == guardada, 'con «Recordar la vista» apagado, el filtro no se guarda')
    reload(pg); go(pg, 'ws')
    check(pg.eval_on_selector('select[data-ubf="planta"]', 'e=>e.value') == '', 'y al recargar la lista abre sin filtro')
    go(pg, 'config-alm')
    check(pg.locator('#storecard').count() == 1 and pg.locator('.cfgper > div').count() == 12, 'Almacenamiento: tarjeta y conteo de los 12 formatos')
    go(pg, 'config-plan'); check('Plan de prueba' in pg.inner_text('#view'), 'Plan y pagos: plan de prueba')
    go(pg, 'config-plantas'); check(pg.locator('[data-cattog="sec"]').count() == 1, 'Plantas y líneas: el catálogo de siempre')
    # tutorial: no usa mi nombre
    pg.evaluate("TaktStore._t.PREFS.miAnalista=true"); pg.evaluate("TaktTut.start('tk','demo')"); pg.wait_for_timeout(500)
    check(pg.evaluate("TaktStore._t.analista()") == '', 'durante un tutorial no se usa mi nombre (datos ficticios)')
    pg.evaluate('TaktTut.exit()'); pg.wait_for_timeout(300)
    check(pg.evaluate("TaktStore._t.analista()") == 'ANGEL SERNA HERNÁNDEZ', 'al salir del tutorial vuelve a usarse')
    check(not errs, f'laptop: sin errores de JavaScript {errs[:2]}'); ctx.close()

    # ---------- Tablet: sin engrane, queda el círculo ----------
    ctx, pg, errs = pagina(b, 820, 1180)
    check(not pg.is_visible('#nav2 [data-go="config"]') and pg.is_visible('.top .avatar'), 'tablet: sin engrane en el menú; círculo visible')
    pg.click('.top .avatar'); pg.wait_for_timeout(300)
    check(pg.evaluate('location.hash') == '#config' and pg.is_visible('.cfgnav') and not pg.is_visible('.cfgbody'), 'tablet: el círculo abre la lista de secciones')
    pg.click('.cfgitem[data-go="config-empresa"]'); pg.wait_for_timeout(300)
    check(pg.is_visible('.cfgbody') and not pg.is_visible('.cfgnav') and pg.is_visible('.cfgback'), 'tablet: al entrar a una sección, botón para regresar')
    pg.click('.cfgback'); pg.wait_for_timeout(300); check(pg.evaluate('location.hash') == '#config', 'regresar lleva a la lista')
    check(not errs, f'tablet: sin errores de JavaScript {errs[:2]}'); ctx.close()

    # ---------- Teléfono: círculo arriba; la barra de abajo trae «Más» ----------
    for w in (390, 360):
        ctx, pg, errs = pagina(b, w, 800)
        tabs = pg.eval_on_selector_all('#tabbar [data-go]', 'e=>e.map(x=>x.dataset.go)')
        check(tabs == ['inicio', 'at', 'pc', 'mas'], f'{w}px: barra Inicio · Actual Time · Personal · Más ({tabs})')
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(pg.is_visible('.top .avatar') and sw <= w, f'{w}px: círculo visible en el encabezado y nada se sale ({sw}px)')
        pg.click('#tabbar [data-go="mas"]'); pg.wait_for_timeout(300)
        check(pg.locator('.atmore .mastile').count() == 8, '«Más»: 7 herramientas + Configuración')
        pg.click('.mastile[data-go="tk"]'); pg.wait_for_timeout(300); check(pg.evaluate('location.hash').startswith('#tk'), '«Más» abre Takt y balanceo')
        pg.click('.top .avatar'); pg.wait_for_timeout(300)
        check(pg.evaluate('location.hash') == '#config' and pg.locator('#tabbar [data-go="mas"][aria-current="page"]').count() == 1, 'el círculo abre Configuración (y «Más» queda marcado)')
        pg.click('.cfgitem[data-go="config-perfil"]'); pg.wait_for_timeout(300)
        sw = pg.evaluate('document.documentElement.scrollWidth')
        check(pg.is_visible('#cfghero') and sw <= w, f'{w}px: Perfil cabe en la pantalla ({sw}px)')
        if w == 390: pg.screenshot(path='/tmp/config_phone_perfil.png', full_page=True)
        check(not errs, f'{w}px: sin errores de JavaScript {errs[:2]}'); ctx.close()

    # ---------- Inglés: secciones traducidas ----------
    ctx, pg, errs = pagina(b, 1366, 900, semilla=False)
    pg.evaluate("TaktI18n.set('en')"); pg.wait_for_timeout(200)
    for r in ['config', 'config-empresa', 'config-pref', 'config-alm', 'config-plan', 'mas']:
        go(pg, r); t = pg.inner_text('main')
        bad = [w for w in ['Perfil', 'Empresa', 'Preferencias', 'Almacenamiento', 'Plan y pagos', 'Configuración', 'Tu nombre', 'Reglas', 'Herramientas'] if w in t]
        check(not bad, f'inglés {r}: sin español ({bad})')
    check(not errs, f'inglés: sin errores de JavaScript {errs[:2]}'); ctx.close()
    b.close()
if fallas: print(f'HAY FALLAS: {len(fallas)}')
else: print('OK: configuración y navegación')
