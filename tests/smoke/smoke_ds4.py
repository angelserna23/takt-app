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
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1440,'height':900})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
    pg.goto(IDX+'#ds')
    pg.click('[data-dsnew]');pg.fill('[data-dsg=obj]','6');pg.click('[data-need=info]')
    add(pg,4,'Traslado',1,4);add(pg,2,'Inspección',1,4)
    pg.click('.row [data-need=crono]')
    # type objective 20 key by key in the lane
    inp=pg.locator('[data-dsopobj]').first;inp.click();pg.keyboard.type('20')
    print('obj typed:',pg.locator('[data-dsopobj]').first.input_value(),'occ',pg.locator('.lane:not(.pool) .occ .mono').first.inner_text())  # (1+0.5)*20=30 -> 50%
    pg.click('[data-dsnextop]');add(pg,1,'Surtir',1,2);pg.click('.row [data-need=crono]')
    # drag 'Inspección' from op1 to op2
    src=pg.locator('.achip >> text=Inspección').bounding_box();dst=pg.locator('[data-lane]').nth(2).bounding_box()
    pg.mouse.move(src['x']+20,src['y']+10);pg.mouse.down();pg.mouse.move(src['x']+60,src['y']+30,steps=4);pg.mouse.move(dst['x']+100,dst['y']+150,steps=8);pg.mouse.up()
    pg.wait_for_timeout(300)
    lanes=[l.inner_text().split('\n')[0] for l in pg.locator('[data-lane]').all()]
    print('op2 chips:',[c.inner_text().replace('\n',' ') for c in pg.locator('[data-lane]').nth(2).locator('.achip').all()])
    print('occs',[x.inner_text() for x in pg.locator('.lane:not(.pool) .occ .mono').all()])
    pg.click('[data-need=asig]');pg.wait_for_timeout(300)
    s=pg.locator('[data-dsscen=add]');s.click();pg.keyboard.type('10')
    print('scen add10:',pg.locator('.scen .sub').inner_text(),[x.inner_text() for x in pg.locator('.yocc').all()])
    s=pg.locator('[data-dsscen=pct]');s.click();pg.keyboard.type('25')
    print('scen +25%:',pg.locator('.scen .sub').inner_text())
    pg.wait_for_timeout(900);pg.screenshot(path='/tmp/ds4_res.png',full_page=True)
    b.close()
print('ERRORS',errs)
