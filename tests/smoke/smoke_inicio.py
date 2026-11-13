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

def kpis(pg):
    go(pg,'inicio');pg.click('[data-inplanta="sem-pn"]');pg.wait_for_timeout(200)
    N=pg.evaluate("TaktInicio.kpis('sem-pn')");S=pg.evaluate("TaktInicio.kpis('sem-ps')")
    check('kpis',N and S and N['fy']==S['fy'] and N['mes']==S['mes'],'Norte y Sur tienen indicadores del mismo año y mes')
    t=pg.locator('[data-inkpi="efic"]').inner_text()
    check('kpis',t.replace(' ','').startswith(f"{N['efic']*100:.1f}%"),f'Inicio muestra la eficiencia de planta ({t.strip()} vs {N["efic"]*100:.1f}%)')
    # La Eficiencia compuesta (todas las plantas) = suma de horas de Norte + Sur: el filtro por planta reparte bien
    go(pg,'at-planta');lbl=pg.locator('#view .kpi').nth(2).inner_text()
    exp=(N['req']+S['req'])/(N['trab']+S['trab'])*100
    check('kpis',f'{exp:.1f}%' in lbl,f'Eficiencia compuesta del mes = horas de Norte + Sur ({exp:.1f}% en «{lbl.splitlines()[1] if len(lbl.splitlines())>1 else lbl}»)')
    check('kpis',len(N['areas'])==2 and all(a['at']>0 and a['meta']>0 for a in N['areas']),'Actual Time contra meta de las 2 áreas de Norte')
    check('kpis',N['occ'] and N['occ']>0 and N['hcVol']>0 and N['hcEsq']>0,'ocupación y headcount de Cálculo de personal')
    go(pg,'inicio');pg.click('[data-inplanta=""]');pg.wait_for_timeout(200)
    v=pg.locator('#view').inner_text()
    check('kpis',pg.locator('[data-inkpis-vacio]').count()==1 and 'NaN' not in v and 'Infinity' not in v,'«Sin asignar» (sin Actual Time ni personal) invita a capturar, sin NaN')

ORDEN=['ws','ds','we','st','mm','sm','tk','hs','df','sp','pc','at']
RUTA={'ws':'ws-nuevo','ds':'ds-nuevo','we':'we-nuevo','st':'st-nuevo','mm':'mm-nuevo','sm':'sm-nuevo','tk':'tk-nuevo','hs':'hs-nuevo','df':'df-nuevo','sp':'sp-nuevo','pc':'pc-nuevo','at':'at-nuevo'}
def norte(pg):go(pg,'inicio');pg.click('[data-inplanta="sem-pn"]');pg.wait_for_timeout(200)
def renglones(pg):
    norte(pg)
    rows=pg.eval_on_selector_all('[data-inrow]','e=>e.map(x=>x.dataset.inrow)')
    check('inicio',rows==ORDEN,f'PLANTA NORTE: 12 renglones en orden ({rows})')
    for k in ORDEN:
        norte(pg);c=pg.locator(f'[data-inrow="{k}"] [data-inopen]').first;kid=c.get_attribute('data-inopen').split('|')[1]
        big=c.locator('[data-inbig]').inner_text().strip()
        c.click();pg.wait_for_timeout(250)
        r=pg.evaluate('location.hash.slice(1)');d=pg.evaluate(f"TaktRep.data('{k}')")
        check('inicio',r==RUTA[k] and d and str(d['id'])==kid,f'{k}: tocar la tarjeta abre ese estudio ({r})')
        if k=='st':
            oee=pg.locator('#view .kpi').filter(has_text='OEE').first.locator('.v').inner_text().strip()
            check('inicio',big==oee,f'st: el OEE de la tarjeta ({big}) es el de sus resultados ({oee})')
    norte(pg);n0=pg.locator('[data-inopen]').count()
    pg.click('[data-inlinea="sem-pn-l1"]');pg.wait_for_timeout(200)
    ln=pg.eval_on_selector_all('[data-inopen]','e=>e.map(x=>x.dataset.inln)')
    check('inicio',0<len(ln)<n0 and all(x=='sem-pn-l1' for x in ln),f'filtro LÍNEA 1: {len(ln)} de {n0} tarjetas, todas de esa línea')
    go(pg,'inicio');pg.click('[data-inplanta=""]');pg.wait_for_timeout(200)
    check('inicio',pg.locator('[data-inopen]').count()==2,'«Sin asignar» muestra los 2 estudios sin planta')
    norte(pg)
    who=pg.eval_on_selector_all('[data-inwho]','e=>e.map(x=>+x.dataset.n)')
    an=pg.eval_on_selector_all('[data-inopen]','e=>e.filter(x=>x.dataset.inan).length')
    check('inicio',len(who)==5 and sum(who)==an,f'«Quién lo hizo»: 5 analistas, {sum(who)} estudios = {an} tarjetas con analista')
    pg.evaluate('TaktInicio.setMax(3)');norte(pg)
    we=pg.locator('[data-inrow="we"]');tot=pg.evaluate("JSON.parse(TaktStore.dump('we')).filter(d=>d.ubic&&d.ubic.planta==='sem-pn').length")
    check('inicio',we.locator('[data-inopen]').count()==3 and f'Ver todos ({tot})' in we.inner_text(),f'renglón con más del máximo: pinta 3 y «Ver todos ({tot})»')
    pg.evaluate('TaktInicio.setMax(12)')

with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1366,'height':900});pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX);pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    semilla(pg)
    kpis(pg)
    renglones(pg)
    auto(b)
    b.close()
check('js',not errs,'sin errores de JavaScript '+(str(errs[:3]) if errs else ''))
print(('OK: inicio' if not fails else 'FALLAS: '+str(len(fails))))
