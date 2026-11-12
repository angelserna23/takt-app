import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,t in [(1024,1366,'tab'),(393,851,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(t+str(e)))
        pg.goto(IDX+'#pc');pg.click('[data-pcnew]');pg.fill('input[name=nombre]','maquinado');pg.locator('[data-pcneed]').last.click();pg.click('[data-pcexample]')
        # junio: copiar y cambiar JPH línea 2
        pg.click('[data-pcm="2"]');pg.click('[data-pccopy="1"]');pg.locator('.pchd').nth(1).click();pg.fill('[data-pcf$="|jph"]','55');pg.fill('[data-pcf$="|hcOtros"]','6')
        pg.locator('.pcbottom [data-pcv=res]').click();pg.wait_for_timeout(300)
        print(t,[k.inner_text().replace('\n',' | ') for k in pg.locator('.kpi').all()])
        for k in ['jph','oee','lat']:
            pg.click(f'[data-pctr={k}]');pg.wait_for_timeout(100)
        pg.screenshot(path=f'/tmp/pcres_{t}.png',full_page=True)
        print(t,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
    b.close()
print('ERRORS',errs)
