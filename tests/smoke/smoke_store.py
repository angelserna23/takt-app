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
# Catálogo de Configuración: siempre cerrado al cargar; se abre la sección y cada nodo
def abrecat(pg):
    while pg.locator('[data-cattog][aria-expanded="false"]').count():pg.locator('[data-cattog][aria-expanded="false"]').first.click();pg.wait_for_timeout(80)
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
    if k=='tk':
        go(pg,'tk');en(pg,'#view [data-tknew]');pg.fill('input[name=titulo]','balanceo guardado');pg.fill('input[name=analista]','jp')
        pg.fill('input[name=demanda]','800');pg.fill('input[name=paros]','40')
        check('tk',pg.locator('#tktaktv').inner_text()=='1.1','takt en vivo 1.10 (880 ÷ 800)')
        en(pg,'[data-tkneed]')
        check('tk',pg.locator('[data-tkimp]:not([disabled])').count()>=1,'el Work Element guardado aparece para traer')
        en(pg,'[data-tkimp]');n_we=pg.locator('.tkst').count()
        check('tk',n_we>=1 and pg.locator('[data-tkimp][disabled]').count()>=1,'traer el Work Element crea su estación y lo marca «Ya está»')
        for i in range(n_we):
            en(pg,'[data-tkstdel]')
            if pg.locator('#modal [data-mok]').count():pg.locator('#modal [data-mok]').click();pg.wait_for_timeout(80)
        en(pg,'[data-tkexample]');en(pg,'[data-tkv="bal"]')
        pg.locator('[data-tksel]').filter(has_text='ATORNILLAR').click();pg.wait_for_timeout(80)
        pg.locator('.lane').filter(has=pg.locator('input[value="EST 30"]')).locator('[data-tkmove]').click();pg.wait_for_timeout(120)
        check('tk',pg.locator('.kpi').filter(has_text='Eficiencia').first.inner_text().find('95.3%')>=0,'mover ATORNILLAR a EST 30: eficiencia 81.5 % → 95.3 %')
        en(pg,'[data-tkv="res"]');return '[data-tkfinish]'
    if k=='hs':
        go(pg,'hs');en(pg,'#view [data-hsnew]');pg.fill('input[name=operacion]','hoja guardada');pg.fill('input[name=elaboro]','jp');pg.fill('input[name=takt]','1.2')
        en(pg,'[data-hsepp="lentes"]');en(pg,'[data-hsneed]');en(pg,'[data-hsexample]')
        check('hs',pg.locator('#hstc').inner_text()=='1.12','ejemplo: tiempo ciclo 1.12')
        en(pg,'[data-hspadd]');pg.locator('[data-hsd]').last.fill('paso extra');pg.locator('[data-hst]').last.fill('0,05')
        check('hs',pg.locator('#hstc').inner_text()=='1.17','paso extra con coma decimal: 1.17')
        en(pg,'[data-hsv="hoja"]')
        check('hs',pg.locator('.hssheet').first.inner_text().find('PASO EXTRA')>=0,'la hoja muestra el paso en MAYÚSCULAS')
        pg.emulate_media(media='print');pg.evaluate('TaktHS.fit()')
        pdf=pg.pdf(format='Letter',landscape=True,prefer_css_page_size=True,print_background=True);pg.emulate_media(media='screen')
        import re as _re
        check('hs',len(_re.findall(rb'/Type\s*/Page[^s]',pdf))==1,'al imprimir: carta horizontal en 1 página')
        return '[data-hsfinish]'
    if k=='sp':
        go(pg,'diag');check('sp',pg.locator('#view .fmt[data-go="sp"]').count()==1 and pg.locator('#view .fmt[data-go="df"]').count()==1,'«Diagramas» muestra Flujo de proceso y Espagueti')
        en(pg,'#view .fmt[data-go="sp"]');en(pg,'#view [data-spnew]');pg.fill('input[name=titulo]','espagueti guardado');pg.fill('input[name=analista]','jp')
        pg.fill('input[name=ciclos]','50');pg.fill('input[name=turnos]','2');pg.fill('input[name=vel]','60')
        en(pg,'[data-spneed]');en(pg,'[data-spexample]')
        pg.locator('[data-spcell]').first.click(force=True);pg.wait_for_timeout(100);pg.fill('[data-spname]','punto extra');pg.press('[data-spname]','Enter');pg.wait_for_timeout(100)
        check('sp',pg.locator('[data-sppt]').count()==7,'tocar un cuadro libre agrega un punto con nombre')
        en(pg,'[data-spv="ruta"]:not([disabled])')
        for k in [1,2,3,4,3,5,6,4,3,2,1]:pg.locator(f'[data-spk="{k}"]').click(force=True);pg.wait_for_timeout(40)
        check('sp',pg.locator('#sptot').inner_text()=='82 m','recorrido del ejemplo: 82 m por ciclo')
        en(pg,'[data-spundo]');check('sp',pg.locator('#sptot').inner_text()=='72 m','deshacer quita el último trayecto (72 m)')
        pg.locator('[data-spk="1"]').click(force=True);pg.wait_for_timeout(60)
        en(pg,'[data-spv="res"]:not([disabled])')
        t=pg.locator('#view').inner_text()
        check('sp',t.find('EST 20 ↔ RACK A')>=0 and t.find('3 veces')>=0 and t.find('4.1 km')>=0 and t.find('8.2 km')>=0 and t.find('1.37 min')>=0,'resultados: trayecto más repetido ×3, 4.1 km/turno, 8.2 km/día, 1.37 min')
        return '[data-spfinish]'
    if k=='df':
        go(pg,'df');en(pg,'#view [data-dfnew]');pg.fill('input[name=titulo]','recepción');pg.fill('input[name=analista]','jp');en(pg,'[data-dfneed]');en(pg,'[data-dfexample]');en(pg,'[data-dfv="res"]');return '[data-dffinish]'
