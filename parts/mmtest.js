const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));eval(fs.readFileSync(__dirname+'/mmcalc.js','utf8'));
const assert=require('assert');const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,a+' != '+b);
const M=(name,tc,pasos,extra={})=>Object.assign({id:name,name,kind:'maq',n:1,tcs:[tc],cd:0.06,man:[],pasos},extra);
const P=(name,kind,pasos)=>({id:name,name,kind,n:1,tcs:[],cd:0.03,man:[],pasos});
// Ejemplo de Angel en el orden en que camina el operador (empieza en la entrada)
const sts=[P('ENTRADA','ent',1),M('MAQUINA 1',0.908,2),M('MAQUINA 2',0.715,2),M('MAQUINA 3',1.12,3),M('MAQUINA 4',1.09,4),M('MAQUINA 5',0.87,4),M('MAQUINA 6',0.974,3),P('SALIDA','sal',2)];
// Caso 1: el recorrido arranca en la de TC más alto (MAQUINA 3) y conserva el orden de la vuelta
const T=mmTable(sts,0.7);
assert.deepStrictEqual(T.rows.map(r=>r.name),['MAQUINA 3','MAQUINA 4','MAQUINA 5','MAQUINA 6','SALIDA','ENTRADA','MAQUINA 1','MAQUINA 2']);
assert.deepStrictEqual(T.rows.map(r=>r.pasos),[3,4,4,3,2,1,2,2]);
// Caso 2: totales de la vuelta: carga/descarga 6×0.06 + 2×0.03 = 0.42; pasos 21; metros 14.7
near(T.man,0.42);assert.strictEqual(T.pasos,21);near(T.metros,14.7);near(T.tcMax,1.12);
// Caso 3: gemelas de 2.0 → 1.0; trillizas 2.4, 2.5, 2.3 → promedio 2.4 / 3 = 0.8
near(mmTcEff(M('G',0,0,{n:2,tcs:[2,2]})),1);near(mmTcEff(M('T',0,0,{n:3,tcs:[2.4,2.5,2.3]})),0.8);
// …y la gemela entra al recorrido con su TC efectivo (2.4/2 = 1.2 > 1.12, ahora es la primera)
assert.strictEqual(mmTable(sts.concat([M('MAQ GEMELA',0,1,{n:2,tcs:['2.4','2,4']})]),0.7).rows[0].name,'MAQ GEMELA');
// Caso 4: manuales fuera del ciclo suman a la operación manual; durante el ciclo van aparte
const s=M('X',1,1,{man:[{t:'0.10',dur:false},{t:'0,05',dur:false},{t:0.2,dur:true}]});
near(mmMan(s),0.21);near(mmDur(s),0.2);
// Caso 5: GAP = TC plan − TC real; sin plan no hay GAP; entrada/salida no tienen TC
near(mmGap(M('Y',1.12,0,{tcplan:'1.1'})),-0.02);assert.strictEqual(mmGap(M('Y',1.12,0)),null);assert.strictEqual(mmTcEff(P('E','ent',1)),0);
// Caso 6: lo corregido a mano en "Revisar tabla" manda sobre lo calculado
near(mmMan(M('Z',1,1,{ov:{man:'0.5'}})),0.5);near(mmTcEff(M('Z',1,1,{ov:{tc:'0.9'}})),0.9);
// Caso 7: layout automático en U, sin encimar estaciones
const L=mmAutoLayout(['a','b','c','d','e']);assert.strictEqual(L.cols,3);assert.strictEqual(new Set(Object.values(L.pos).map(String)).size,5);
assert.deepStrictEqual(mmTable([],0.7).rows,[]);
console.log('OK: Man Machine (llenado), 7 casos pasan · pasos',T.pasos,'· metros',T.metros.toFixed(1));
// Caso 8: agregar desde una casilla vacía → entra entre las dos estaciones vecinas del recorrido
{const s3=[{id:1},{id:2},{id:3},{id:4}];const pos={1:[0,3],2:[0,1],3:[1,1],4:[1,3]};
assert.strictEqual(mmInsertAt(s3,pos,[0,2]),1);   // entre 1 y 2 (arriba)
assert.strictEqual(mmInsertAt(s3,pos,[1,2]),3);   // entre 3 y 4 (abajo)
assert.strictEqual(mmInsertAt([{id:1}],{1:[0,0]},[0,1]),1);
console.log('OK: inserción desde el layout');}
// Caso 9 (reporte de Angel): ... MAQ2 → MAQ3 → MAQ4 ... y la estación manual se coloca entre MAQ3 y MAQ4 en el layout
{const sts=[{id:'m1'},{id:'m2'},{id:'m3'},{id:'man'},{id:'m4'},{id:'m5'}];
 // estaba mal metida entre m2 y m3; en el dibujo queda arriba, entre m4 (0,2) y m3 (0,4); m2 está abajo (1,3)
 const pos={m1:[1,2],m2:[1,3],m3:[0,4],m4:[0,2],m5:[0,1],man:[1,4]};
 const o=mmMoveTo([{id:'m1'},{id:'m2'},{id:'man'},{id:'m3'},{id:'m4'},{id:'m5'}],pos,'man',[0,3]);
 assert.deepStrictEqual(o.sts.map(x=>x.id),['m1','m2','m3','man','m4','m5']);
 const w=mmSwap(o.sts,o.pos,'m1','m5');assert.deepStrictEqual(w.sts.map(x=>x.id),['m5','m2','m3','man','m4','m1']);assert.deepStrictEqual(w.pos.m1,[0,1]);
 console.log('OK: mover en el layout cambia el recorrido');}
