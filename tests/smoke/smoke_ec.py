import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,1000,'lap'),(1024,1366,'tab'),(393,851,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(tag+' '+str(e)))
        pg.goto(IDX+'#at');pg.click('[data-ecopen]');pg.wait_for_timeout(100)
        print(tag,'vacío:',pg.locator('.slot.empty b').inner_text())
        pg.click('[data-ecexample]');pg.wait_for_timeout(200)
        k=[x.inner_text().split('\n')[1] for x in pg.locator('.pck8 .kpi').all()];print(tag,'KPI',k)
        rows=[r.inner_text().replace('\n',' ').replace('\t',' ') for r in pg.locator('.ectbl tbody tr').all()];print(tag,'tabla',rows[0][:70],'|',rows[-1][:70])
        print(tag,'líneas',pg.locator('.stchart polyline').count(),'mini',pg.locator('.ecmini svg').count())
        pg.click('[data-ecmode=sin]');pg.wait_for_timeout(100);print(tag,'sin afectación planta mes',pg.locator('.pck8 .kpi').nth(2).inner_text().split('\n')[1])
        pg.screenshot(path=f'/tmp/ec_{tag}.png',full_page=True)
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.click('.atback');pg.wait_for_timeout(100);print(tag,'lista AT',pg.locator('[data-atopen]').count())
    b.close()
print('ERRORS',errs)
