import pathlib as _pl
IDX='file://'+str(_pl.Path(__file__).resolve().parents[2]/'index.html')
from playwright.sync_api import sync_playwright
errs=[]
def kpis(pg):return [k.inner_text().split('\n')[1] for k in pg.locator('[data-atlive] .kpi').all()]
with sync_playwright() as p:
    b=p.chromium.launch()
    for w,h,tag in [(1366,1000,'lap'),(1024,1366,'tab'),(393,851,'phone')]:
        pg=b.new_page(viewport={'width':w,'height':h},has_touch=True);pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append(tag+' '+str(e)))
        pg.goto(IDX+('#config' if tag=='phone' else '#estudios'))
        if tag=='phone':pg.locator('.atmore [data-go=at]').click()
        else:pg.locator('.navbtn[data-go=at]').click()
        pg.wait_for_timeout(100);pg.click('[data-atnew]')
        pg.locator('[data-atneed]').last.click();print(tag,'falta nombre',pg.locator('label.miss').count())
        pg.fill('input[name=nombre]','ensamble planta 1');print(tag,'mayúsculas',pg.input_value('input[name=nombre]'))
        pg.locator('[data-atneed]').last.click()
        pg.click('[data-atexample]');pg.wait_for_timeout(150)
        print(tag,'general: meses',pg.locator('.atmonths .pcm.ok').count(),'tarjetas del año',[k.inner_text().split('\n')[1] for k in pg.locator('.pck8 .kpi').all()][:4],'campos visibles',pg.locator('[data-atf]').count())
        pg.click('.atmonths [data-atm="0"]');pg.wait_for_timeout(100)
        print(tag,'abril ens',kpis(pg))
        assert kpis(pg)[0]=='72.00' and kpis(pg)[1]=='50.00', kpis(pg)
        pg.screenshot(path=f'/tmp/at_mes_{tag}.png',full_page=True)
        # editar producción de la parte A: 12000 → 18000 (horas trabajadas 24000 ÷ 26000 pzas × 60 = 55.38)
        pg.locator('[data-atp$="|prod"]').first.fill('18,000');pg.wait_for_timeout(100)
        print(tag,'tras editar prod',kpis(pg)[0],'| total',pg.locator('[data-atpt=prod]').inner_text())
        assert kpis(pg)[0]=='55.38'
        # días inválidos
        pg.fill('[data-atf=dias]','34');pg.wait_for_timeout(50);print(tag,'días 34 marcado',pg.locator('label.miss [data-atf=dias]').count(),pg.locator('label.miss .athint').inner_text())
        pg.fill('[data-atf=dias]','20')
        # LAT de manejo de materiales: se captura una vez en la primera parte y se copia a las demás
        pg.locator('[data-atp$="|lat"]').fill('10');pg.wait_for_timeout(50)
        print(tag,'LAT copiado',[e.input_value() for e in pg.locator('[data-atlatc]').all()],'editables',pg.locator('[data-atp$="|lat"]').count())
        pg.click('[data-atpadd]');print(tag,'parte nueva hereda LAT',pg.locator('[data-atlatc]').last.input_value())
        pg.locator('[data-atpdel]').last.click();pg.click('#modal [data-mok]')
        # abajo: ensamble → manejo de materiales → guardar
        pg.locator('.pcbottom [data-atarea=mh]').click();pg.wait_for_timeout(100);print(tag,'MH abril',kpis(pg)[:2],'| abajo:',pg.locator('.pcbottom').inner_text().replace('\n',' '))
        pg.click('[data-atsave]');pg.wait_for_timeout(150);print(tag,'tras guardar →',pg.locator('h2').first.inner_text())
        pg.locator('[data-atv=mes]').last.click();pg.click('.atmonths [data-atm="0"]')
        # copiar a junio
        pg.locator('[data-atmall]').first.click();pg.click('.atmonths [data-atm="5"]');pg.click('[data-atcopy="4"]');print(tag,'junio copiado partes',pg.locator('[data-atp$="|parte"]').count())
        pg.locator('[data-atv=res]:not([disabled])').last.click();pg.wait_for_timeout(300)
        print(tag,'tabla meses',pg.locator('.smtbl tbody tr').count(),'gráficas',pg.locator('.stchart svg').count())
        pg.screenshot(path=f'/tmp/at_res_{tag}.png',full_page=True)
        print(tag,'overflow',pg.evaluate('document.documentElement.scrollWidth>innerWidth'))
        pg.click('[data-atfinish]');pg.wait_for_timeout(200);print(tag,'lista',pg.locator('[data-atopen]').inner_text().replace('\n',' ')[:120])
    # maquinado: JPMH y grupos reales
    pg=b.new_page(viewport={'width':1366,'height':1000});pg.route('**/fonts.googleapis.com/**',lambda r:r.abort());pg.on('pageerror',lambda e:errs.append('maq '+str(e)))
    pg.goto(IDX+'#at');pg.click('[data-atnew]');pg.fill('input[name=nombre]','maquinado');pg.click('[data-attipo=MAQUINADO]');pg.locator('[data-atneed]').last.click()
    pg.click('[data-atexample]');pg.wait_for_timeout(100);pg.click('.atmonths [data-atm="0"]');print('maq abril',kpis(pg));print('maq sin selector MH',pg.locator('[data-atarea]').count())
    print('maq abajo:',pg.locator('.pcbottom').inner_text().replace('\n',' '));pg.locator('[data-atmall]').first.click();pg.click('.atmonths [data-atm="4"]');print('maq agosto (2 grupos reales)',kpis(pg))
    pg.locator('[data-atv=res]:not([disabled])').last.click();pg.wait_for_timeout(200);pg.screenshot(path='/tmp/at_res_maq.png',full_page=True)
    print('maq títulos',[x.inner_text() for x in pg.locator('.glass > b').all()])
    b.close()
print('ERRORS',errs)