// ===== Gráfica =====
{const sts=[P('ENTRADA','ent',1),M('MAQUINA 1',0.908,2),M('MAQUINA 2',0.715,2),M('MAQUINA 3',1.12,3),M('MAQUINA 4',1.09,4),M('MAQUINA 5',0.87,4),M('MAQUINA 6',0.974,3),P('SALIDA','sal',2)];
 // Caso 10: con el 0.6 del Excel de Angel en MAQUINA 1 el ciclo del operador da su 1.17 (réplica del VBA)
 const xl=sts.map(s=>s.name==='MAQUINA 1'?Object.assign({},s,{cd:0.6}):s);const gx=mmChart(mmTable(xl,0.7).rows);
 near(gx.top,1.17);near(gx.C,1.508);assert.strictEqual(gx.lim.name,'MAQUINA 1');
 // Caso 11: corregido (0.06): operador 0.63, la celda la limita MAQUINA 3 (0.06 + 1.12 = 1.18), el operador espera 0.55
 const g=mmChart(mmTable(sts,0.7).rows);
 near(g.top,0.63);near(g.C,1.18);near(g.wait,0.55);assert.strictEqual(g.lim.name,'MAQUINA 3');
 near(g.walkT,0.21);near(g.manT,0.42);near(g.occ,0.63/1.18);near(g.jph,60/1.18);
 // Caso 12: ocio por máquina = ciclo de la celda − (manual + TC); la que limita tiene 0
 const idle=Object.fromEntries(g.rows.filter(r=>r.maq).map(r=>[r.name,+r.idle.toFixed(3)]));
 assert.deepStrictEqual(idle,{'MAQUINA 3':0,'MAQUINA 4':0.03,'MAQUINA 5':0.25,'MAQUINA 6':0.146,'MAQUINA 1':0.212,'MAQUINA 2':0.405});
 // Caso 13: tiempos de la vuelta: MAQ4 llega en 0.09 (0.06 + 3 pasos), su máquina termina en 1.24
 near(g.rows[1].arr,0.09);near(g.rows[1].mEnd,1.24);
 // Caso 14: si el operador es más lento que todas las máquinas, la celda la limita el operador y no espera
 const h=mmChart(mmTable([M('A',0.3,30),M('B',0.2,30)],0.7).rows);near(h.top,0.12+0.6);assert.strictEqual(h.lim,null);near(h.wait,0);near(h.C,0.72);
 // Caso 15: manual durante el ciclo alarga al operador pero no a la máquina
 const q=mmChart(mmTable([M('A',1,0,{man:[{t:0.2,dur:true}]})],0.7).rows);near(q.top,0.26);near(q.C,1.06);
 console.log('OK: gráfica hombre-máquina, 6 casos · operador',g.top.toFixed(2),'celda',g.C.toFixed(2),'espera',g.wait.toFixed(2));}
// ===== KPIs =====
{const sts=[P('ENTRADA','ent',1),M('MAQUINA 1',0.908,2),M('MAQUINA 2',0.715,2),M('MAQUINA 3',1.12,3),M('MAQUINA 4',1.09,4),M('MAQUINA 5',0.87,4),M('MAQUINA 6',0.974,3),P('SALIDA','sal',2)];
 const T=mmTable(sts,0.7),G=mmChart(T.rows);
 // Caso 16: JPH plan = (60 / 1.10) × 85 % = 46.36; real 60 / 1.18 = 50.85 → la celda va 4.49 arriba del plan
 const K=mmKpis(G,T.rows,{tcobj:'1.10',oeePlan:'85',hd:22.5,dw:6,wm:4});
 near(K.jph100,60/1.1);near(K.jphPlan,60/1.1*0.85);near(K.jphReal,60/1.18);near(K.gap,60/1.1*0.85-60/1.18);assert.ok(K.gap<0);
 // con TC objetivo 0.95: plan = 53.68 → se pierden 2.83 pz/h; proyección como en el Speed Trial
 const K2=mmKpis(G,T.rows,{tcobj:'0.95',oeePlan:'85',hd:22.5,dw:6,wm:4});near(K2.gap,60/0.95*0.85-60/1.18);near(K2.pz.year,K2.gap*22.5*6*4*12);
 // OEE plan vacío = 85 %
 near(mmKpis(G,T.rows,{tcobj:'1.10',oeePlan:'',hd:1,dw:1,wm:1}).jphPlan,K.jphPlan);
 // Caso 17: espera 0.55 de 1.18 = 46.6 % → 10.49 h-hombre por día sin trabajo
 near(K.waitFrac,0.55/1.18);near(K.hh.day,0.55/1.18*22.5);
 // Caso 18: ocupación contra el objetivo: MAQUINA 3 = 1.12 / 1.10 = 101.8 %
 assert.deepStrictEqual(K.over.map(m=>m.name),['MAQUINA 3']);near(K.occAvg,K.tcAvg/1.1);
 const K0=mmKpis(G,T.rows,{tcobj:'',hd:22.5,dw:6,wm:4});assert.strictEqual(K0.gap,0);
 console.log('OK: KPIs Man Machine, 3 casos · plan',K.jphPlan.toFixed(2),'real',K.jphReal.toFixed(2),'· con TC 0.95 pierde',K2.gap.toFixed(2),'pz/h');}
