import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1024,1366,'tab'),(1366,900,'lap'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e:errs.append(tag+': '+str(e)))
        pg.goto(IDX+'#estudios');pg.click('[data-go=mm]');pg.click('[data-mmnew]')
        pg.click('[data-mmneed]');print(tag,'faltan',pg.locator('label.miss').count())
        pg.fill('input[name=linea]','celda 3');pg.fill('input[name=analista]','angel');pg.click('[data-mmneed]')
        pg.click('[data-mmexample]')
        # agregar gemela con cronómetro
        pg.click('[data-mmadd=maq]');pg.locator('[data-mmn$="|2"]').click()
        pg.locator('[data-mmtc$="|0"]').last.fill('2.4');pg.locator('[data-mmtc$="|1"]').last.fill('2,4')
        pg.locator('[data-mmclk*="|cd|"]').last.click();pg.wait_for_timeout(700);pg.locator('[data-mmclk*="|cd|"]').last.click()
        pg.locator('[data-mmact$="|SOPLETEO"]').last.click();pg.locator('[data-mmat]').last.fill('0.1')
        pg.locator('[data-mmact$="|REGISTRO"]').last.click();pg.locator('[data-mmat]').last.fill('0.2');pg.locator('[data-mmwhen$="|1"]').last.click()
        for _ in range(3): pg.locator('[data-mmp$="|1"]').last.click()
        pg.wait_for_timeout(200);pg.screenshot(path=f'/tmp/mm_est_{tag}.png',full_page=False)
        pg.locator('.mmcard.on').screenshot(path=f'/tmp/mm_card_{tag}.png')
        pg.click('[data-mmv=tabla]:not([disabled])');pg.wait_for_timeout(300)
        print(tag,[r.inner_text().split('\t')[1] if '\t' in r.inner_text() else r.inner_text()[:30] for r in pg.locator('.mmtbl tbody tr th').all()])
        print(tag,'kpis',[k.inner_text().replace('\n',' | ') for k in pg.locator('.kpi').all()])
        pg.locator('.mmtbl').screenshot(path=f'/tmp/mm_tbl_{tag}.png')
        pg.locator('[data-mmv=lay]:not([disabled])').last.click();pg.wait_for_timeout(300)
        pg.locator('[data-mmbox]').first.click();pg.locator('[data-mmlay="c+"]').click() if False else None
        pg.locator('.mmlay').screenshot(path=f'/tmp/mm_lay_{tag}.png')
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.locator('[data-mmv=graf]:not([disabled])').last.click();pg.click('[data-mmfinish]');pg.wait_for_timeout(400);print(tag,'lista',pg.locator('[data-mmopen]').count())
    b.close()
print('ERRORS',errs)
