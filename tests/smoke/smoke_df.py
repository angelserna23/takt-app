import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,1000,'lap'),(1024,1366,'tab'),(393,851,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(tag+' '+str(e)))
        pg.goto(IDX+('#config' if tag=='phone' else '#estudios'))
        print(tag,'ya no está en Estudios',pg.locator('.fmt[data-go=df]').count()==0)
        (pg.locator('.atmore [data-go=df]') if tag=='phone' else pg.locator('.navbtn[data-go=df]')).click();pg.wait_for_timeout(150)
        print(tag,'menú activo',pg.locator('.navbtn[aria-current=page]').get_attribute('data-go'),'| regresar a estudios oculto',pg.locator('#backall').is_hidden())
        pg.click('[data-dfnew]')
        pg.locator('[data-dfneed]').click();print(tag,'faltan',pg.locator('label.miss').count())
        pg.fill('input[name=titulo]','recepción de material');pg.fill('input[name=analista]','angel');pg.locator('[data-dfneed]').click()
        # 1) casilla libre → Inicio
        pg.locator('[data-dfcell="0,0"]').click();pg.click('[data-dfaddt=ini]');pg.wait_for_timeout(50)
        print(tag,'pide acción (foco)',pg.evaluate("document.activeElement&&document.activeElement.dataset.dff"))
        pg.fill('[data-dff=desc]','llega camión')
        # 2) + SIGUIENTE → operación
        pg.locator('[data-dfghost]').first.click();pg.click('[data-dfaddt=op]');pg.fill('[data-dff=desc]','descargar');pg.fill('[data-dff=tiempo]','12')
        # 3) + SIGUIENTE → decisión → aparecen SÍ y NO
        pg.locator('[data-dfghost]').first.click();pg.click('[data-dfaddt=dec]');pg.fill('[data-dff=desc]','¿cumple?')
        gl=[g.get_attribute('data-dfghost').split(',')[3] for g in pg.locator('[data-dfghost]').all()];print(tag,'salidas de la decisión',gl)
        pg.locator('[data-dfghost$=",yes"]').click();pg.click('[data-dfaddt=tra]');pg.fill('[data-dff=desc]','llevar a almacén');pg.fill('[data-dff=dist]','40');pg.fill('[data-dff=tiempo]','3')
        # seleccionar la decisión y agregar NO
        dec=pg.locator('[data-dfbox]').nth(2);dec.click();pg.locator('[data-dfghost$=",no"]').click();pg.click('[data-dfaddt=dem]');pg.fill('[data-dff=desc]','espera calidad')
        print(tag,'flechas',pg.locator('.dfarrow:not(.ghost)').count(),'etiquetas',[t.text_content() for t in pg.locator('.dfel').all()])
        print(tag,'mayúsculas',pg.locator('.dfdesc').first.text_content())
        pg.screenshot(path=f'/tmp/df_diag_{tag}.png',full_page=True)
        # arrastrar (en laptop con mouse)
        if tag=='lap':
            pg.click('[data-dfdesel]');pg.locator('.dflay').scroll_into_view_if_needed();pg.evaluate('scrollBy(0,-120)');box=pg.locator('[data-dfbox]').last.bounding_box();cell=pg.locator('[data-dfcell="0,3"]').bounding_box()
            pg.mouse.move(box['x']+40,box['y']+40);pg.mouse.down();pg.mouse.move(box['x']+80,box['y']+60,steps=4);pg.mouse.move(cell['x']+40,cell['y']+40,steps=8);pg.mouse.up();pg.wait_for_timeout(100)
            print(tag,'movido a 0,3:',pg.locator('[data-dfcell="0,3"]').count()==0,'flechas',pg.locator('.dfarrow:not(.ghost)').count())
        pg.locator('[data-dfv=res]').first.click();pg.wait_for_timeout(100)
        print(tag,'KPI',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()],'avisos',pg.locator('.mmaddbar b').first.inner_text() if pg.locator('.mmaddbar').count() else 0)
        print(tag,'tabla proceso',[r.inner_text().replace('\n',' ').replace('\t',' ')[:60] for r in pg.locator('.smtbl').nth(1).locator('tbody tr').all()])
        pg.screenshot(path=f'/tmp/df_res_{tag}.png',full_page=True)
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.click('[data-dffinish]');print(tag,'lista',pg.locator('[data-dfopen]').inner_text().replace('\n',' ')[:90])
    # ejemplo
    pg=b.new_page(viewport={'width':1366,'height':1000});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append('ej '+str(e)))
    pg.goto(IDX+'#df');pg.click('[data-dfnew]');pg.fill('input[name=titulo]','ej');pg.fill('input[name=analista]','a');pg.locator('[data-dfneed]').click();pg.click('[data-dfexample]');pg.wait_for_timeout(100)
    pg.screenshot(path='/tmp/df_ej.png',full_page=True);pg.locator('[data-dfv=res]').first.click()
    print('ejemplo KPI',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()],'avisos',pg.locator('.mmaddbar').count())
    pg.screenshot(path='/tmp/df_ej_res.png',full_page=True)
    b.close()
print('ERRORS',errs)
