import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
import pathlib
errs=[]
def add(pg,mins,name,r,snp):
    pg.click('[data-dsadd]');row=pg.locator('.dsrow').nth(0)
    row.locator('[data-dsf=min]').fill(str(mins));row.locator('[data-dsf=name]').fill(name)
    row.locator('[data-dsf=racks]').fill(str(r));row.locator('[data-dsf=snp]').fill(str(snp));row.locator('[data-dsf=snp]').blur()
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1440,900,'desk'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(IDX+'#ds')
        pg.click('[data-dsnew]');pg.fill('input[name=titulo]','Surtido de engranes');pg.fill('[data-dsg=obj]','6');pg.click('[data-need=info]')
        add(pg,4,'Traslado',1,4); add(pg,2,'Regreso vacío',0,0)
        pg.click('[data-need=crono]')
        print(tag,'op1 occ',pg.locator('.lane:not(.pool) .occ .mono').first.inner_text())   # (4/4+2/4)*6=9 -> 15%
        pg.click('[data-dsnextop]')
        pg.fill('[data-dsopobj]','10')
        add(pg,3,'Inspección',1,5)
        pg.click('[data-need=crono]')
        print(tag,'occs',[x.inner_text() for x in pg.locator('.lane:not(.pool) .occ .mono').all()])  # op2: 0.6*10=6 -> 10%
        pg.wait_for_timeout(500); pg.screenshot(path=f'/tmp/ds3_{tag}_asig.png',full_page=True)
        pg.click('[data-dscrono]')   # back to op1
        print(tag,'back to', pg.locator('h2').first.inner_text())
        pg.click('[data-need=crono]')
        pg.click('[data-need=asig]');pg.wait_for_timeout(900)
        pg.screenshot(path=f'/tmp/ds3_{tag}_res.png',full_page=True)
        print(tag,'yocc',[x.inner_text() for x in pg.locator('.yocc').all()])
    b.close()
print('ERRORS',errs)
