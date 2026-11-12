import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(IDX+'#mm');pg.click('[data-mmnew]')
        pg.fill('input[name=linea]','c');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
        pg.locator('[data-mmv=tabla]:not([disabled])').last.click();pg.locator('[data-mmv=lay]:not([disabled])').last.click()
        pg.locator('[data-mmlay="c+"]').click()
        pg.locator('[data-mmcell]').first.dispatch_event('click')
        pg.click('[data-mmaddat=man]');pg.wait_for_timeout(200)
        print(tag,'boxes',pg.locator('[data-mmbox]').count(),pg.locator('.mmaddbar.ok').inner_text()[:60])
        pg.locator('.mmlay').screenshot(path=f'/tmp/mmadd_{tag}.png')
        pg.click('[data-mmgocap]');pg.wait_for_timeout(200)
        print(tag,[x.inner_text() for x in pg.locator('.mmhd b').all()])
    b.close()
print('ERRORS',errs)
