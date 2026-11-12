import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
import pathlib
errs=[]
mins=[1.12,1.15,0.5,1.12,13.14145,5,5.6543,0.323,3.34141,0.324]
names=['Tomar pieza','Girar pieza','Sopletear pieza','Acomodar piezas','Trasladar piezas','Suministrar piezas','Inspeccionar piezas','Sopletear pieza','Llenar checklist','Dejar carrito']
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1440,900,'desk'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h})
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(IDX+'#estudios')
        pg.click('.fmt[data-go=ds]')
        pg.click('[data-dsnew]')
        pg.fill('input[name=titulo]','Análisis de ensamble 1')
        pg.fill('[data-dsg=obj]','6')
        pg.click('[data-need=info]')
        pg.click('[data-dsstart]'); pg.wait_for_timeout(300); pg.click('[data-dslap]'); pg.click('[data-dsstop]')
        pg.screenshot(path=f'/tmp/ds_{tag}_crono.png',full_page=True)
        # remove the 2 timed laps, then add manual ones
        for k in range(2):
            pg.click('[data-dsdel]'); pg.click('[data-mok]')
        for i,m in enumerate(mins):
            pg.click('[data-dsadd]')
            row=pg.locator('.dsrow').nth(0)
            row.locator('[data-dsf=min]').fill(str(m))
            row.locator('[data-dsf=name]').fill(names[i])
            row.locator('[data-dsf=material]').fill('Cascarones')
            row.locator('[data-dsf=racks]').fill('1')
            row.locator('[data-dsf=snp]').fill('4'); row.locator('[data-dsf=snp]').blur()
        # empty return trip
        pg.click('[data-dsadd]'); row=pg.locator('.dsrow').nth(0)
        row.locator('[data-dsf=min]').fill('2'); row.locator('[data-dsf=name]').fill('Regreso carrito vacío')
        row.locator('[data-dsf=racks]').fill('0'); row.locator('[data-dsf=snp]').fill('4'); row.locator('[data-dsf=snp]').blur()
        print(tag,'note:',pg.locator('.vnote').nth(0).inner_text())
        pg.screenshot(path=f'/tmp/ds_{tag}_crono2.png',full_page=True)
        pg.click('[data-need=crono]')
        print(tag,'occ op1:',pg.locator('.lane:not(.pool) .occ .mono').first.inner_text())
        pg.click('[data-dsopadd]')
        pg.click('.achip >> text=Trasladar piezas'); pg.locator('[data-dsmove]').nth(1).click()
        pg.click('.achip >> text=Regreso carrito'); pg.locator('[data-dsmove]').nth(1).click()
        pg.screenshot(path=f'/tmp/ds_{tag}_asig.png',full_page=True)
        pg.click('[data-need=asig]'); pg.wait_for_timeout(1000)
        pg.screenshot(path=f'/tmp/ds_{tag}_res.png',full_page=True)
        pg.click('[data-dsscen="1.2"]'); pg.wait_for_timeout(300)
        print(tag,'yocc +20%:',[x.inner_text() for x in pg.locator('.yocc').all()])
        pg.click('[data-dsfinish]')
        print(tag,pg.inner_text('.study').replace('\n',' | '))
    b.close()
print('ERRORS',errs)
