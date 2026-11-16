# Listas de estudios en teléfono: nada se sale de la pantalla (PDF y eliminar van dentro de la tarjeta).
# Carga el historial de ejemplo (semilla) para tener estudios en las 12 listas y revisa 360 y 390 px de ancho.
import pathlib as _pl
from playwright.sync_api import sync_playwright
IDX = 'file://' + str(_pl.Path(__file__).resolve().parents[2] / 'index.html') + '#'
RUTAS = 'ws ds we st mm sm pc at df tk hs sp'.split()
fallas = []
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(360, 740), (390, 844)]:
        pg = b.new_page(viewport={'width': w, 'height': h}, has_touch=True)
        pg.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>false})")  # para que cargue la semilla
        pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        pg.goto(IDX + 'inicio'); pg.wait_for_function('window.TaktStore&&TaktStore.ready()'); pg.wait_for_timeout(800)
        for r in RUTAS:
            pg.goto(IDX + r); pg.wait_for_timeout(300)
            sw, n, fuera, botones = pg.evaluate("""(()=>{const W=innerWidth;const rows=[...document.querySelectorAll('#view .studyrow')];
              const fuera=rows.flatMap(x=>[...x.querySelectorAll('*')]).filter(e=>e.getBoundingClientRect().right>W+1).length;
              const botones=rows.every(x=>{const c=x.getBoundingClientRect();return [...x.querySelectorAll('.rpdf,.sdel')].every(bt=>{const r=bt.getBoundingClientRect();return r.left>=c.left&&r.right<=c.right&&r.bottom<=c.bottom;});});
              return [document.documentElement.scrollWidth,rows.length,fuera,botones];})()""")
            if n == 0: fallas.append(f'{w}px {r}: lista sin estudios (¿no cargó la semilla?)')
            if sw > w: fallas.append(f'{w}px {r}: la página mide {sw}px de ancho')
            if fuera: fallas.append(f'{w}px {r}: {fuera} elementos se salen de la pantalla')
            if not botones: fallas.append(f'{w}px {r}: PDF o eliminar quedan fuera de la tarjeta')
        pg.close()
    b.close()
for f in fallas: print('FALLA', f)
if not fallas: print('OK: listas en teléfono (12 formatos, 360 y 390 px)')
