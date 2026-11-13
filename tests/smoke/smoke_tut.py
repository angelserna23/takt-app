# Prueba de pantalla de «Aprende»: corre cada tutorial listo en demo (bot) y en modo guiado (la prueba hace de usuario)
# en laptop, tablet y teléfono. Falla si un paso no encuentra su botón (la pantalla cambió) o si queda historial.
import pathlib as _pl, sys
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
fails=[];errs=[]
def check(tag,cond,msg):
    print(tag,('OK ' if cond else 'FALLA ')+msg)
    if not cond:fails.append(tag+' '+msg)
def wait_state(pg,fn,ms=60000):
    pg.wait_for_function(fn,timeout=ms)
with sync_playwright() as p:
    b=p.chromium.launch()
    import os;ONLY=os.environ.get('SOLO')
    for w,h,tag in [(1366,900,'lap'),(1024,1366,'tab'),(393,851,'phone')]:
        if ONLY and tag!=ONLY:continue
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e,t=tag:errs.append(t+' '+str(e)))
        pg.goto(IDX+('#config' if tag=='phone' else '#estudios'))
        # Entrada: menú lateral en laptop/tablet; en teléfono desde «Más»
        (pg.locator('.atmore [data-go=aprende]') if tag=='phone' else pg.locator('.navbtn[data-go=aprende]')).click();pg.wait_for_timeout(150)
        check(tag,pg.locator('.tutcard').count()==10,'10 tarjetas de tutorial')
        check(tag,pg.locator('.tutcard.off').count()==0,'ninguna marcada como próximamente')
        if tag!='phone':check(tag,pg.locator('.navbtn[aria-current=page]').get_attribute('data-go')=='aprende','menú Aprende activo')
        tl=pg.evaluate('TaktTut.list()')
        # Estudio previo del usuario: no debe tocarse
        pg.evaluate("location.hash='ws'");pg.wait_for_timeout(100)
        check(tag,pg.locator('#view [data-go="aprende-ws"]').count()==1,'botón «Ver tutorial» en la lista de Work Sampling')
        pg.locator('#view [data-go="ws-nuevo"]').click();pg.fill('input[name=titulo]','MI ESTUDIO REAL');pg.click('[data-wsv="hub"]');pg.wait_for_timeout(100)
        before=pg.evaluate('TaktTut.counts()')
        for t in [x for x in tl if x['ready']]:
            tid=t['id']
            # --- DEMO: el bot hace todo (velocidad 20× para la prueba) ---
            pg.evaluate(f"location.hash='aprende-{tid}'");pg.wait_for_timeout(150)
            pg.click(f'[data-tutgo="{tid}|demo"]');pg.wait_for_timeout(300)
            check(tag,pg.locator('#tut .tutshield').evaluate('e=>getComputedStyle(e).pointerEvents')=='auto','demo bloquea toques del usuario')
            pg.evaluate("TaktTut.exit()");pg.wait_for_timeout(100)
            pg.evaluate(f"TaktTut.start('{tid}','demo',20)")
            wait_state(pg,"document.body.dataset.tut==='fin'||document.body.dataset.tut==='error'")
            st=pg.evaluate("document.body.dataset.tut");err=pg.evaluate("(TaktTut.state()||{}).err")
            check(tag,st=='fin',f'{tid} demo termina sin errores'+('' if st=='fin' else ' → '+str(err)))
            if tid=='ws':check(tag,pg.locator('.kpi').filter(has_text='Innecesario').first.inner_text().find('20.0%')>=0,'ws demo: 20.0 % innecesario (4 de 20)')
            check(tag,pg.locator('#tut .tutend').is_visible(),'tarjeta final visible')
            # «Ahora hazlo tú» desde la tarjeta final
            pg.click('#tut .tutend [data-tutc="tu"]');pg.wait_for_timeout(300);pg.evaluate('TaktTut.speed(20)')
            check(tag,pg.locator('#tut .tutshield').evaluate('e=>getComputedStyle(e).pointerEvents')=='none','guiado deja tocar la app')
            # --- GUIADO: la prueba hace de usuario ---
            import time;t0=time.time()
            while time.time()-t0<90:
                s=pg.evaluate("TaktTut.state()")
                if pg.evaluate("document.body.dataset.tut")=='fin':break
                if not s or not s['expect']:pg.wait_for_timeout(80);continue
                e=s['expect'];i=s['i']
                if i==2:  # un toque fuera de lugar no avanza ni hace nada
                    pg.mouse.click(5,h-5 if tag!='phone' else 200);pg.wait_for_timeout(120)
                    check(tag,pg.evaluate("TaktTut.state().i")==2,'guiado: toque fuera del objetivo no avanza')
                if 'toca' in e:
                    pg.evaluate('TaktTut.mark()');L=pg.locator('[data-tutt]');L.click(force=L.evaluate('e=>e instanceof SVGElement'))
                elif 'escribe' in e:
                    pg.evaluate('TaktTut.mark()');f=pg.locator('[data-tutt]');f.fill('');f.type(e['valor']);f.press('Enter')
                elif 'serie' in e:
                    for k in range(e['nTu']):
                        pg.evaluate('TaktTut.mark()');pg.locator('[data-tutt]').click();pg.wait_for_timeout(60)
                else:pg.click('#tut [data-tutc="next"]')
                try:pg.wait_for_function(f"(TaktTut.state()&&TaktTut.state().i>{i})||document.body.dataset.tut==='fin'",timeout=8000)
                except Exception:
                    check(tag,False,f'{tid} guiado se atoró en el paso {i+1}: {e} · {pg.evaluate("TaktTut.state()")}');break
            check(tag,pg.evaluate("document.body.dataset.tut")=='fin',f'{tid} guiado termina')
            if tid=='ws':check(tag,pg.evaluate("document.querySelector('[data-oname]')===null")and pg.locator('.kpi').filter(has_text='Observaciones').first.inner_text().find('10')>=0,'ws guiado: 10 observaciones del usuario')
            # Salir: se descarta todo y regresa el estudio real
            pg.click('#tut .tutend [data-tutc="exit"]');pg.wait_for_timeout(200)
            check(tag,pg.evaluate('TaktTut.counts()')==before,f'{tid}: sin historial al salir {pg.evaluate("TaktTut.counts()")}')
            check(tag,pg.evaluate("location.hash")==f'#aprende-{tid}' and pg.locator('#tut').count()==0,'regresa a la ficha y quita la capa')
            pg.click('#view [data-go="aprende"]');pg.wait_for_timeout(100)
            check(tag,pg.locator(f'.tutcard[data-go="aprende-{tid}"] .tag').inner_text()=='VISTO','tarjeta marcada como VISTO')
        pg.evaluate("location.hash='ws'");pg.wait_for_timeout(100)
        check(tag,pg.locator('.study').count()==1 and 'MI ESTUDIO REAL' in pg.locator('.study').first.inner_text(),'el estudio real del usuario sigue intacto')
        # Salir a media demo también descarta
        pg.evaluate("TaktTut.start('ws','demo',4)");pg.wait_for_function("TaktTut.state()&&TaktTut.state().i>=6",timeout=30000)
        pg.click('#tut [data-tutc="exit"]');pg.wait_for_timeout(200)
        check(tag,pg.evaluate('TaktTut.counts()')==before,'salir a media demo no deja historial')
        pg.screenshot(path=f'/tmp/tut_{tag}.png')
    b.close()
print('errores JS:',errs or 'ninguno')
if fails or errs:print('FALLAS:',fails);sys.exit(1)
print('OK: tutoriales (demo + guiado) en laptop, tablet y teléfono')
