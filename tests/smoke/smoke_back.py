import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,900,'lap'),(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(IDX+'#estudios');print(tag,'en estudios visible:',pg.locator('#backall').is_visible())
        for r in ['mm','st','ds','we','ws']:
            pg.goto(IDX+'#'+r);pg.wait_for_timeout(100)
            assert pg.locator('#backall').is_visible(),r
        pg.click('[data-mmnew]') if False else None
        pg.goto(IDX+'#mm');pg.click('[data-mmnew]');pg.wait_for_timeout(100);pg.locator('header.top').screenshot(path=f'/tmp/back_{tag}.png')
        pg.click('#backall');pg.wait_for_timeout(100);print(tag,'regresa a',pg.evaluate('location.hash'))
    b.close()
print('ERRORS',errs)
