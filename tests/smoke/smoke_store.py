# Prueba del guardado (Fase 1): en los 9 formatos, guardar → recargar la página → los datos regresan idénticos.
# También: SIN GUARDAR, cambios sin guardar + descartar, borrar, tutoriales sin rastro, IDs sin choques.
import pathlib, sys, os, json
IDX='file://'+str(pathlib.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
fails=[];errs=[]
def check(tag,c,msg):
    print(tag,('OK ' if c else 'FALLA ')+msg)
    if not c:fails.append(tag+' '+msg)
def en(pg,sel):pg.locator(sel+':not([disabled])').first.click();pg.wait_for_timeout(80)
def go(pg,h):pg.evaluate(f"location.hash='{h}'");pg.wait_for_timeout(120)
# Flujo mínimo por formato hasta su botón Guardar (con los ejemplos de cada formato)
def make(pg,k):
    if k=='ws':
        go(pg,'ws');en(pg,'#view [data-go="ws-nuevo"]');pg.fill('input[name=titulo]','muestreo guardado');en(pg,'[data-wsv="hub"]');en(pg,'[data-enter]');en(pg,'[data-wsv="count"]')
        for v in [1,1,5,10,11,7]:en(pg,f'[data-tap="{v}"]')
        en(pg,'[data-wsv="res"]');return '[data-finish]'
    if k in('ds','we'):
        go(pg,k);en(pg,'#view [data-dsnew]');pg.fill('input[name=titulo]',k+' guardado')
        if k=='ds':pg.fill('[data-dsg="obj"]','60');en(pg,'[data-dsv="crono"]');en(pg,'[data-dsexample]')
        else:pg.fill('[data-dsg="obj"]','120');en(pg,'[data-dsv="elem"]');en(pg,'[data-weq="TOMAR"]');en(pg,'[data-weq="COLOCAR"]');en(pg,'[data-dsv="crono"]');en(pg,'[data-weexample]')
        en(pg,'[data-dsv="asig"]');en(pg,'[data-dsv="res"]');return '[data-dsfinish]'
    if k=='st':
        go(pg,'st');en(pg,'#view [data-stnew]')
        for n,v in [('parte','00000-POL1'),('proceso','ensamble'),('modelo','mod-01'),('costo','250'),('tcobj','1.20'),('analista','jp'),('periodo','turno 1')]:pg.fill(f'input[name={n}]',v)
        en(pg,'[data-stneed="info"]');en(pg,'[data-stexample]');en(pg,'[data-stneed="reg"]');return '[data-stfinish]'
    if k=='mm':
        go(pg,'mm');en(pg,'#view [data-mmnew]');pg.fill('input[name=linea]','celda 3');pg.fill('input[name=analista]','jp');pg.fill('input[name=tcobj]','1.10')
        en(pg,'[data-mmneed]');en(pg,'[data-mmexample]');en(pg,'[data-mmv="tabla"]');en(pg,'[data-mmv="lay"]');en(pg,'[data-mmv="graf"]');return '[data-mmfinish]'
    if k=='sm':
        go(pg,'sm');en(pg,'#view [data-smnew]');pg.fill('input[name=linea]','prensa');pg.fill('input[name=analista]','jp');pg.fill('input[name=cpw]','10')
        en(pg,'[data-smneed]');en(pg,'[data-smexample]');en(pg,'[data-smv="anal"]');en(pg,'[data-smv="res"]');return '[data-smfinish]'
    if k=='pc':
        go(pg,'pc');en(pg,'#view [data-pcnew]');pg.fill('input[name=nombre]','maquinado 1');en(pg,'[data-pcneed]');en(pg,'[data-pcexample]');en(pg,'.pcbottom [data-pcv="res"]');return '[data-pcfinish]'
    if k=='at':
        go(pg,'at');en(pg,'#view [data-atnew]');pg.fill('input[name=nombre]','ensamble 1');en(pg,'[data-atneed]');en(pg,'[data-atexample]');en(pg,'.pcbottom [data-atv="res"]');return '[data-atfinish]'
    if k=='df':
        go(pg,'df');en(pg,'#view [data-dfnew]');pg.fill('input[name=titulo]','recepción');pg.fill('input[name=analista]','jp');en(pg,'[data-dfneed]');en(pg,'[data-dfexample]');en(pg,'[data-dfv="res"]');return '[data-dffinish]'
KINDS=['ws','ds','we','st','mm','sm','pc','at','df']
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':1366,'height':900},timezone_id='America/Mexico_City')
    pg=ctx.new_page();pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('dialog',lambda d:d.accept())
    pg.goto(IDX+'#estudios');pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    check('base',pg.evaluate('TaktStore.ok()'),'el navegador permite guardar (IndexedDB)')
    dumps={}
    for k in KINDS:
        btn=make(pg,k)
        check(k,pg.locator('#savechip').inner_text()=='Sin guardar','antes de guardar: indicador «Sin guardar»')
        check(k,pg.evaluate('TaktStore.unsaved()')>=1,'cuenta como pendiente (aviso al salir)')
        en(pg,btn);pg.wait_for_timeout(250)
        dumps[k]=pg.evaluate(f"TaktStore.dump('{k}')")
        check(k,len(pg.evaluate('TaktStore.saved()'))==KINDS.index(k)+1,'quedó guardado')
    check('base',pg.evaluate('TaktStore.unsaved()')==0,'nada pendiente después de guardar todo')
    go(pg,'sm');check('sm',pg.locator('.studyrow').first.inner_text().find('FINALIZADO')>=0,'un estudio guardado dice FINALIZADO')
    loc=pg.evaluate("(()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate());})()")
    check('base',all(json.loads(pg.evaluate(f"TaktStore.dump('{k}')"))[0].get('fecha',loc)==loc for k in ['ws','ds','mm','sm','df']),f'la fecha es la local de México ({loc}), no la UTC')
    maxid=pg.evaluate('TaktStore.uid()')
    # ---- recargar: todo debe regresar idéntico ----
    pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    for k in KINDS:check(k,pg.evaluate(f"TaktStore.dump('{k}')")==dumps[k],'después de recargar los datos son idénticos')
    check('base',pg.evaluate('TaktStore.uid()')>=maxid,f'el contador de IDs sigue desde el más alto ({pg.evaluate("TaktStore.uid()")} ≥ {maxid})')
    # los resultados se recalculan igual: Speed Trial y Man Machine
    go(pg,'st');pg.locator('[data-stopen]').first.click();pg.wait_for_timeout(200)
    check('st',pg.locator('.kpi').filter(has_text='OEE').first.inner_text().find('91.1%')>=0,'al reabrir, OEE 91.1 %')
    go(pg,'mm');pg.locator('[data-mmopen]').first.click();pg.wait_for_timeout(200);en(pg,'[data-mmv="graf"]') if pg.locator('[data-mmv="graf"]:not([disabled])').count() else None
    # ---- cambios sin guardar + descartar ----
    go(pg,'sm');pg.locator('[data-smopen]').first.click();pg.wait_for_timeout(150);en(pg,'[data-smv="info"]');pg.fill('input[name=linea]','PRENSA CAMBIADA');pg.wait_for_timeout(400)
    check('sm',pg.locator('#savechip').inner_text()=='Cambios sin guardar','al editar un guardado: «Cambios sin guardar»')
    go(pg,'sm');check('sm',pg.locator('.savetag').count()==1 and 'CAMBIOS' in pg.locator('.savetag').inner_text(),'la lista lo marca')
    pg.click('[data-storediscard]');pg.click('#modal [data-mok]');pg.wait_for_timeout(150)
    check('sm',pg.evaluate("TaktStore.dump('sm')")==dumps['sm'] and pg.locator('.savetag').count()==0,'descartar regresa a lo guardado')
    # ---- un estudio nuevo sin guardar no sobrevive a la recarga ----
    go(pg,'sm');en(pg,'#view [data-smnew]');pg.fill('input[name=linea]','temporal');pg.fill('input[name=analista]','jp');en(pg,'[data-smneed]')
    go(pg,'sm');check('sm',pg.locator('.savetag').filter(has_text='SIN GUARDAR').count()==1,'nuevo sin guardar marcado «SIN GUARDAR»')
    pg.evaluate("window.onbeforeunload=null");pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    check('sm',pg.evaluate("JSON.parse(TaktStore.dump('sm')).length")==1,'todo o nada: lo no guardado no se guarda')
    # ---- tutoriales: no dejan rastro ----
    n0=len(pg.evaluate('TaktStore.saved()'))
    pg.evaluate("TaktTut.start('at','demo',20)");pg.wait_for_function("document.body.dataset.tut==='fin'",timeout=120000);pg.evaluate("TaktTut.exit()")
    pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    check('tut',len(pg.evaluate('TaktStore.saved()'))==n0 and len(pg.evaluate("JSON.parse(TaktStore.dump('at'))"))==1,'el tutorial (que pulsa «Guardar abril») no guardó nada')
    # ---- borrar desde la lista ----
    go(pg,'df');pg.locator('[data-sdel^="df|"]').first.click();pg.click('#modal [data-mok]');pg.wait_for_timeout(300)
    pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
    check('df',pg.evaluate("JSON.parse(TaktStore.dump('df')).length")==0 and len(pg.evaluate('TaktStore.saved()'))==n0-1,'borrar lo quita del almacén')
    # ================= Fase 2: jerarquía de planta =================
    RL="pg.reload();pg.wait_for_function('window.TaktStore&&TaktStore.ready()')"
    # --- migración real v1 → v2: un estudio guardado con el formato de antes (sin ubicación) ---
    v1=json.loads(pg.evaluate("TaktStore.dump('sm')"))[0];v1.pop('ubic',None);v1['_uuid']='prueba-v1';v1['id']=999;v1['linea']='PRENSA V1'
    pg.evaluate("""d=>new Promise((res,rej)=>{const r=indexedDB.open('takt',1);r.onsuccess=()=>{const tx=r.result.transaction(['estudios'],'readwrite');
      tx.objectStore('estudios').put({uuid:'prueba-v1',kind:'sm',schema:1,createdAt:'2026-11-12T10:00:00Z',savedAt:'2026-11-12T10:00:00Z',data:d});tx.oncomplete=()=>{r.result.close();res(1)};tx.onerror=()=>rej(tx.error);};})""",v1)
    exec(RL)
    m=[x for x in json.loads(pg.evaluate("TaktStore.dump('sm')")) if x.get('_uuid')=='prueba-v1']
    check('mig',len(m)==1 and m[0].get('ubic')=={} and m[0]['linea']=='PRENSA V1','estudio v1 se abre y queda «Sin asignar» (ubic vacía), sin perder datos')
    sch=pg.evaluate("""()=>new Promise(res=>{const r=indexedDB.open('takt',1);r.onsuccess=()=>{const g=r.result.transaction(['estudios']).objectStore('estudios').get('prueba-v1');g.onsuccess=()=>{r.result.close();res(g.result.schema)}}})""")
    check('mig',sch==2,f'y queda guardado ya migrado a la versión 2 (versión en almacén: {sch})')
    # --- catálogo en Configuración ---
    go(pg,'config')
    pg.fill('[data-catnew="planta|"]','planta norte');pg.click('[data-catadd="planta|"]');pg.wait_for_timeout(150)
    pid=pg.locator('[data-catname^="planta|"]').first.get_attribute('data-catname').split('|')[1]
    pg.fill(f'[data-catnew="area|{pid}"]','ensamble');pg.press(f'[data-catnew="area|{pid}"]','Enter');pg.wait_for_timeout(150)
    aid=pg.locator('[data-catname^="area|"]').first.get_attribute('data-catname').split('|')[1]
    pg.fill(f'[data-catnew="linea|{aid}"]','línea 1');pg.click(f'[data-catadd="linea|{aid}"]');pg.wait_for_timeout(150)
    check('cat',pg.locator('[data-catname^="planta|"]').first.input_value()=='PLANTA NORTE' and pg.locator('[data-catname^="linea|"]').count()==1,'agregar planta, área y línea (en MAYÚSCULAS)')
    exec(RL);go(pg,'config')
    check('cat',pg.locator('[data-catname^="linea|"]').count()==1 and pg.locator('[data-catname^="area|"]').first.input_value()=='ENSAMBLE','el catálogo sobrevive a la recarga')
    # --- selector en un estudio: elegir planta y área, y crear la línea desde ahí ---
    go(pg,'sm');en(pg,'#view [data-smnew]');pg.fill('input[name=linea]','prensa ubicada');pg.fill('input[name=analista]','jp')
    pg.select_option('[data-ubic="planta"]',pid);pg.wait_for_timeout(120);pg.select_option('[data-ubic="area"]',aid);pg.wait_for_timeout(120)
    en(pg,'[data-ubicnew="linea"]');pg.fill('#ubicnewin','línea 3');pg.press('#ubicnewin','Enter');pg.wait_for_timeout(200)
    lab=pg.locator('[data-ubic="linea"] option:checked').inner_text()
    check('ubic',lab=='LÍNEA 3','crear una línea desde el estudio la agrega al catálogo y la selecciona')
    pg.fill('input[name=linea]','prensa ubicada')
    en(pg,'[data-smneed]');en(pg,'[data-smexample]');en(pg,'[data-smv="anal"]');en(pg,'[data-smv="res"]');en(pg,'[data-smfinish]');pg.wait_for_timeout(300)
    exec(RL);go(pg,'sm')
    row=pg.locator('.studyrow').filter(has_text='PRENSA UBICADA')
    check('ubic',row.count()==1 and 'PLANTA NORTE › ENSAMBLE › LÍNEA 3' in row.inner_text(),'la lista muestra la ubicación después de recargar')
    # --- filtro por planta ---
    total=pg.locator('.studyrow').count();pg.select_option('[data-ubf="planta"]',pid);pg.wait_for_timeout(150)
    vis=pg.locator('.studyrow:not([hidden])').count()
    check('ubic',vis==1 and total>1 and pg.locator('.ubhidden').count()==1,f'filtrar por planta deja solo los de esa planta ({vis} de {total})')
    pg.select_option('[data-ubf="planta"]','');pg.wait_for_timeout(100)
    # --- renombrar no ensucia estudios; quitar algo en uso no se permite ---
    before=pg.evaluate("TaktStore.dump('sm')");go(pg,'config')
    lid=[x.get_attribute('data-catname') for x in pg.locator('[data-catname^="linea|"]').all() if pg.locator(f'[data-catname="{x.get_attribute("data-catname")}"]').input_value()=='LÍNEA 3'][0]
    pg.fill(f'[data-catname="{lid}"]','línea 3 norte');pg.press(f'[data-catname="{lid}"]','Tab');pg.wait_for_timeout(150)
    go(pg,'sm');check('cat',pg.evaluate("TaktStore.dump('sm')")==before and 'LÍNEA 3 NORTE' in pg.locator('.studyrow').filter(has_text='PRENSA UBICADA').inner_text() and pg.locator('.savetag').count()==0,'renombrar cambia el nombre en la lista sin tocar los estudios')
    go(pg,'config');pg.click(f'[data-catdel="{lid}"]');pg.wait_for_timeout(200)
    check('cat',pg.locator(f'[data-catname="{lid}"]').count()==1 and pg.locator('#savetoast.err').count()==1,'no deja quitar una línea que usa un estudio')
    pg.click(f'[data-catdel="planta|{pid}"]');pg.wait_for_timeout(200)
    check('cat',pg.locator(f'[data-catname="planta|{pid}"]').count()==1,'tampoco la planta que la contiene')
    # una línea sin estudios sí se puede quitar
    lid1=[x.get_attribute('data-catname') for x in pg.locator('[data-catname^="linea|"]').all() if pg.locator(f'[data-catname="{x.get_attribute("data-catname")}"]').input_value()=='LÍNEA 1'][0]
    pg.click(f'[data-catdel="{lid1}"]');pg.click('#modal [data-mok]');pg.wait_for_timeout(150);exec(RL);go(pg,'config')
    check('cat',pg.locator(f'[data-catname="{lid1}"]').count()==0,'una línea sin estudios sí se quita (y queda quitada al recargar)')
    # ---- Puesto en lugar del nombre ----
    go(pg,'ws');en(pg,'#view [data-go="ws-nuevo"]');en(pg,'[data-wsv="hub"]');en(pg,'[data-enter]')
    check('ws',pg.locator('text=Puesto').count()>=1 and pg.locator('text=Nombre del operador').count()==0,'el campo dice «Puesto», no nombre')
    b.close()
print('errores JS:',errs or 'ninguno')
if fails or errs:print('FALLAS:',fails);sys.exit(1)
print('OK: guardado en los 9 formatos (guardar, recargar, cambios, descartar, borrar, tutoriales)')
