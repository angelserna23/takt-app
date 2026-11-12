import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1024,'height':1366},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(IDX+'#mm');pg.click('[data-mmnew]')
    pg.fill('input[name=linea]','c');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
    pg.click('[data-mmadd=man]');pg.fill('[data-mmf$="|name"] >> nth=-1','sopleteadora')
    pg.locator('[data-mmact$="|SOPLETEO"]').last.click();pg.locator('[data-mmat]').last.fill('0.25')
    pg.locator('.mmcard.on').screenshot(path='/tmp/mman.png')
    # subirla entre maquina 1 y 2
    for _ in range(6): pg.locator('.mmcard.on [data-mmup]').click()
    print([x.inner_text() for x in pg.locator('.mmhd b').all()])
    pg.locator('[data-mmv=tabla]:not([disabled])').last.click()
    print(pg.locator('.mmtbl tbody tr').nth(7).locator('input').evaluate_all('e=>e.map(x=>x.value)'))
    b.close()
print('ERRORS',errs)
