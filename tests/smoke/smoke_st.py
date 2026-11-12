import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
import pathlib
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1440,900,'desk'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=(tag=='phone'))
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(IDX+'#estudios')
        pg.click('.fmt[data-go=st]');pg.click('[data-stnew]')
        pg.click('[data-stneed=info]'); print(tag,'missing:',pg.locator('.dslink.warn').inner_text())
        for k,v in [('parte','31023-ABCBC'),('proceso','Ensamble'),('modelo','FGD-12'),('costo','25,000'),('tcobj','1.2'),('analista','Angel'),('periodo','2026-11-10')]:
            pg.fill(f'input[name={k}]',v)
        pg.locator('input[name=costo]').blur(); print(tag,'costo shown:',pg.input_value('input[name=costo]'))
        pg.click('[data-stneed=info]')
        pg.click('[data-ststart]');pg.click('[data-stcause="2"]');pg.fill('#stprob','Sensor');pg.click('[data-stlap]');pg.click('[data-stlap]');pg.click('[data-stpause]')
        print(tag,'2 recs causes:',[x.input_value() for x in pg.locator('[data-strc]').all()])
        for k in range(2): pg.locator('[data-strdel]').first.click()
        pg.click('[data-stexample]')
        print(tag,'stats:',pg.locator('.ststats').first.inner_text().replace('\n',' '))
        pg.click('.row [data-stneed=reg]');pg.wait_for_timeout(900)
        print(tag,'kpis:',[x.inner_text().replace('\n',' ') for x in pg.locator('.kpi').all()][:2])
        pg.wait_for_timeout(1200); pg.locator('.stpt').nth(6).hover() if tag=='desk' else pg.locator('.stpt').nth(6).tap()
        print(tag,'tip:',pg.locator('#sttip').inner_text().replace('\n',' | '))
        pg.screenshot(path=f'/tmp/st_{tag}_res.png',full_page=True)
        pg.click('[data-stv=reg]');pg.wait_for_timeout(400);pg.screenshot(path=f'/tmp/st_{tag}_reg.png')
        pg.click('.row [data-stneed=reg]');pg.click('[data-stfinish]');print(tag,pg.inner_text('.study').replace('\n',' | '))
    b.close()
print('ERRORS',errs)
