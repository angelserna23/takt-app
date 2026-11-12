import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':393,'height':851},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX+'#ds');pg.click('[data-dsnew]');pg.locator('[data-dsv=crono]').last.click()
    pg.click('[data-dsstart]')
    for n in ['ir por bomba a almacen','registrar bomba']:
        pg.fill('#curname',n);pg.fill('[data-dscur=racks]','1');pg.wait_for_timeout(150);pg.click('[data-dslap]')
    print('chips',[x.inner_text() for x in pg.locator('[data-dspick]').all()])
    print('racks precargado',pg.locator('[data-dscur=racks]').input_value(),'| nombre vacío:',repr(pg.locator('#curname').input_value()))
    pg.locator('[data-dspick]').nth(1).click();print('tras tocar chip:',pg.locator('#curname').input_value())
    pg.wait_for_timeout(150);pg.click('[data-dslap]');print('registradas',[x.input_value() for x in pg.locator('[data-dsf=name]').all()])
    pg.evaluate("document.querySelector('.tabbar')&&(document.querySelector('.tabbar').style.display='none')")
    pg.locator('.dscap').scroll_into_view_if_needed();pg.locator('.dscap').screenshot(path='/tmp/dscap3.png')
    b.close()
print('ERRORS',errs)
