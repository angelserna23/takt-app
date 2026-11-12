import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':1000});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX+'#mm');pg.click('[data-mmnew]')
    pg.fill('input[name=linea]','c');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
    pg.locator('[data-mmv=tabla]:not([disabled])').last.click();pg.locator('[data-mmv=lay]:not([disabled])').last.click()
    pg.locator('[data-mmlay="c+"]').click()
    pg.locator('[data-mmcell="1,4"]').dispatch_event('click');pg.click('[data-mmaddat=man]');pg.click('[data-mmaddcancel]')
    box=lambda name:pg.locator(f'[data-mmbox][aria-label="{name}"]')
    box('MAQUINA 3').dispatch_event('click');pg.locator('[data-mmcell="0,4"]').dispatch_event('click')
    box('ESTACION MANUAL 1').dispatch_event('click');pg.locator('[data-mmcell="0,3"]').dispatch_event('click');pg.wait_for_timeout(200)
    pg.locator('.mmlay').screenshot(path='/tmp/mmcase.png')
    pg.locator('[data-mmv=est]:not([disabled])').first.click();print([x.inner_text() for x in pg.locator('.mmhd b').all()])
    b.close()
print('ERRORS',errs)
