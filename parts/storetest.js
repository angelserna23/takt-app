// Pruebas del almacén (guardado): lee las funciones puras directo de index.html (bloque <store-pure>),
// así no hay copia que se desfase.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <store-pure>[^\n]*\n([\s\S]*?)\/\/ <\/store-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <store-pure> en index.html');process.exit(1);}
const {storeUUID,storeEnvelope,storeMigrate,storeMaxId,storeStateOf,vistaClean,storeAviso,STORE_CASI}=new Function(m[1]+';return {storeUUID,storeEnvelope,storeMigrate,storeMaxId,storeStateOf,vistaClean,storeAviso,STORE_CASI};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};
// 1. UUID: únicos
const U=new Set(Array.from({length:2000},storeUUID));ok(U.size===2000,'UUID repetidos');
// 2. Sobre: copia profunda (cambiar el estudio después no altera lo guardado) y conserva createdAt
const d={_uuid:'a1',id:1001,titulo:'X',ops:[{id:1002,counts:{3:4}}]};
const e1=storeEnvelope('ws',d,1,'2026-11-12T10:00:00Z',null);d.ops[0].counts[3]=99;
ok(e1.data.ops[0].counts[3]===4,'el sobre debe ser una copia profunda');
ok(e1.uuid==='a1'&&e1.kind==='ws'&&e1.schema===1&&e1.createdAt===e1.savedAt,'campos del sobre');
const e2=storeEnvelope('ws',d,1,'2026-11-13T10:00:00Z',e1);ok(e2.createdAt==='2026-11-12T10:00:00Z'&&e2.savedAt==='2026-11-13T10:00:00Z','createdAt se conserva al volver a guardar');
// 3. Migraciones: v0 → v2 en orden, sin tocar el original
const migs={0:x=>Object.assign(x,{a:1}),1:x=>Object.assign(x,{b:x.a+1})};
const old={uuid:'z',kind:'st',schema:0,data:{t:5}};const mg=storeMigrate(old,2,migs);
ok(mg.schema===2&&mg.data.a===1&&mg.data.b===2&&mg.data.t===5,'migración en cadena 0→1→2');
ok(old.data.a===undefined&&old.schema===0,'migrar no altera el original');
ok(storeMigrate({uuid:'y',kind:'st',schema:2,data:{q:1}},2,migs).data.q===1,'misma versión: sin cambios');
let thr=null;try{storeMigrate({uuid:'x',kind:'st',schema:0,data:{}},2,{0:x=>x});}catch(err){thr=err.message;}
ok(thr&&/1 a la 2/.test(thr),'si falta una migración debe avisar, nunca adivinar');
thr=null;try{storeMigrate({uuid:'x',kind:'st',schema:3,data:{}},2,migs);}catch(err){thr=err.message;}
ok(thr&&/más nueva/.test(thr),'estudio de una versión más nueva: avisar');
// 4. Contador de IDs: el más alto en campos id y llaves numéricas (asignación del Delay Study)
ok(storeMaxId({ops:[{id:1005}],assign:{'1020':1005},acts:[{id:1010,cap:1005}]})===1020,'máximo con llaves numéricas');
ok(storeMaxId({secs:999999,savedAt:'2026',t:5000})===0,'no cuenta números que no son identificadores');
const cyc={id:7};cyc.self=cyc;ok(storeMaxId(cyc)===7,'resiste referencias circulares');
// 5. Estado frente a lo guardado
const saved=new Map([['a1',JSON.stringify(d)]]);
ok(storeStateOf(d,saved)==='ok','ok');d.titulo='Y';ok(storeStateOf(d,saved)==='cambios','cambios');ok(storeStateOf({id:1},saved)==='nuevo','nuevo');
// 6. Ajustes de vista (Fase 3): lo guardado se limpia contra el catálogo de hoy
const cat={plantas:[{id:'p1',areas:[{id:'a1',lineas:[{id:'l1'}]}]},{id:'p2',areas:[]}]};
const V0=vistaClean(null,cat);
ok(V0.ecfy===null&&V0.ecmode==='con'&&V0.ubf.planta===''&&V0.inplanta===null&&V0.inlinea==='','sin nada guardado: valores de siempre');
const V1=vistaClean({ecfy:25,ecmode:'sin',ubf:{planta:'p1',area:'a1',linea:'l1'},inplanta:'p2',inlinea:'l9'},cat);
ok(V1.ecfy===25&&V1.ecmode==='sin','FY y modo elegidos se respetan');
ok(V1.ubf.planta==='p1'&&V1.ubf.area==='a1'&&V1.ubf.linea==='l1','filtro completo válido se respeta');
ok(V1.inplanta==='p2'&&V1.inlinea==='l9','planta y línea de Inicio pasan (Inicio las valida al dibujar)');
const V2=vistaClean({ubf:{planta:'p1',area:'aX',linea:'l1'}},cat);
ok(V2.ubf.planta==='p1'&&V2.ubf.area===''&&V2.ubf.linea==='','área borrada: el filtro se queda en la planta');
const V3=vistaClean({ubf:{planta:'pX',area:'a1',linea:'l1'}},cat);
ok(V3.ubf.planta===''&&V3.ubf.area===''&&V3.ubf.linea==='','planta borrada: sin filtro (nunca esconder estudios por algo que ya no existe)');
const V4=vistaClean({ecfy:'25',ecmode:'otro',ubf:'x',inplanta:5},cat);
ok(V4.ecfy===null&&V4.ecmode==='con'&&V4.ubf.planta===''&&V4.inplanta===null,'datos con tipo equivocado: valores de siempre');
ok(vistaClean({ecfy:2026},cat).ecfy===null&&vistaClean({ecfy:-1},cat).ecfy===null&&vistaClean({ecfy:26.5},cat).ecfy===null,'FY fuera de rango (no es de dos dígitos) o con decimales: se ignora');
ok(vistaClean({ecfy:0},cat).ecfy===0,'FY00 es válido');
ok(vistaClean({ubf:{planta:'p1'}},{}).ubf.planta==='','sin catálogo: sin filtro');
// 7. Aviso de almacenamiento: una franja a la vez, la más grave primero
const A=x=>{const a=storeAviso(Object.assign({ok:true,lleno:false,leer:false,bad:0,usage:0,quota:0,cerrado:[]},x));return a&&a.key+'/'+a.lvl+(a.close?'/x':'');};
ok(A({})===null,'todo bien: sin franja');
ok(A({ok:false,lleno:true,bad:3})==='nodisp/rojo','no disponible le gana a todo y no se cierra');
ok(A({lleno:true,usage:99,quota:100})==='lleno/rojo','lleno le gana a casi lleno');
ok(STORE_CASI===0.85,'umbral de casi lleno: 85 %');
ok(A({usage:85,quota:100})==='casi/ambar/x','85 % usado: casi lleno (se puede cerrar)');
ok(A({usage:84.9,quota:100})===null,'84.9 %: sin franja');
ok(A({usage:50,quota:0})===null,'sin dato de cupo: no se inventa el aviso');
ok(A({bad:2})==='bad/ambar/x','estudios que no abrieron: ámbar');
ok(A({leer:true,bad:2})==='leer/ambar/x','no se pudo leer nada: le gana a «no abrieron N»');
ok(A({bad:2,cerrado:['bad']})===null,'aviso cerrado: no vuelve en esta sesión');
ok(A({usage:90,quota:100,bad:1,cerrado:['casi']})==='bad/ambar/x','al cerrar uno, aparece el siguiente');
ok(A({lleno:true,cerrado:['lleno']})==='lleno/rojo','los rojos no se pueden cerrar');
if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: almacén, '+n+' casos pasan (UUID, sobre, migraciones, contador de IDs, estado, ajustes de vista, avisos)');
