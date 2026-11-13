# Prueba del historial ficticio (semilla) y del tablero de Inicio.
# Las pruebas automáticas (navigator.webdriver) arrancan en blanco; la semilla se carga a mano con TaktSeed.load().
import pathlib, os, json, re
IDX='file://'+str(pathlib.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
KINDS=['ws','ds','we','st','mm','sm','pc','at','df','tk','hs','sp']
fails=[];errs=[]
def check(tag,c,msg):
    print(tag,('OK ' if c else 'FALLA ')+msg)
    if not c:fails.append(tag+' '+msg)
def go(pg,h):pg.evaluate(f"location.hash='{h}'");pg.wait_for_timeout(150)
def reload(pg):pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
def total(pg):return sum(len(json.loads(pg.evaluate(f"TaktStore.dump('{k}')"))) for k in KINDS)

def semilla(pg):
    check('semilla',total(pg)==0,'las pruebas arrancan en blanco (sin semilla automática)')
    n=pg.evaluate('TaktSeed.load()');c=pg.evaluate('TaktSeed.count()')
    check('semilla',n==c and c>=40,f'load() guarda los {c} estudios del historial')
    reload(pg)
    per={k:len(json.loads(pg.evaluate(f"TaktStore.dump('{k}')"))) for k in KINDS}
    check('semilla',sum(per.values())==c,f'tras recargar están los {c} ({per})')
    check('semilla',all(v>0 for v in per.values()),'los 12 formatos tienen historial')
    pg.evaluate('TaktSeed.load()');reload(pg)
    check('semilla',total(pg)==c,'cargarla otra vez no duplica')
    bad=pg.evaluate("""TaktSeed.orphans()""")
    check('semilla',bad==0,'cada estudio con planta apunta a una planta del catálogo')
    ok=pg.evaluate("""()=>{let n=0,bad=[];for(const k of TaktRep.kinds()){for(const d of JSON.parse(TaktStore.dump(k))){try{if(TaktRep.build(k,String(d.id)))n++;else bad.push(k+d.id);}catch(e){bad.push(k+':'+e.message);}TaktRep.close();}}return [n,bad];}""")
    check('semilla',not ok[1],f'los reportes de los {ok[0]} estudios con reporte se arman {ok[1][:3]}')

def auto(b):
    # un navegador normal (sin webdriver) carga la semilla sola, una vez
    ctx=b.new_context();ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false})")
    pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto(IDX);pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    c=pg.evaluate('TaktSeed.count()');check('semilla',total(pg)==c,f'en un navegador normal se carga sola ({total(pg)} de {c})')
    go(pg,'ws');pg.locator('[data-sdel^="ws|"]').first.click();pg.click('#modal [data-mok]');pg.wait_for_timeout(300)
    reload(pg);check('semilla',total(pg)==c-1,'si se borra un estudio de ejemplo no regresa al recargar')
    ctx.close()

with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1366,'height':900});pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX);pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    semilla(pg)
    auto(b)
    b.close()
check('js',not errs,'sin errores de JavaScript '+(str(errs[:3]) if errs else ''))
print(('OK: inicio' if not fails else 'FALLAS: '+str(len(fails))))
