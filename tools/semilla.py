# Genera el historial ficticio de Takt (la «semilla») y lo escribe en index.html entre /*<semilla>*/ y /*</semilla>*/.
# Solo mientras la app está en pruebas (Angel, 2026-11-13): la app se ve «llena hasta hoy». Al lanzar se apaga (SEED_ON=false)
# y se borra el bloque. Todo es ficticio.
# Cómo: corre cada tutorial de Aprende en modo demo, toma el estudio que arma (TaktRep.data) y hace copias con
# otros títulos, analistas, ubicaciones, fechas y tiempos (±15 %). Uso: python3 tools/semilla.py
import json, random, copy, pathlib, re, datetime
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1];IDX=ROOT/'index.html'
random.seed(26)
KINDS=['ws','ds','we','st','mm','sm','tk','hs','pc','at','sp','df']
SCHEMA={'ws':2,'ds':2,'we':2,'st':2,'mm':2,'sm':2,'pc':2,'at':2,'df':2,'tk':1,'hs':1,'sp':1}

# ---------- catálogo ficticio ----------
def est(pre,names):return [{'id':f'{pre}-e{i}','nombre':n} for i,n in enumerate(names)]
CAT={'plantas':[
  {'id':'sem-pn','nombre':'PLANTA NORTE','areas':[
    {'id':'sem-pn-ens','nombre':'ENSAMBLE','lineas':[
      {'id':'sem-pn-l1','nombre':'LÍNEA 1','estaciones':est('sem-pn-l1',['EST 10','EST 20','EST 30','EST 40'])},
      {'id':'sem-pn-l2','nombre':'LÍNEA 2','estaciones':est('sem-pn-l2',['EST 10','EST 20','EST 30'])}]},
    {'id':'sem-pn-maq','nombre':'MAQUINADO','lineas':[
      {'id':'sem-pn-m1','nombre':'LÍNEA M1','estaciones':est('sem-pn-m1',['EST 10','EST 20'])},
      {'id':'sem-pn-m2','nombre':'LÍNEA M2','estaciones':est('sem-pn-m2',['EST 10'])}]},
    {'id':'sem-pn-alm','nombre':'ALMACÉN','lineas':[
      {'id':'sem-pn-sur','nombre':'SURTIDO','estaciones':est('sem-pn-sur',['RECIBO','EMBARQUE'])}]}]},
  {'id':'sem-ps','nombre':'PLANTA SUR','areas':[
    {'id':'sem-ps-ens','nombre':'ENSAMBLE','lineas':[
      {'id':'sem-ps-s1','nombre':'LÍNEA S1','estaciones':est('sem-ps-s1',['EST 10','EST 20'])}]}]}]}
def ub(pl,ar=None,ln=None,es=None):
    u={'planta':pl}
    if ar:u['area']=ar
    if ln:u['linea']=ln
    if es is not None:u['estacion']=f'{ln}-e{es}'
    return u
N_ENS=[('sem-pn-ens','sem-pn-l1',4),('sem-pn-ens','sem-pn-l2',3)];N_MAQ=[('sem-pn-maq','sem-pn-m1',2),('sem-pn-maq','sem-pn-m2',1)]
def ub_norte(deep=4,pool=None):
    ar,ln,ne=random.choice(pool or N_ENS+N_MAQ)
    return ub('sem-pn',ar,ln if deep>=3 else None,random.randrange(ne) if deep>=4 else None)
SUR=lambda deep=4:ub('sem-ps','sem-ps-ens','sem-ps-s1' if deep>=3 else None,random.randrange(2) if deep>=4 else None)

ANALISTAS=['J. PÉREZ','M. LÓPEZ','A. RAMÍREZ','L. GARCÍA','R. TORRES']
WHO={'ws':'analista','ds':'observador','we':'observador','st':'analista','mm':'analista','sm':'analista','tk':'analista','df':'analista','sp':'analista','hs':'elaboro'}
INI=datetime.date(2026,4,6);HOY=datetime.date(2026,11,13)
def fechas(n):
    span=(HOY-INI).days;ds=sorted(INI+datetime.timedelta(days=random.randint(0,span)) for _ in range(n));ds[-1]=min(HOY,ds[-1]);return [d.isoformat() for d in ds]
MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
def fecha_txt(iso):d=datetime.date.fromisoformat(iso);return f'{d.day} {MES[d.month-1]} {d.year}, {random.choice([7,9,11])}:{random.choice(["05","20","40"])} a.m.'
f=lambda a=0.85,b=1.15:random.uniform(a,b)
def sc(v,k,dec=2):
    try:x=float(str(v).replace(',',''))
    except:return v
    return f'{x*k:.{dec}f}'

