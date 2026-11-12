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
        pg.goto(IDX+'#ds')
        pg.click('[data-dsnew]');pg.fill('[data-dsg=obj]','6');pg.click('[data-need=info]')
        pg.fill('#curname','Movimiento de piezas');pg.fill('[data-dscur=material]','Engranes');pg.fill('[data-dscur=racks]','1');pg.fill('[data-dscur=snp]','5')
        pg.click('[data-dsstart]');pg.wait_for_timeout(400);pg.click('[data-dslap]')
        y0=pg.evaluate('scrollY')
        pg.keyboard.type('Traslado')   # focus should be on the name field
        pg.click('[data-dslap]')
        pg.fill('#curname','Inspección de engranes');pg.click('[data-dscva="0"]');pg.click('[data-dsstop]')
        names=[x.input_value() for x in pg.locator('.dsrow [data-dsf=name]').all()]
        mats=[x.input_value() for x in pg.locator('.dsrow [data-dsf=material]').all()]
        print(tag,'list(newest first):',names,mats,'scroll',y0,pg.evaluate('scrollY'),'cur material:',pg.input_value('[data-dscur=material]'))
        pg.screenshot(path=f'/tmp/ds2_{tag}.png')
    b.close()
print('ERRORS',errs)
