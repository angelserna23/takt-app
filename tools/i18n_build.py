#!/usr/bin/env python3
"""Arma el diccionario español → inglés dentro de index.html.

Fuente de verdad: los archivos i18n/*.txt (uno por módulo), una entrada por renglón:
    Texto en español ⇒ English text
Los renglones con huecos {n} (número) o {x} (texto) son plantillas; en la salida se pueden
reordenar con {1}, {2}… Comentarios con #. El script escribe los bloques <i18n-dic> e <i18n-tpl>.

Uso:  python3 tools/i18n_build.py          (escribe index.html)
      python3 tools/i18n_build.py --check  (falla si index.html no está al día o hay duplicados)
"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).resolve().parents[1]
IDX = R / 'index.html'

def leer():
    dic, tpl, err, vistos = {}, [], [], {}
    for f in sorted((R / 'i18n').glob('*.txt')):
        for k, ln in enumerate(f.read_text(encoding='utf8').splitlines(), 1):
            s = ln.strip()
            if not s or s.startswith('#'):
                continue
            if '⇒' not in s:
                err.append(f'{f.name}:{k}: falta «⇒»'); continue
            es, en = (x.strip() for x in s.split('⇒', 1))
            es = re.sub(r'\s+', ' ', es)
            if not es or not en:
                err.append(f'{f.name}:{k}: lado vacío'); continue
            if es in vistos and vistos[es][1] != en:
                err.append(f'{f.name}:{k}: «{es}» ya está en {vistos[es][0]} con otra traducción')
            vistos[es] = (f'{f.name}:{k}', en)
            if re.search(r'\{[nx]\}', es):
                if es not in [t[0] for t in tpl]: tpl.append([es, en])
            else:
                dic[es] = en
    return dic, tpl, err

def bloques(dic, tpl):
    d = json.dumps(dic, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    t = json.dumps(tpl, ensure_ascii=False, separators=(',', ':'))
    return d, t

def escribir(html, d, t):
    html = re.sub(r'/\*<i18n-dic>\*/.*?/\*</i18n-dic>\*/', lambda m: '/*<i18n-dic>*/' + d + '/*</i18n-dic>*/', html, count=1, flags=re.S)
    html = re.sub(r'/\*<i18n-tpl>\*/.*?/\*</i18n-tpl>\*/', lambda m: '/*<i18n-tpl>*/' + t + '/*</i18n-tpl>*/', html, count=1, flags=re.S)
    return html

if __name__ == '__main__':
    dic, tpl, err = leer()
    for e in err: print('FALLA', e)
    html = IDX.read_text(encoding='utf8')
    nuevo = escribir(html, *bloques(dic, tpl))
    if '--check' in sys.argv:
        if nuevo != html:
            print('FALLA index.html no tiene el diccionario al día: corre python3 tools/i18n_build.py'); sys.exit(1)
        sys.exit(1 if err else 0)
    if err: sys.exit(1)
    IDX.write_text(nuevo, encoding='utf8')
    print(f'Diccionario: {len(dic)} textos + {len(tpl)} plantillas')
