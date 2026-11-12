const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));
const assert=require('assert');
// Caso 1: ejemplo del Excel de Angel (6 operaciones, 6 ciclos iguales)
const base=[0.15,0.3,0.45,0.65,0.32,0.12];
const els=base.map((t,i)=>({id:i+1,cap:1,racks:1,snp:1,times:[t,t,t,t,t,t,'','','','']}));
els.forEach(e=>e.secs=weAvg(e.times)*60);
assert.ok(Math.abs(weAvg(els[3].times)-0.65)<1e-12);
const asg={};els.forEach(e=>asg[e.id]=1);
let r=dsCalc(els,[{id:1,name:'Op1',obj:10}],asg,10,60);
assert.ok(Math.abs(r.rows[0].load-19.9)<1e-9);                  // 19.9
assert.strictEqual(Math.round(r.rows[0].occ*100),33);           // 33 %
assert.ok(Math.abs(r.rows[0].free-40.1)<1e-9);                  // 40.1
r=dsCalc(els,[{id:1,name:'Op3',obj:20}],asg,10,60);
assert.strictEqual(Math.round(r.rows[0].occ*100),66);           // 66 %, 39.8, libre 20.2
assert.ok(Math.abs(r.rows[0].free-20.2)<1e-9);
// Caso 2: base tiempo ciclo: disponible = CT de la línea (1.2 min), objetivo = 1 pieza
r=dsCalc(els,[{id:1,name:'Op1'}],asg,1,1.2);
assert.ok(Math.abs(r.rows[0].occ-1.99/1.2)<1e-12);              // 166 %: no le da el ciclo
// Caso 3: promedio con ciclos distintos y celdas vacías; un 0 escrito sí cuenta
assert.ok(Math.abs(weAvg([0.2,0.3,'',0.4])-0.3)<1e-12);
assert.ok(Math.abs(weAvg(['0',0.3])-0.15)<1e-12);
assert.strictEqual(weAvg(['','']),0);
// Caso 4: ciclos completos (todos los elementos con tiempo)
const a=[{times:[1,1,1]},{times:[1,'',1]}];
assert.strictEqual(weComplete(a,3),2);
console.log('OK: Work Element, 4 casos pasan');