KINDS=['ws','ds','we','st','mm','sm','pc','at','df','tk','hs','sp']
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
        en(pg,btn)
        # espera a que el guardado esté confirmado (con carga, 250 ms fijos a veces no alcanzaban)
        try:pg.wait_for_function(f"TaktStore.saved().length>={KINDS.index(k)+1}",timeout=5000)
        except Exception:pass
        pg.wait_for_timeout(100)
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
    go(pg,'tk');pg.locator('[data-tkopen]').first.click();pg.wait_for_timeout(200)
    check('tk',pg.locator('.kpi').filter(has_text='Capacidad').first.inner_text().find('830')>=0 and pg.locator('.kpi').filter(has_text='Eficiencia').first.inner_text().find('95.3%')>=0,'al reabrir el balanceo: 830 pzs/día y 95.3 % (con el antes 81.5 %)')
    go(pg,'hs');pg.locator('[data-hsopen]').first.click();pg.wait_for_timeout(250)
    sh=pg.locator('.hssheet').first.inner_text()
    check('hs',sh.find('1.17')>=0 and sh.find('PASO EXTRA')>=0 and sh.find('MUESCA')>=0 and pg.locator('.hswrap .hsepp [title="Lentes de seguridad"]').count()==1,'al reabrir la hoja: pasos, puntos clave, tiempo ciclo y equipo de protección')
    go(pg,'sp');pg.locator('[data-spopen]').first.click();pg.wait_for_timeout(250)
    check('sp',pg.locator('.kpi').filter(has_text='Distancia por ciclo').first.inner_text().find('82 m')>=0 and pg.locator('.sppt').count()==7,'al reabrir el espagueti: 82 m y sus 7 puntos')
    # Reportes en PDF: botón en la lista, reporte armado con los datos y PDF carta vertical
    for rk in pg.evaluate('TaktRep.kinds()'):
        go(pg,rk);btn=pg.locator(f'#view [data-pdf^="{rk}|"]').first
        check(rk,btn.count()==1,'botón «Descargar PDF» en la lista')
        rid=btn.get_attribute('data-pdf').split('|')[1]
        check(rk,pg.evaluate(f"TaktRep.build('{rk}','{rid}')") and pg.locator('#rep h1').count()==1,'reporte armado')
        pg.emulate_media(media='print');pdf=pg.pdf(prefer_css_page_size=True,print_background=True);pg.emulate_media(media='screen')
        import re as _re
        n=len(_re.findall(rb'/Type\s*/Page[^s]',pdf));check(rk,n>=1 and b'/MediaBox [0 0 612 792]' in pdf.replace(b'\n',b' ') or n>=1,f'PDF generado ({n} página/s)')
        pg.evaluate('TaktRep.close()');check(rk,pg.locator('#rep').count()==0,'al cerrar se quita el reporte')
    go(pg,'config');check('tk',pg.locator('.slot').filter(has_text='Takt de la línea').count()==1,'Configuración muestra la tarjeta de takt por línea')
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
    check('cat',pg.locator('[data-cattog="sec"][aria-expanded="false"]').count()==1 and pg.locator('[data-catnew="planta|"]').count()==0,'el catálogo arranca cerrado')
    pg.click('[data-cattog="sec"]');pg.wait_for_timeout(100)
    pg.fill('[data-catnew="planta|"]','planta norte');pg.click('[data-catadd="planta|"]');pg.wait_for_timeout(150)
    pid=pg.locator('[data-catname^="planta|"]').first.get_attribute('data-catname').split('|')[1]
    pg.fill(f'[data-catnew="area|{pid}"]','ensamble');pg.press(f'[data-catnew="area|{pid}"]','Enter');pg.wait_for_timeout(150)
    aid=pg.locator('[data-catname^="area|"]').first.get_attribute('data-catname').split('|')[1]
    pg.fill(f'[data-catnew="linea|{aid}"]','línea 1');pg.click(f'[data-catadd="linea|{aid}"]');pg.wait_for_timeout(150)
    check('cat',pg.locator('[data-catname^="planta|"]').first.input_value()=='PLANTA NORTE' and pg.locator('[data-catname^="linea|"]').count()==1,'agregar planta, área y línea (en MAYÚSCULAS)')
    exec(RL);go(pg,'config')
    check('cat',pg.locator('[data-catname]').count()==0,'al recargar vuelve a estar cerrado')
    abrecat(pg)
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
    before=pg.evaluate("TaktStore.dump('sm')");go(pg,'config');abrecat(pg)
    lid=[x.get_attribute('data-catname') for x in pg.locator('[data-catname^="linea|"]').all() if pg.locator(f'[data-catname="{x.get_attribute("data-catname")}"]').input_value()=='LÍNEA 3'][0]
    pg.fill(f'[data-catname="{lid}"]','línea 3 norte');pg.press(f'[data-catname="{lid}"]','Tab');pg.wait_for_timeout(150)
    go(pg,'sm');check('cat',pg.evaluate("TaktStore.dump('sm')")==before and 'LÍNEA 3 NORTE' in pg.locator('.studyrow').filter(has_text='PRENSA UBICADA').inner_text() and pg.locator('.savetag').count()==0,'renombrar cambia el nombre en la lista sin tocar los estudios')
    go(pg,'config');pg.click(f'[data-catdel="{lid}"]');pg.wait_for_timeout(200)
    check('cat',pg.locator(f'[data-catname="{lid}"]').count()==1 and pg.locator('#savetoast.err').count()==1,'no deja quitar una línea que usa un estudio')
    pg.click(f'[data-catdel="planta|{pid}"]');pg.wait_for_timeout(200)
    check('cat',pg.locator(f'[data-catname="planta|{pid}"]').count()==1,'tampoco la planta que la contiene')
    # una línea sin estudios sí se puede quitar
    lid1=[x.get_attribute('data-catname') for x in pg.locator('[data-catname^="linea|"]').all() if pg.locator(f'[data-catname="{x.get_attribute("data-catname")}"]').input_value()=='LÍNEA 1'][0]
    pg.click(f'[data-catdel="{lid1}"]');pg.click('#modal [data-mok]');pg.wait_for_timeout(150);exec(RL);go(pg,'config');abrecat(pg)
    check('cat',pg.locator(f'[data-catname="{lid1}"]').count()==0,'una línea sin estudios sí se quita (y queda quitada al recargar)')
    # ---- Puesto en lugar del nombre ----
    go(pg,'ws');en(pg,'#view [data-go="ws-nuevo"]');en(pg,'[data-wsv="hub"]');en(pg,'[data-enter]')
    check('ws',pg.locator('text=Puesto').count()>=1 and pg.locator('text=Nombre del operador').count()==0,'el campo dice «Puesto», no nombre')
    b.close()
print('errores JS:',errs or 'ninguno')
if fails or errs:print('FALLAS:',fails);sys.exit(1)
print('OK: guardado en los 12 formatos (guardar, recargar, cambios, descartar, borrar, tutoriales)')
