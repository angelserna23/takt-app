const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));
const assert=require('assert');
// Caso 1: ejemplo del Excel de Angel (tiempos en minutos, 1 rack x SNP 4, objetivo 6, disponible 60)
const mins=[1.12,1.15,0.5,1.12,13.14145,5,5.6543,0.323,3.34141,0.324];
const acts=mins.map((m,i)=>({id:i+1,secs:m*60,racks:1,snp:4,linkTo:null}));
const assign={};acts.forEach(a=>assign[a.id]=1);
assert.ok(Math.abs(dsPerPiece(acts[4],acts)-3.2853625)<1e-9);      // TRASLADAR 3.2853625
let r=dsCalc(acts,[{id:1,name:'Op 1'}],assign,6,60);
assert.ok(Math.abs(r.rows[0].load-47.5112)<1e-4);                   // 47.5112
assert.strictEqual(Math.round(r.rows[0].occ*100),79);               // 79 %
assert.ok(Math.abs(r.rows[0].free-12.4888)<1e-4);                   // 12.4888
// Caso 2: regreso vacío ligado a su traslado: 2 min / 4 piezas = 0.5 min/pza
const t=[{id:1,secs:240,racks:1,snp:4,linkTo:null},{id:2,secs:120,racks:0,snp:4,linkTo:1}];
assert.strictEqual(dsPerPiece(t[1],t),0.5);
assert.strictEqual(dsUnlinked(t[1],t),false);
// Caso 3: vuelta vacía SIN otro traslado en el estudio -> 0 y marcada
const u=[{id:1,secs:120,racks:0,snp:0,linkTo:null}];
assert.strictEqual(dsPerPiece(u[0],u),0);assert.strictEqual(dsUnlinked(u[0],u),true);
// Caso 3b: vuelta vacía sin ligar -> se suma sola al traslado anterior (4 pzs): 3 min / 4 = 0.75
const v=[{id:1,secs:240,racks:1,snp:4,linkTo:null},{id:2,secs:60,racks:2,snp:5,linkTo:null},{id:3,secs:180,racks:'',snp:'',linkTo:null}];
assert.strictEqual(dsPerPiece(v[2],v),180/60/10);   // el anterior con piezas es el #2 (2x5=10)
assert.strictEqual(dsUnlinked(v[2],v),false);
// Caso 3c: vuelta vacía al inicio -> se suma al siguiente traslado
const w=[{id:1,secs:120,racks:0,snp:0,linkTo:null},{id:2,secs:240,racks:1,snp:4,linkTo:null}];
assert.strictEqual(dsPerPiece(w[0],w),0.5);
// Caso 4: actividades sin asignar no cuentan; escenario +20 % de demanda
r=dsCalc(acts,[{id:1,name:'A'},{id:2,name:'B'}],{1:1,5:2},6,60,1.2);
assert.ok(Math.abs(r.rows[1].load-3.2853625*7.2)<1e-9);
assert.ok(Math.abs(r.needed-r.total/60)<1e-12);
// Caso 5: día de 720 min con objetivo 600 piezas
r=dsCalc([{id:1,secs:30,racks:1,snp:1,linkTo:null}],[{id:1,name:'A'}],{1:1},600,720);
assert.ok(Math.abs(r.rows[0].occ-300/720)<1e-12);                  // 0.5 min x 600 = 300 min de 720
// Caso 6: objetivo propio por operador (A usa el estándar 6, B usa 10)
r=dsCalc(acts,[{id:1,name:'A'},{id:2,name:'B',obj:10}],{1:1,5:2},6,60);
assert.ok(Math.abs(r.rows[0].load-0.28*6)<1e-9);
assert.ok(Math.abs(r.rows[1].load-3.2853625*10)<1e-9);
// Caso 7: la vuelta vacía solo se suma a traslados del MISMO operador cronometrado
const z=[{id:1,cap:1,secs:240,racks:1,snp:4},{id:2,cap:2,secs:60,racks:1,snp:10},{id:3,cap:1,secs:120,racks:0,snp:0}];
assert.strictEqual(dsPerPiece(z[2],z),0.5);   // se suma al #1 (op 1, 4 pzs), no al #2 (op 2)
// Caso 8: escenario +10 piezas a todos y +25 % escrito a mano
const ops2=[{id:1,name:'A'},{id:2,name:'B',obj:10}];
r=dsCalc(acts,ops2,{1:1,5:2},6,60,{add:10,pct:''});
assert.ok(Math.abs(r.rows[0].obj-16)<1e-12);assert.ok(Math.abs(r.rows[1].obj-20)<1e-12);
r=dsCalc(acts,ops2,{1:1,5:2},6,60,{add:'',pct:'25'});
assert.ok(Math.abs(r.rows[0].obj-7.5)<1e-12);
r=dsCalc(acts,ops2,{1:1,5:2},6,60,{add:4,pct:50});
assert.ok(Math.abs(r.rows[0].obj-15)<1e-12);          // (6+4) x 1.5
r=dsCalc(acts,ops2,{1:1,5:2},6,60,{add:-20,pct:0});
assert.strictEqual(r.rows[0].obj,0);                  // nunca negativo
// Caso 9: números escritos con coma decimal
assert.strictEqual(num('1,5'),1.5);
console.log('OK: Delay Study, 9 casos pasan');
