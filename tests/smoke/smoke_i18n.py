# Prueba de la capa de idioma (inglés): selector, traducción del DOM, datos del usuario intactos,
# texto que cambia en vivo, idioma recordado al recargar y cambio de idioma sin perder lo capturado.
import pathlib, time
IDX='file://'+str(pathlib.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
fails=[];errs=[]
def check(c,msg):
    print(('OK ' if c else 'FALLA ')+msg)
    if not c: fails.append(msg)
def txt(pg,sel):return pg.locator(sel).first.inner_text().strip()

with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1366,'height':900})
    pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX+'#estudios');pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    check(pg.evaluate('TaktI18n.get()')=='es','arranca en español bajo pruebas automáticas')
    check('Configuración' in pg.locator('#nav2').inner_text(),'menú en español')
    # selector en Configuración
    pg.evaluate("location.hash='config'");pg.wait_for_timeout(150)
    pg.locator('#view [data-lang="en"]').click();pg.wait_for_timeout(200)
    check(pg.evaluate('TaktI18n.get()')=='en','el botón EN cambia el idioma')
    check(pg.evaluate('document.documentElement.lang')=='en','<html lang="en">')
    nav=pg.locator('#nav').inner_text()
    check('Home' in nav and 'Time studies' in nav,'menú en inglés: '+nav.replace('\n',' | '))
    check('Settings' in pg.locator('#nav2').inner_text(),'Configuración → Settings')
    check(pg.locator('#view [data-lang="en"]').get_attribute('aria-pressed')=='true','EN marcado')
    check(pg.locator('input[type=search]').get_attribute('placeholder')!='Buscar estudio, operación…','placeholder traducido')
    # datos del usuario: [translate=no] no se toca; un valor de campo tampoco
    pg.evaluate("""()=>{const v=document.getElementById('view');const s=document.createElement('span');s.id='udt';s.setAttribute('translate','no');s.textContent='Configuración';v.appendChild(s);
      const i=document.createElement('input');i.id='udi';i.value='Configuración';v.appendChild(i);}""");pg.wait_for_timeout(100)
    check(txt(pg,'#udt')=='Configuración','texto dentro de [translate=no] queda igual')
    check(pg.locator('#udi').input_value()=='Configuración','el valor de un campo no se traduce')
    # texto que cambia en vivo, 100 veces: se traduce y no se cicla
    t0=time.time()
    pg.evaluate("""()=>new Promise(r=>{const s=document.createElement('b');s.id='live';document.getElementById('view').appendChild(s);let i=0;
      const f=()=>{s.textContent=(i%2?'Inicio':'Configuración');if(++i<100)setTimeout(f,0);else setTimeout(r,50);};f();})""")
    check(txt(pg,'#live')=='Home','texto cambiado en vivo termina traducido ('+txt(pg,'#live')+')')
    check(time.time()-t0<6,'sin ciclarse (%.2f s)'%(time.time()-t0))
    # se recuerda al recargar
    pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()');pg.wait_for_timeout(200)
    check(pg.evaluate('TaktI18n.get()')=='en','EN se recuerda al recargar')
    check('Home' in pg.locator('#nav').inner_text(),'menú en inglés después de recargar')
    # cambiar de idioma con un Work Sampling abierto y sin guardar: no se pierde nada
    pg.evaluate("TaktI18n.set('es')");pg.evaluate("location.hash='ws-nuevo'");pg.wait_for_timeout(200)
    pg.locator('input[name=titulo]').fill('ESTUDIO DE PRUEBA');pg.locator('input[name=titulo]').dispatch_event('input');pg.wait_for_timeout(100)
    pg.evaluate("TaktI18n.set('en')");pg.wait_for_timeout(200)
    check(pg.locator('input[name=titulo]').input_value()=='ESTUDIO DE PRUEBA','el título capturado sigue ahí en EN')
    pg.evaluate("TaktI18n.set('es')");pg.wait_for_timeout(200)
    check(pg.locator('input[name=titulo]').input_value()=='ESTUDIO DE PRUEBA','y al regresar a ES')
    check('Configuración' in pg.locator('#nav2').inner_text(),'de vuelta en español, el menú regresa')
    # Teléfono (Angel, 2026-11-13): ES/EN visible arriba; botón central pregunta qué estudio; «Capacidad» = vista previa
    m=b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);m.on('pageerror',lambda e:errs.append(str(e)))
    m.goto(IDX+'#inicio');m.wait_for_function('window.TaktStore&&TaktStore.ready()');m.evaluate("TaktI18n.set('es')");m.wait_for_timeout(150)
    check(m.locator('.top .langseg').is_visible(),'teléfono: el selector ES / EN se ve en el encabezado')
    m.locator('.top [data-lang="en"]').click();m.wait_for_timeout(200);check(m.evaluate('TaktI18n.get()')=='en','teléfono: EN desde el encabezado')
    m.locator('.top [data-lang="es"]').click();m.wait_for_timeout(200)
    m.locator('.fab').click();m.wait_for_timeout(300)
    check(m.locator('.sheet [data-pick]').count()==12,'botón central: muestra los 12 tipos de estudio ('+str(m.locator('.sheet [data-pick]').count())+')')
    check(m.evaluate('location.hash')=='#inicio','botón central: todavía no manda a ningún estudio')
    m.locator('[data-pick="st"]').click();m.wait_for_timeout(400)
    check(m.evaluate('location.hash')=='#st-nuevo' and m.locator('#modal').is_hidden(),'elegir Speed Trial abre un Speed Trial nuevo')
    m.locator('.tabbar [data-go="cap"]').click();m.wait_for_timeout(300)
    check(m.evaluate('location.hash')=='#cap' and m.locator('[data-capnew="pc"]').count()==1 and m.locator('[data-capnew="at"]').count()==1,'«Capacidad»: vista previa con Cálculo de personal y Actual Time')
    m.locator('[data-capnew="at"]').click();m.wait_for_timeout(400);check(m.evaluate('location.hash')=='#at-nuevo','«Nuevo» de Actual Time abre uno nuevo')
    b.close()
check(not errs,'sin errores de JavaScript '+str(errs[:3]))
print('OK: idioma' if not fails else 'HAY FALLAS: '+str(len(fails)))
