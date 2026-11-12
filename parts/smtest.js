const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));eval(fs.readFileSync(__dirname+'/smcalc.js','utf8'));
const assert=require('assert');const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
// Ejemplo ficticio: cambio de dado en una prensa, 11 pasos, 44 min de paro
const S=[['BUSCAR HERRAMIENTA','Búsqueda y traslado',4.5],['TRASLADO DE DADO NUEVO','Búsqueda y traslado',6],['AFLOJAR TORNILLOS DEL DADO','Montaje y desmontaje',2.5],['QUITAR DADO','Montaje y desmontaje',3],
 ['LIMPIEZA DE MESA','Limpieza',2],['COLOCAR DADO NUEVO','Montaje y desmontaje',3.5],['APRETAR TORNILLOS','Montaje y desmontaje',2.5],['AJUSTE DE ALTURA','Ajustes y pruebas',5],
 ['ESPERA DE INSPECTOR','Espera',4],['PRIMERA PIEZA E INSPECCIÓN','Ajustes y pruebas',6],['REGRESAR DADO ANTERIOR','Búsqueda y traslado',5]].map(([desc,cat,t],i)=>({id:i,desc,cat,t}));
// Caso 1: paro actual = suma de todos los pasos
let r=smCalc(S,{});near(r.actual,44);
// Caso 2: con la sugerencia: búsqueda y traslado → externo (15.5), espera → eliminar (4), resto interno (24.5)
near(r.E,15.5);near(r.X,4);near(r.I,24.5);near(r.prop,24.5);near(r.red,19.5);near(r.pct,19.5/44);
// Caso 3: el analista decide: mantiene "regresar dado" interno y mejora el ajuste de altura de 5 a 1.5 (calzas fijas)
const S2=S.map(s=>s.desc==='REGRESAR DADO ANTERIOR'?Object.assign({},s,{cls:'I'}):s.desc==='AJUSTE DE ALTURA'?Object.assign({},s,{tn:'1,5'}):s);
r=smCalc(S2,{});near(r.prop,24.5+5-3.5);near(r.E,10.5);
// Caso 4: proyección: TC 1.2 y 10 cambios por semana → piezas recuperadas por cambio = reducción / TC
r=smCalc(S,{tcobj:'1.2',cpw:'10',wm:4});near(r.pzRec,19.5/1.2);near(r.hrs.week,19.5/60*10);near(r.hrs.year,19.5/60*10*4*12);near(r.pz.year,19.5/1.2*10*4*12);
// Caso 5: tiempo por categoría (Pareto del cambio): búsqueda y traslado 15.5 es la mayor, luego montaje 11.5
assert.strictEqual(r.byCat[0].cat,'Búsqueda y traslado');near(r.byCat[0].t,15.5);assert.strictEqual(r.byCat[1].cat,'Montaje y desmontaje');
// Caso 6: meta SMED (< 10 min de paro); sin pasos no truena
assert.strictEqual(r.meta,false);const z=smCalc([],{});assert.strictEqual(z.actual,0);assert.strictEqual(z.pct,0);assert.strictEqual(z.hrs,null);
console.log('OK: SMED, 6 casos pasan · paro',44,'→',24.5,'(−'+(19.5/44*100).toFixed(1)+' %)');
