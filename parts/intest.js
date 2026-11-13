// Pruebas del tablero de Inicio: lee las funciones puras directo de index.html (bloque <in-pure>).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <in-pure>[^\n]*\n([\s\S]*?)\/\/ <\/in-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <in-pure> en index.html');process.exit(1);}
const {inDate,inWhoOf,inFilter,inGroups,inWho,inActivity}=new Function(m[1]+';return {inDate,inWhoOf,inFilter,inGroups,inWho,inActivity};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};

// 1. Fecha del estudio: la primera AAAA-MM-DD de «fecha»; si no hay, la de «periodo» (Speed Trial)
ok(inDate({fecha:'2026-10-02'})==='2026-10-02','fecha ISO');
ok(inDate({fecha:'13 nov 2026, 4:29 p.m.',periodo:'2026-11-10 turno 1'})==='2026-11-10','Speed Trial: fecha del periodo');
ok(inDate({})==='','sin fecha');
// 2. Quién lo hizo: analista, observador o elaboró; en mayúsculas y sin espacios sobrantes
ok(inWhoOf({observador:' m. lópez '})==='M. LÓPEZ','observador normalizado');
ok(inWhoOf({analista:'J. PÉREZ',observador:'X'})==='J. PÉREZ','analista primero');
ok(inWhoOf({elaboro:'a. ramírez'})==='A. RAMÍREZ','hoja estándar: elaboró');
ok(inWhoOf({})==='','sin nombre');
// 3. Filtro por planta y línea; «Sin asignar» = sin planta o planta que ya no existe
const it=[{kind:'ws',d:{id:1,ubic:{planta:'P1',linea:'L1'}}},{kind:'st',d:{id:2,ubic:{}}},{kind:'sm',d:{id:3,ubic:{planta:'P9'}}},{kind:'mm',d:{id:4,ubic:{planta:'P1',linea:'L2'}}}];
ok(inFilter(it,'P1','',['P1']).length===2,'planta P1: 2 estudios');
ok(inFilter(it,'','',['P1']).map(x=>x.d.id).join()==='2,3','sin asignar: sin ubicación y planta borrada');
ok(inFilter(it,'P1','L1',['P1']).map(x=>x.d.id).join()==='1','filtro de línea L1');
// 4. Agrupado por tipo en el orden fijo; lo más reciente primero; sin fecha al final; tipos vacíos fuera
const g=inGroups([{kind:'st',d:{id:1,fecha:'x',periodo:'2026-05-01'}},{kind:'ws',d:{id:2}},{kind:'ws',d:{id:3,fecha:'2026-04-01'}},{kind:'ws',d:{id:4,fecha:'2026-09-01'}}],['ws','sm','st']);
ok(g.map(x=>x.kind).join()==='ws,st','orden fijo y sin tipos vacíos');
ok(g[0].items.map(x=>x.d.id).join()==='4,3,2','más reciente primero, sin fecha al final');
ok(g[0].n===3&&g[1].n===1,'contador por tipo');
// 5. Quién lo hizo: por analista, cuántos, de qué tipos y su fecha más reciente
const w=inWho([{kind:'ws',d:{analista:'J. PÉREZ',fecha:'2026-05-01'}},{kind:'st',d:{analista:'j. pérez',periodo:'2026-08-02 turno 1'}},{kind:'ds',d:{observador:'M. LÓPEZ',fecha:'2026-09-09'}},{kind:'pc',d:{fecha:'2026-10-01'}}]);
ok(w.length===2,'dos analistas (el sin nombre no cuenta)');
ok(w[0].name==='J. PÉREZ'&&w[0].n===2&&w[0].kinds.ws===1&&w[0].kinds.st===1&&w[0].last==='2026-08-02','J. PÉREZ: 2 estudios, ws y st, último 2026-08-02');
ok(w[1].name==='M. LÓPEZ'&&w[1].n===1,'M. LÓPEZ: 1');
const w2=inWho([{kind:'ws',d:{analista:'B'}},{kind:'ws',d:{analista:'A'}}]);
ok(w2.map(x=>x.name).join()==='A,B','empate: por nombre');

// 6. Actividad: estudios por mes, los 12 meses que terminan en el mes de «hoy»; fuera de la ventana y sin fecha no cuentan
const A=inActivity([{d:{fecha:'2026-11-02'}},{d:{fecha:'2026-11-20'}},{d:{periodo:'2026-04-10 turno 1'}},{d:{fecha:'2025-11-30'}},{d:{fecha:'2025-12-01'}},{d:{}}],'2026-11-13');
ok(A.length===12&&A[0].ym==='2025-12'&&A[11].ym==='2026-11','12 meses: diciembre 2025 a noviembre 2026');
ok(A[11].n===2&&A[4].n===1&&A[0].n===1,'cuenta por mes (nov 2, abr 1, dic 1)');
ok(A.reduce((a,x)=>a+x.n,0)===4,'noviembre 2025 queda fuera y el sin fecha no cuenta');
console.log((fails?'FALLAS: '+fails:'OK')+' · '+n+' pruebas de Inicio');process.exit(fails?1:0);