# ---------- variaciones por formato ----------
class Ids:
    def __init__(s):s.n=5000
    def __call__(s):s.n+=1;return s.n
def v_ws(b,i):
    d=copy.deepcopy(b);base=b['ops'][0];nid=Ids();d['ops']=[]
    for k in range(random.randint(2,4)):
        o=copy.deepcopy(base);o['id']=nid();o['name']=f'ENSAMBLADOR {k+1}'
        cnt={a:max(0,round(c*f(0.5,1.6))) for a,c in base['counts'].items()}
        for a in random.sample([x['id'] for x in base['acts']],3):cnt[str(a)]=cnt.get(str(a),0)+random.randint(0,3)
        o['counts']={a:c for a,c in cnt.items() if c>0};o['log']=[int(a) for a,c in o['counts'].items() for _ in range(c)]
        d['ops'].append(o)
    return d
def v_dsw(b,i,we):
    d=copy.deepcopy(b);nid=Ids();ops=[];acts=[];asg={}
    nops=random.randint(2,4) if we else 2
    for k in range(nops):
        oid=nid();ops.append({'id':oid,'name':f'OPERADOR {k+1}' if we else f'MATERIALISTA {k+1}','obj':''})
        # Work Element: cada operador hace su ciclo completo; Delay Study: las actividades se reparten entre los materialistas
        for a in (b['acts'] if we else b['acts'][k::nops]):
            x=copy.deepcopy(a);x['id']=nid();x['cap']=oid;k2=f()
            if 'times' in x and x['times']:x['times']=[sc(t,k2) for t in x['times']];vs=[float(t) for t in x['times']];x['secs']=sum(vs)/len(vs)*60
            elif 'secs' in x:x['secs']=float(x['secs'])*k2
            acts.append(x);asg[str(x['id'])]=oid
    d['ops']=ops;d['acts']=acts;d['assign']=asg;return d
def v_st(b,i):
    d=copy.deepcopy(b);k=f(0.92,1.08)
    for r in d['recs']:r['t']=sc(r['t'],k*f(0.95,1.05),3)
    random.shuffle(d['recs']);d['costo']=str(random.choice([180,250,320,410]));return d
def v_mm(b,i):
    d=copy.deepcopy(b)
    for s in d['sts']:s['tcs']=[sc(t,f(),3) if str(t).strip() else t for t in s.get('tcs',[])]
    return d
def v_sm(b,i):
    d=copy.deepcopy(b)
    for s in d['steps']:s['t']=sc(s['t'],f(),1)
    d['cpw']=str(random.choice([6,8,10,12]));return d
def v_tk(b,i):
    d=copy.deepcopy(b)
    for e in d['els']:e['t']=sc(e['t'],f(),2)
    d['demanda']=str(random.choice([700,750,800,850]));return d
def v_hs(b,i):
    d=copy.deepcopy(b)
    for p in d.get('pasos',[]):
        if 't' in p:p['t']=sc(p['t'],f(),2)
    return d
def v_df(b,i):
    d=copy.deepcopy(b)
    for n in d['nodes']:
        if str(n.get('tiempo','')).strip():n['tiempo']=sc(n['tiempo'],f(),0)
        if str(n.get('dist','')).strip():n['dist']=sc(n['dist'],f(),0)
    return d
def v_sp(b,i):
    d=copy.deepcopy(b);d['ciclos']=str(random.choice([40,50,60]));return d
def v_pc(b,i):
    d=copy.deepcopy(b);base=[m for m in b['months'] if m];nid=Ids();d['months']=[None]*12
    for m in range(7):
        rows=copy.deepcopy(base[m%len(base)]);k=f(0.9,1.1)
        for r in rows:r['id']=nid();r['vol']=f"{round(float(str(r['vol']).replace(',',''))*k):,}"
        d['months'][m]=rows
    return d
