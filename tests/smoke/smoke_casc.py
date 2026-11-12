import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
import json
from playwright.sync_api import sync_playwright
fx=json.load(open(_pl.Path(__file__).resolve().parents[2]/'parts'/'st_fixture.json'))
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,900,'lap'),(1024,1366,'tab'),(820,1180,'tab8'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(IDX+'#st');pg.click('[data-stnew]')
        for k,v in [('parte','x1'),('proceso','ensamble'),('modelo','fgd'),('costo','1000'),('tcobj','1.2'),('analista','angel')]: pg.fill(f'input[name={k}]',v)
        pg.click('[data-stneed=info]')
        pg.click('[data-ststart]');pg.click('[data-stpause]') if pg.locator('[data-stpause]').count() else None
        pg.click('[data-stexample]');pg.locator('[data-stv=res]:not([disabled])').last.click()
        pg.wait_for_timeout(1500)
        card=pg.locator('.casc').locator('xpath=..')
        card.scroll_into_view_if_needed()
        bars=pg.locator('.casc .cbar').all();print(tag,'barras',len(bars),[x.locator('text').first.inner_html() for x in bars])
        bars[1].click(force=True);print(tag,pg.locator('#cascinfo').inner_text())
        pg.wait_for_timeout(300);card.screenshot(path=f'/tmp/casc_{tag}.png')
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
    b.close()
print('ERRORS',errs)
