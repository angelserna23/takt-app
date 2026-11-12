import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1024,'height':1366},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
    U=IDX+'#'
    # MM
    pg.goto(U+'mm');pg.click('[data-mmnew]');pg.fill('input[name=linea]','engranes');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('#backall');pg.click('[data-go=mm]')
    # ST
    pg.goto(U+'st');pg.click('[data-stnew]')
    for k,v in [('parte','x1'),('proceso','ens'),('modelo','m'),('costo','10'),('tcobj','1.2'),('analista','a')]: pg.fill(f'input[name={k}]',v)
    pg.click('[data-stneed=info]')
    # DS
    pg.goto(U+'ds');pg.click('[data-dsnew]') if pg.locator('[data-dsnew]').count() else None
    for r in ['mm','st']:
        pg.goto(U+r);pg.wait_for_timeout(100);n0=pg.locator('.studyrow').count()
        pg.locator('[data-sdel]').first.click();pg.click('[data-mok]');pg.wait_for_timeout(100)
        print(r,n0,'->',pg.locator('.studyrow').count())
    pg.goto(U+'mm');pg.wait_for_timeout(100)
    b.close()
print('ERRORS',errs)