def v_at(b,i):
    d=copy.deepcopy(b);base=[m for m in b['months'] if m];nid=Ids();d['months']=[None]*12
    for m in range(7):
        mo=copy.deepcopy(base[m%len(base)]);kp=f(0.9,1.1)
        for p in mo['partes']:p['id']=nid();p['prod']=str(round(float(p['prod'])*kp))
        # Mes coherente (ficticio): horas trabajadas = requeridas ÷ eficiencia (82–93 %); afectaciones en proporción;
        # indirectos para que el GAP de personal quede en ±3; JPH y plantilla planeada cerca de lo real (la meta queda cerca del Actual Time)
        prod=sum(float(p['prod']) for p in mo['partes']);hl=float(mo['dias'])*float(mo['horasDia'])
        mo['jphCommit']=f"{prod/hl*random.uniform(1.0,1.08):.1f}";mo['jphRes']=f"{prod/hl*random.uniform(0.96,1.0):.1f}"
        gR=float(mo.get('gruposReal') or mo['gruposCommit']);hPer=hl/gR
        def ajusta(area,req):
            old=float(area['horasTrab']);new=req/random.uniform(0.82,0.93);k=new/old;area['horasTrab']=str(round(new))
            area['afect']={a:(str(round(float(v)*k)) if str(v).strip() else v) for a,v in (area.get('afect') or {}).items()}
            af=sum(float(v) for v in area['afect'].values() if str(v).strip());hcT=new/hPer
            ind=max(3,(new-af)/hPer-req/hPer-random.uniform(-2,3))
            area['sv']=str(max(1,round(ind*0.2)));area['lider']=str(max(1,round(ind*0.45)));area['otrosInd']=str(max(0,round(ind*0.35)))
            area['hcPlan']=str(round(hcT*random.uniform(1.0,1.05)));area['hcRes']=str(round(hcT*random.uniform(0.98,1.02)))
        ajusta(mo,sum(float(p['prod'])*float(p['st'])/60 for p in mo['partes']))
        if mo.get('mh') and str(mo['mh'].get('horasTrab','')).strip():ajusta(mo['mh'],sum(float(p['prod'])*float(mo['partes'][0]['lat'] or 0)/60 for p in mo['partes']))
        d['months'][m]=mo
    return d
VAR={'ws':v_ws,'ds':lambda b,i:v_dsw(b,i,False),'we':lambda b,i:v_dsw(b,i,True),'st':v_st,'mm':v_mm,'sm':v_sm,'tk':v_tk,'hs':v_hs,'df':v_df,'sp':v_sp,'pc':v_pc,'at':v_at}

# ---------- qué se genera: (formato, título, ubicación) ----------
def plan():
    P=[]
    for t in ['MUESTREO ENSAMBLE L1','MUESTREO MAQUINADO M1','MUESTREO INSPECCIÓN FINAL']:P.append(('ws',t,ub_norte(4)))
    P.append(('ws','MUESTREO LÍNEA S1',SUR(4)))
    for t in ['SURTIDO A LÍNEA 1','SURTIDO A MAQUINADO','EMBARQUE DE PRODUCTO']:P.append(('ds',t,ub('sem-pn','sem-pn-alm','sem-pn-sur',random.randrange(2))))
    for t in ['ENSAMBLE DE POLEA','SUBENSAMBLE DE TAPA','PRUEBA DE GIRO','ETIQUETADO Y EMPAQUE','CARGA DE TORNO','REBABEO','INSPECCIÓN DE CARCASA']:P.append(('we',t,ub_norte(4)))
    P.append(('we','ENSAMBLE DE SOPORTE',SUR(4)))
    P.append(('we','PRUEBA PILOTO SIN UBICACIÓN',{}))
    for k in range(4):P.append(('st',None,ub_norte(4)))
    P.append(('st',None,SUR(4)))
    for t in ['CELDA M1','CELDA M2','CELDA DE TAPAS']:P.append(('mm',t,ub_norte(3,N_MAQ)))
    for t in [('PRENSA 200 T','MOD-A','MOD-B'),('TORNO CNC 3','MOD-B','MOD-C'),('PRENSA 400 T','MOD-C','MOD-A')]:P.append(('sm',t,ub_norte(4)))
    P.append(('sm',('INYECTORA 1','MOD-S','MOD-T'),SUR(4)))
    for t in ['BALANCEO LÍNEA 1','BALANCEO LÍNEA 2','BALANCEO M1']:P.append(('tk',t,None))
    for t in ['ENSAMBLE DE POLEA','PRENSADO DE BALERO','EMPAQUE']:P.append(('hs',t,ub_norte(4,N_ENS)))
    P.append(('hs','ENSAMBLE DE SOPORTE',SUR(4)))
    for t in ['RECEPCIÓN DE MATERIA PRIMA','CAMBIO DE TURNO','RETRABAJO DE PIEZA']:P.append(('df',t,ub('sem-pn','sem-pn-alm','sem-pn-sur') if 'RECEP' in t else ub_norte(3)))
    P.append(('df','FLUJO DE PRUEBA SIN UBICACIÓN',{}))
    for t in ['RECORRIDO DE SURTIDO','RECORRIDO DE MONTACARGAS','RECORRIDO DEL INSPECTOR']:P.append(('sp',t,ub_norte(3)))
    P.append(('pc',('MAQUINADO PLANTA NORTE','MAQUINADO'),ub('sem-pn','sem-pn-maq')))
    P.append(('pc',('ENSAMBLE PLANTA NORTE','ENSAMBLE'),ub('sem-pn','sem-pn-ens')))
    P.append(('at',('ENSAMBLE PLANTA NORTE','ENSAMBLE'),ub('sem-pn','sem-pn-ens')))
    P.append(('at',('MAQUINADO PLANTA NORTE','MAQUINADO'),ub('sem-pn','sem-pn-maq')))
    P.append(('at',('ENSAMBLE PLANTA SUR','ENSAMBLE'),ub('sem-ps','sem-ps-ens')))
    return P

