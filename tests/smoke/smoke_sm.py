import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,1000,'lap'),(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(tag+str(e)))
        pg.goto(IDX+'#estudios');pg.click('[data-go=sm]');pg.click('[data-smnew]')
        pg.click('[data-smneed]');print(tag,'faltan',pg.locator('label.miss').count())
        pg.fill('input[name=linea]','prensa 400');pg.fill('input[name=analista]','angel');pg.fill('input[name=de]','mod-a');pg.fill('input[name=a]','mod-b')
        pg.fill('input[name=tcobj]','1.2');pg.fill('input[name=cpw]','10');pg.click('[data-smneed]')
        # cronómetro: 2 pasos
        pg.click('[data-smstart]');pg.click('[data-smact^="BUSCAR"]');pg.wait_for_timeout(300);pg.click('[data-smlap]')
        pg.click('[data-smact^="OTRO"]');pg.fill('#smdesc','quitar guarda');pg.wait_for_timeout(200);pg.click('[data-smstop]')
        print(tag,'pasos',[x.input_value() for x in pg.locator('[data-smd]').all()])
        for x in pg.locator('[data-smsdel]').all(): pass
        while pg.locator('[data-smsdel]').count(): pg.locator('[data-smsdel]').first.click()
        pg.click('[data-smexample]');pg.screenshot(path=f'/tmp/sm_reg_{tag}.png')
        pg.locator('[data-smv=anal]:not([disabled])').last.click()
        print(tag,'anal kpis',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()])
        # decisiones del ejemplo de la prueba
        pg.locator('.smrow',has_text='REGRESAR DADO').locator('[data-smcls$="|I"]').click()
        pg.locator('.smrow',has_text='AJUSTE DE ALTURA').locator('[data-smtn]').fill('1.5')
        pg.wait_for_timeout(100);print(tag,'prop en vivo',pg.locator('#smprop').inner_text())
        pg.screenshot(path=f'/tmp/sm_anal_{tag}.png',full_page=True)
        pg.locator('[data-smv=res]:not([disabled])').last.click();pg.wait_for_timeout(300)
        print(tag,'res',[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()])
        print(tag,[x.inner_text().replace('\n',' ')[:110] for x in pg.locator('.mmproj').all()])
        pg.screenshot(path=f'/tmp/sm_res_{tag}.png',full_page=True)
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.click('[data-smfinish]');pg.wait_for_timeout(300);print(tag,'lista',pg.locator('[data-smopen]').count())
        pg.locator('[data-sdel^="sm|"]').click();pg.click('[data-mok]');pg.wait_for_timeout(200);print(tag,'tras borrar',pg.locator('[data-smopen]').count())
    b.close()
print('ERRORS',errs)
