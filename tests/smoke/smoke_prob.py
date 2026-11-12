import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1024,1366,'tab'),(390,844,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.goto(IDX+'#st');pg.click('[data-stnew]')
        for k,v in [('parte','x1'),('proceso','ensamble'),('modelo','fgd'),('costo','1000'),('tcobj','1.2'),('analista','angel')]: pg.fill(f'input[name={k}]',v)
        pg.click('[data-stneed=info]');pg.click('[data-ststart]')
        pg.click('[data-stcause="2"]'); print(tag,'6M sugerido al crear:',end=' ')
        pg.click('[data-stnewprob]'); print(pg.locator('[data-stm6][aria-pressed=true]').inner_text())
        pg.fill('[data-stnp=est]','102'); pg.locator('#npdesc').type('se cae la herramienta'); pg.press('#npdesc','Enter')
        pg.click('[data-stlap]')
        pg.click('[data-strepeat]'); pg.click('[data-stlap]')
        pg.click('[data-stcause="2"]'); pg.click('[data-stnewprob]'); pg.click('[data-stnpest="102"]'); pg.fill('#npdesc','SWITCH NO ACCIONA'); pg.click('[data-stm6="Máquina"]'); pg.click('[data-stsaveprob]'); pg.click('[data-stlap]')
        pg.click('[data-stcause="2"]'); print(tag,'chips paro corto:',[x.inner_text().replace('\n',' ') for x in pg.locator('[data-stprob]').all()])
        pg.click('[data-stprob]'); pg.click('[data-stlap]'); pg.click('[data-stpause]')
        rows=pg.locator('.tbl.strec tbody tr').all()
        print(tag,'tabla:',[ (r.locator('[data-strc]').input_value(), r.locator('[data-strpb] option:checked').inner_text() if r.locator('[data-strpb]').count() else '-') for r in rows])
        pg.wait_for_timeout(300); pg.screenshot(path=f'/tmp/prob_{tag}.png')
    b.close()
print('ERRORS',errs)