def titulo(k,d,t,u):
    if k in('ws','ds','we','tk','df','sp'):d['titulo']=t
    elif k=='mm':d['linea']=t
    elif k=='sm':d['linea'],d['de'],d['a']=t
    elif k=='hs':d['operacion']=t
    elif k in('pc','at'):d['nombre'],d['tipo']=t;d['tipoOtro']=d.get('tipoOtro','')
    elif k=='st':
        ln={'sem-pn-l1':'LÍNEA 1','sem-pn-l2':'LÍNEA 2','sem-pn-m1':'LÍNEA M1','sem-pn-m2':'LÍNEA M2','sem-ps-s1':'LÍNEA S1'}.get(u.get('linea'),'')
        d['proceso']=f'ENSAMBLE {ln}'.strip();d['modelo']=random.choice(['MOD-A','MOD-B','MOD-C'])
    if k=='at':d['mh']=t[1]=='ENSAMBLE'

def main():
    base={}
    with sync_playwright() as p:
        b=p.chromium.launch();pg=b.new_page(viewport={'width':1366,'height':900})
        for k in KINDS:
            pg.goto(IDX.as_uri()+'#aprende');pg.wait_for_function('window.TaktStore&&TaktStore.ready()')
            pg.evaluate(f"TaktTut.start('{k}','demo',10)");pg.wait_for_function("document.body.dataset.tut==='fin'",timeout=180000)
            base[k]=pg.evaluate(f"TaktRep.data('{k}')");assert base[k],k;print('tutorial',k,'ok')
        b.close()
    P=plan();by={}
    for k,_,_ in P:by[k]=by.get(k,0)+1
    F={k:fechas(n) for k,n in by.items()};used={k:0 for k in by}
    est_=[];sid=900000
    for n,(k,t,u) in enumerate(P):
        d=VAR[k](base[k],n);sid+=1;d['id']=sid;fe=F[k][used[k]];used[k]+=1
        if k=='tk':   # el balanceo es de la línea completa
            ln=random.choice([('sem-pn-ens','sem-pn-l1'),('sem-pn-ens','sem-pn-l2'),('sem-pn-maq','sem-pn-m1')]);u=ub('sem-pn',ln[0],ln[1])
        d['ubic']=u;titulo(k,d,t,u)
        if k in WHO:d[WHO[k]]=random.choice(ANALISTAS)
        if k=='st':d['periodo']=f'{fe} turno {random.choice([1,2])}';d['fecha']=fecha_txt(fe)
        elif k!='at':d['fecha']=fe
        if k=='hs':d['reviso']=random.choice(ANALISTAS);d['aprobo']='ING. DE MANUFACTURA'
        d['estado']='Cerrado' if k not in('pc','at') else d.get('estado','Cerrado')
        if k in('ws',):
            for o in d['ops']:o['status']='listo'
        est_.append([k,f'semilla-{k}-{used[k]}',fe+'T12:00:00.000Z',SCHEMA[k],d])
    out=json.dumps({'cat':CAT,'est':est_},ensure_ascii=False,separators=(',',':'))
    s=IDX.read_text(encoding='utf8')
    s2,nsub=re.subn(r'/\*<semilla>\*/.*?/\*</semilla>\*/',lambda m:'/*<semilla>*/'+out+'/*</semilla>*/',s,flags=re.S)
    assert nsub==1;IDX.write_text(s2,encoding='utf8')
    print(f'{len(est_)} estudios · {len(out)/1024:.0f} KB',{k:by[k] for k in KINDS})
if __name__=='__main__':main()
