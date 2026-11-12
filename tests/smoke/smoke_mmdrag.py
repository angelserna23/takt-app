import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1366,'height':1400});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX+'#mm');pg.click('[data-mmnew]')
    pg.fill('input[name=linea]','c');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
    names=lambda:[x.inner_text() for x in pg.locator('.mmhd b').all()]
    print('antes',names())
    a=pg.locator('.mmcard').nth(7).locator('.mmhd b').bounding_box();t=pg.locator('.mmcard').nth(0).bounding_box()
    pg.mouse.move(a['x']+5,a['y']+5);pg.mouse.down();pg.mouse.move(a['x']+5,a['y']-20,steps=3);pg.mouse.move(t['x']+200,t['y']+5,steps=10);pg.mouse.up();pg.wait_for_timeout(200)
    print('despues',names())
    pg.locator('[data-mmv=tabla]:not([disabled])').last.click();pg.locator('[data-mmv=lay]:not([disabled])').last.click();pg.wait_for_timeout(200)
    pg.locator('[data-mmlay="c+"]').click();pg.wait_for_timeout(100);bx=pg.locator('[data-mmbox]').first.bounding_box();cell=pg.locator('[data-mmcell]').first.bounding_box()
    pg.mouse.move(bx['x']+30,bx['y']+30);pg.mouse.down();pg.mouse.move(bx['x']+60,bx['y']+60,steps=3);pg.mouse.move(cell['x']+40,cell['y']+40,steps=10);pg.mouse.up();pg.wait_for_timeout(200)
    pg.locator('[data-mmlay="c+"]').click();pg.wait_for_timeout(100)
    print('celdas libres',pg.locator('[data-mmcell]').count());pg.locator('.mmlay').screenshot(path='/tmp/mmdrag.png')
    b.close()
print('ERRORS',errs)
