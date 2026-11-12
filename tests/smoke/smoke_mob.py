import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
    U=IDX+'#'
    pg.goto(U+'mm');pg.click('[data-mmnew]');pg.screenshot(path='/tmp/mob_mm_info.png',full_page=True)
    pg.fill('input[name=linea]','engranes');pg.fill('input[name=analista]','angel');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
    pg.screenshot(path='/tmp/mob_mm_est.png',full_page=True)
    for r,btn in [('st','[data-stnew]'),('ds','[data-dsnew]'),('we','[data-dsnew]'),('sm','[data-smnew]')]:
        pg.goto(U+r);pg.wait_for_timeout(100)
        if pg.locator(btn).count(): pg.locator(btn).first.click()
        pg.wait_for_timeout(150);print(r,'mobfoot',pg.locator('.mobfoot').count(),'ultimo hijo es mobfoot',pg.evaluate("(()=>{const s=document.querySelector('section.panel');return s&&s.lastElementChild.classList.contains('mobfoot')})()"))
    pg.goto(U+'ws-nuevo');pg.wait_for_timeout(150);print('ws mobfoot',pg.locator('.mobfoot').count());pg.screenshot(path='/tmp/mob_ws.png',full_page=True)
    b.close()
print('ERRORS',errs)
