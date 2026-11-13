// Pruebas del almacén (guardado): lee las funciones puras directo de index.html (bloque <store-pure>),
// así no hay copia que se desfase.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <store-pure>[^\n]*\n([\s\S]*?)\/\/ <\/store-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <store-pure> en index.html');process.exit(1);}
const {storeUUID,storeEnvelope,storeMigrate,storeMaxId,storeStateOf}=new Function(m[1]+';return {storeUUID,storeEnvelope,storeMigrate,storeMaxId,storeStateOf};')();
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
if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: almacén, '+n+' casos pasan (UUID, sobre, migraciones, contador de IDs, estado)');
