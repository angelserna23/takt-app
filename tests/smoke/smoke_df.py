import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
def drag(pg,src,x,y):
    b=src.bounding_box();pg.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2);pg.mouse.down()
    pg.mouse.move(b['x']+b['width']/2,b['y']+b['height']/2+30,steps=4);pg.mouse.move(x,y,steps=10);pg.mouse.up();pg.wait_for_timeout(120)
def pop(pg):return pg.locator('#dfpop')
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
        pg.fill('input[name=titulo]','recepción de material');pg.fill('input[name=analista]','angel');pg.locator('[data-dfneed]').click();pg.wait_for_timeout(100)
        print(tag,'hoja en blanco: casillas +',pg.locator('[data-dfcell]').count(),'| barra',pg.locator('[data-dfpal]').count())
        if tag=='lap':
            sv=pg.locator('[data-dfsvg]').bounding_box();drag(pg,pg.locator('[data-dfpal=ini]'),sv['x']+90,sv['y']+70)
        else:pg.click('[data-dfpal=ini]')
        print(tag,'nube abierta',pop(pg).is_visible(),'hoja inferior' if 'sheet' in (pop(pg).get_attribute('class') or '') else 'junto al símbolo','| foco',pg.evaluate("document.activeElement&&document.activeElement.dataset.dff"))
        pg.fill('[data-dff=desc]','llega camión');pg.keyboard.press('Enter');print(tag,'Enter cierra la nube',pop(pg).count()==0)
        pg.click('[data-dfpal=op]');pg.fill('[data-dff=desc]','descargar');pg.fill('[data-dff=tiempo]','12')
        print(tag,'viene de (auto)',pg.locator('[data-dfprev] option:checked').inner_text())
        pg.click('[data-dfpal=dec]');pg.fill('[data-dff=desc]','¿cumple?')
        pg.click('[data-dfpal=tra]');pg.fill('[data-dff=desc]','llevar a almacén');pg.fill('[data-dff=dist]','40');pg.fill('[data-dff=tiempo]','3')
        print(tag,'transporte viene de',pg.locator('[data-dfprev] option:checked').inner_text())
        pg.click('[data-dfpal=dem]');h0=pg.locator('[data-dff=desc]').bounding_box()['height']
        larga='espera de disposición del material por parte del área de calidad y del proveedor antes de liberar'
        pg.locator('[data-dff=desc]').fill('');pg.locator('[data-dff=desc]').type(larga,delay=0)
        h1=pg.locator('[data-dff=desc]').bounding_box()['height'];print(tag,'acción larga: crece hacia abajo',h1>h0,round(h0),'→',round(h1),'| completo al pasar el mouse',larga.upper() in pg.locator('[data-dfbox] title').last.text_content())
        v=[o.get_attribute('value') for o in pg.locator('[data-dfprev] option').all() if 'NO' in o.inner_text()][0];pg.select_option('[data-dfprev]',v);pg.wait_for_timeout(80)
        print(tag,'demora viene de',pg.locator('[data-dfprev] option:checked').inner_text(),'| flechas',pg.locator('.dfarrow').count(),'etiquetas',[t.text_content() for t in pg.locator('.dfel').all()])
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.screenshot(path=f'/tmp/df_diag_{tag}.png',full_page=(tag!='phone'))
        pg.click('#dfpop [data-dfdesel].btn')
        if tag=='lap':
            pg.locator('.dflay').scroll_into_view_if_needed();bx=pg.locator('[data-dfbox]').last;sv=pg.locator('[data-dfsvg]').bounding_box();bb=bx.bounding_box()
            pg.mouse.move(bb['x']+40,bb['y']+40);pg.mouse.down();pg.mouse.move(bb['x']+80,bb['y']+70,steps=4);pg.mouse.move(sv['x']+sv['width']-60,sv['y']+70,steps=10);pg.mouse.up();pg.wait_for_timeout(100)
            print(tag,'movido a la derecha',pg.locator('[data-dfbox]').last.bounding_box()['x']>bb['x']+200)
        pg.locator('[data-dfv=res]').first.click();pg.wait_for_timeout(400)
        print(tag,'KPI',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()])
        print(tag,'tabla proceso',[r.inner_text().replace('\n',' ').replace('\t',' ')[:50] for r in pg.locator('.smtbl').nth(1).locator('tbody tr').all()])
        pg.click('[data-dffinish]');print(tag,'lista',pg.locator('[data-dfopen]').inner_text().replace('\n',' ')[:90])
    pg=b.new_page(viewport={'width':1366,'height':1000});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append('ej '+str(e)))
    pg.goto(IDX+'#df');pg.click('[data-dfnew]');pg.fill('input[name=titulo]','ej');pg.fill('input[name=analista]','a');pg.locator('[data-dfneed]').click();pg.click('[data-dfexample]');pg.wait_for_timeout(100)
    pg.locator('[data-dfbox]').nth(4).click();pg.wait_for_timeout(100);pg.screenshot(path='/tmp/df_ej.png',full_page=True)
    pg.locator('[data-dfv=res]').first.click();print('ejemplo KPI',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()],'avisos',pg.locator('.mmaddbar').count())
    b.close()
print('ERRORS',errs)
