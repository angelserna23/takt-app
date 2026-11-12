import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(IDX+'#st');pg.click('[data-stnew]')
        for k,v in [('parte','x1'),('proceso','ensamble'),('modelo','fgd'),('costo','1000'),('tcobj','1.2'),('analista','angel')]: pg.fill(f'input[name={k}]',v)
        pg.click('[data-stneed=info]');pg.click('[data-ststart]');pg.click('[data-stpause]') if pg.locator('[data-stpause]').count() else None
        pg.click('[data-stexample]');pg.locator('[data-stv=res]:not([disabled])').last.click();pg.wait_for_timeout(2000)
        c=pg.locator('.parchart').first;c.scroll_into_view_if_needed();pg.wait_for_timeout(300);c.screenshot(path=f'/tmp/par_{tag}.png')
    b.close()
print('ERRORS',errs)
