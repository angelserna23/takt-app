// Prueba de los guiones de «Aprende»: lee TUTS directo de index.html (no hay copia que se desfase)
// y revisa que cada tutorial listo esté bien formado. Que cada selector exista en pantalla lo prueba tests/smoke/smoke_tut.py.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/const TUT_GROUPS=(\[[\s\S]*?\]);\nconst TUTS=(\[[\s\S]*?\n\]);/);
if(!m){console.error('FALLA: no se encontró TUTS en index.html');process.exit(1);}
const GROUPS=eval(m[1]),TUTS=eval(m[2]);
let fails=0;const ok=(c,msg)=>{if(!c){fails++;console.error('FALLA:',msg);}};
const ACTS=['toca','escribe','elige','serie','señala'];
const ids=TUTS.map(t=>t.id);ok(new Set(ids).size===ids.length,'ids repetidos');
// Una tarjeta por herramienta: 6 estudios + Personal + Actual Time + Diagramas de flujo
['ws','ds','we','st','mm','sm','pc','at','df'].forEach(id=>ok(ids.includes(id),'falta la tarjeta '+id));
TUTS.forEach(t=>{ok(GROUPS.some(g=>g[0]===t.grupo),t.id+': grupo inválido');ok(t.nombre&&t.pregunta,t.id+': sin nombre o pregunta');
  if(!t.pasos)return;
  ok(t.min>0&&t.cuando&&t.noPara&&Array.isArray(t.veras)&&t.veras.length,t.id+': ficha incompleta');
  ok(t.pasos.length>=5,t.id+': muy pocos pasos');
  t.pasos.forEach((p,i)=>{const w=t.id+' paso '+(i+1);const a=ACTS.filter(k=>k in p);
    ok(a.length===1,w+': debe tener exactamente una acción ('+a.join(',')+')');
    ok(typeof p.di==='string'&&p.di.length>=10,w+': falta el texto del globo');
    if(p.escribe)ok(typeof p.valor==='string'&&p.valor===p.valor.toLocaleUpperCase('es-MX'),w+': valor en MAYÚSCULAS');
    if(p.elige)ok(p.valor!=null,w+': falta valor');
    if(p.serie)ok(p.serie.includes('{v}')&&Array.isArray(p.v)&&p.v.length&&p.base&&p.nTu>0,w+': serie incompleta');
    if(p.toca||p.serie)ok(p.tu,w+': falta el texto del modo guiado');
    if(p.ir)ok(typeof p.ir==='string',w+': ir inválido');});
  ok(t.pasos[0].ir,t.id+': el primer paso debe llevar a la pantalla (ir)');});
// Work Sampling: la serie del ejemplo da 4 innecesarias de 20 → 20 % (lo que verifica la prueba de pantalla)
const ws=TUTS.find(t=>t.id==='ws');const s=ws.pasos.find(p=>p.serie);
ok(s.v.length===20&&s.v.filter(v=>[5,6,7].includes(v)).length===4,'ws: la serie debe dar 4 innecesarias de 20');
if(fails){console.error(fails+' fallas');process.exit(1);}
console.log('OK: Aprende, '+TUTS.filter(t=>t.pasos).length+' tutorial listo ('+ws.pasos.length+' pasos) · '+TUTS.length+' tarjetas');
