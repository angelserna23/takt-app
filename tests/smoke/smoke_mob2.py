import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    U=IDX+'#'
    for r,btn in [('st','[data-stnew]'),('ds','[data-dsnew]'),('mm','[data-mmnew]')]:
        pg.goto(U+r);pg.wait_for_timeout(100);pg.locator(btn).first.click();pg.wait_for_timeout(150)
        print(r,[ (x.inner_text().strip()[:30], round(x.bounding_box()['y'])) for x in pg.locator('section.panel .btn').all()][:6], 'alto', pg.evaluate('document.body.scrollHeight'))
    b.close()
