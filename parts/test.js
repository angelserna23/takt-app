const fs=require('fs');eval(fs.readFileSync(__dirname+'/calc.js','utf8'));
const assert=require('assert');
// Caso 1: datos del Excel de Angel (Operador 1)
const names=['INSPECCION VISUAL','MARCAR','INSPECCION CON LIMA','INSPECCION CON LAMPARA','LIMPIEZA','PLATICA','ESPERA','SALE DE LA OPERACION','SOPLETEO','DEJAR PIEZA','TOMAR PIEZA','TOMAR AGUA','QUITAR HOJAS DE KOROKORO','OTROS'];
const inn=['LIMPIEZA','PLATICA','ESPERA'];
const acts=names.map((n,i)=>({id:i+1,name:n,nec:!inn.includes(n)}));
const vals=[1,2,3,4,2,1,2,4,5,2,11,2,4,0];
const c={};vals.forEach((v,i)=>c[i+1]=v);
let r=calcWS([{id:1,name:'OPERADOR 1'}],acts,{1:c});
assert.strictEqual(r.rows[0].sum,43);
assert.ok(Math.abs(r.rows[0].innec-5/43)<1e-12);          // 11.6% -> 12% en el Excel
assert.ok(Math.abs(r.rows[0].nec-38/43)<1e-12);           // 88.4% -> 88%
assert.ok(Math.abs(r.rows[0].pct[11]-11/43)<1e-12);       // TOMAR PIEZA 26%
assert.strictEqual(Math.round(r.rows[0].pct[9]*100),12);  // SOPLETEO 12%
const s=Object.values(r.rows[0].pct).reduce((a,b)=>a+b,0);assert.ok(Math.abs(s-1)<1e-12); // TOTAL 100%
// Caso 2: operador sin observaciones no truena (IFERROR del Excel)
r=calcWS([{id:1,name:'A'},{id:2,name:'B'}],acts,{1:c});
assert.strictEqual(r.rows[1].sum,0);assert.strictEqual(r.rows[1].innec,0);
// Caso 3: total de línea = suma de conteos (no promedio de %)
const a2=[{id:1,nec:true},{id:2,nec:false}];
r=calcWS([{id:1},{id:2}],a2,{1:{1:9,2:1},2:{1:1,2:1}});
assert.ok(Math.abs(r.rows[0].innec-0.1)<1e-12);
assert.ok(Math.abs(r.rows[1].innec-0.5)<1e-12);
assert.ok(Math.abs(r.total.innec-2/12)<1e-12);   // 16.7%, no 30% (promedio)
console.log('OK: 3 casos, todos pasan');
// Caso 4: operadores con actividades distintas; la línea las une por nombre
const o1={id:1,name:'A',acts:[{id:1,name:'Tomar pieza',nec:true},{id:2,name:'Espera',nec:false}],counts:{1:6,2:2}};
const o2={id:2,name:'B',acts:[{id:1,name:'Soldar',nec:true},{id:2,name:'espera ',nec:false}],counts:{1:3,2:1}};
assert.ok(Math.abs(calcOp(o1).innec-0.25)<1e-12);
const L=calcLine([o1,o2]);
assert.strictEqual(L.acts.length,3);           // Tomar pieza, Espera, Soldar
assert.strictEqual(L.total.sum,12);
assert.ok(Math.abs(L.total.innec-3/12)<1e-12); // 25%
console.log('OK: caso 4 (actividades distintas por operador)');
// Caso 5: precisión (95%, ±5%) con p = 5/21 (24%)
let P=precisionWS(5/21,21,'95',0.05);
assert.ok(Math.abs(P.e-0.18216)<1e-4);   // ±18.2 puntos
assert.strictEqual(P.req,279); assert.strictEqual(P.falta,258); assert.strictEqual(P.ok,false);
// Caso 6: p = 0.5 a 95% ±5% -> 385 (valor de libro)
assert.strictEqual(precisionWS(0.5,400,'95',0.05).req,385);
assert.strictEqual(precisionWS(0.5,400,'95',0.05).ok,true);
// Caso 7: p = 0 usa 0.5 (no reporta margen 0); 90% de confianza
P=precisionWS(0,10,'90',0.05);assert.ok(P.e>0.25);assert.strictEqual(P.req,271);
console.log('OK: casos 5-7 (precisión del muestreo)');
