import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,1000,'lap'),(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(tag+str(e)))
        pg.goto(IDX+'#mm');pg.click('[data-mmnew]')
        pg.fill('input[name=linea]','c');pg.fill('input[name=analista]','a');pg.click('[data-mmneed]');pg.click('[data-mmexample]')
        for v in ['tabla','lay','graf']: pg.locator(f'[data-mmv={v}]:not([disabled])').last.click()
        pg.wait_for_timeout(300)
        print(tag,[k.inner_text().split('\n')[1] for k in pg.locator('.kpi').all()])
        print(tag,pg.locator('.mmverdict').inner_text()[:140])
        pg.locator('.mmgraf').screenshot(path=f'/tmp/graf_{tag}.png')
        if tag=='tab': pg.screenshot(path='/tmp/graf_full_tab.png',full_page=True)
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
    b.close()
print('ERRORS',errs)
