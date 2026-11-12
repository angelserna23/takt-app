import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
import pathlib
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1440,900,'desk'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(IDX+'#st')
        pg.click('[data-stnew]')
        for k,v in [('parte','X'),('proceso','Ensamble'),('modelo','FGD-12'),('costo','25,000'),('tcobj','1.2'),('analista','Angel')]: pg.fill(f'input[name={k}]',v)
        print(tag,'jph auto:',pg.inner_text('#jphAuto')); pg.fill('input[name=oeePlan]','100'); print(tag,'jph auto 100:',pg.inner_text('#jphAuto')); pg.fill('input[name=oeePlan]','85')
        pg.click('[data-stneed=info]');pg.click('[data-stexample]');pg.click('.row [data-stneed=reg]');pg.wait_for_timeout(500)
        print(tag,'formula:',pg.locator('.costgrid').inner_text().replace('\n',' ')[:60])
        pg.click('.linkbtn');pg.fill('input[name=oeePlan]','100');pg.fill('input[name=hd]','20');pg.click('[data-stneed=info]');pg.click('.row [data-stneed=reg]');pg.wait_for_timeout(1000)
        print(tag,'oee100, 20h:',pg.locator('.costgrid').inner_text().replace('\n',' '))
        print(tag,'note:',pg.locator('.projnote').inner_text()[:90])
        pg.screenshot(path=f'/tmp/cost_{tag}.png',full_page=True)
    b.close()
print('ERRORS',errs)
