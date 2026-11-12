import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
import pathlib
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1440,900,'desk'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(IDX+'#estudios')
        pg.click('.fmt[data-go=we]');pg.click('[data-dsnew]')
        pg.fill('input[name=titulo]','Análisis de ensamble');pg.fill('[data-dsg=obj]','10');pg.fill('[data-dsg=ciclos]','3')
        pg.click('[data-need=info]')
        for v in ['Tomar','Colocar','Ajustar']: pg.click(f'[data-weq="{v.upper()}"]')
        pg.fill('#weadd','Atornillar tapa');pg.press('#weadd','Enter')
        print(tag,'elems',[x.input_value() for x in pg.locator('[data-wename]').all()])
        pg.click('.row [data-need=elem]')
        for c in range(3):
            pg.click('[data-westart]')
            for i in range(4): pg.wait_for_timeout(20); pg.click('[data-wetap]')
        print(tag,'after 12 taps:',pg.locator('.clock .sub').first.inner_text(),'| start btn:',pg.locator('[data-westart]').count(),'tap:',pg.locator('[data-wetap]').count())
        # edit cells: set all Tomar=0.15 etc to known values
        vals=[0.15,0.3,0.45,0.65]
        for r,v in enumerate(vals):
            for c in range(3):
                inp=pg.locator(f'.tbl.wet tbody tr').nth(r).locator('input').nth(c); inp.fill(str(v)); inp.blur()
        print(tag,'total avg',pg.locator('#wtot').inner_text())   # 1.55
        pg.wait_for_timeout(300); pg.screenshot(path=f'/tmp/we_{tag}_crono.png',full_page=True)
        pg.click('.row [data-need=crono]')
        print(tag,'occ',pg.locator('.lane:not(.pool) .occ .mono').first.inner_text())   # 1.55*10=15.5/60=26%
        pg.click('[data-dsnextop]'); print(tag,'next view:',pg.locator('h2').first.inner_text())
        pg.click('[data-weq="MOVER"]'); pg.click('.row [data-need=elem]')
        for i in range(3): pg.click('[data-westart]'); pg.click('[data-wetap]')
        pg.click('.row [data-need=crono]')
        pg.click('[data-need=asig]'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'/tmp/we_{tag}_res.png',full_page=True)
        print(tag,'yocc',[x.inner_text() for x in pg.locator('.yocc').all()])
        pg.click('[data-dsfinish]'); print(tag,pg.inner_text('.study').replace('\n',' | '))
        # ciclo mode
        pg.click('[data-dsnew]'); pg.click('[data-dsper=ciclo]'); pg.fill('[data-dsg=disp]','1.2'); pg.click('[data-need=info]')
        pg.click('[data-weq="TOMAR"]'); pg.click('.row [data-need=elem]')
        pg.fill('.tbl.wet input >> nth=0','0.6'); pg.locator('.tbl.wet input').nth(0).blur()
        pg.click('.row [data-need=crono]'); print(tag,'ciclo occ',pg.locator('.lane:not(.pool) .occ .mono').first.inner_text())  # 0.6/1.2=50%
        # check DS still works / separate lists
        pg.goto(IDX+'#ds'); print(tag,'ds list empty:',pg.locator('.study').count())
    b.close()
print('ERRORS',errs)
