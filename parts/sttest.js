const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));eval(fs.readFileSync(__dirname+'/stcalc.js','utf8').replace('const ST_CAUSES','var ST_CAUSES').replace('const stIsDef','var stIsDef'));
const assert=require('assert');const fx=JSON.parse(fs.readFileSync(__dirname+'/st_fixture.json','utf8'));
const recs=fx.recs.map(([t,c])=>({t,cause:c}));
const r=stCalc(recs,1.2,0);
// Caso 1: estadísticas de la Información complementaria con los 99 registros de Angel
assert.strictEqual(r.N,99);                                  // (el Excel contaba 98: rango hasta la fila 136)
assert.ok(Math.abs(r.T-123.798)<1e-9);
assert.ok(Math.abs(r.tcReal-123.798/99)<1e-12);              // TC real = promedio = 1.2505
assert.strictEqual(r.max,2);assert.strictEqual(r.min,0.87);
assert.strictEqual(r.ok,94);assert.strictEqual(r.def,5);
// Caso 2: OEE y JPH
assert.ok(Math.abs(r.oee-1.2*94/123.798)<1e-12);             // 91.12 %
assert.ok(Math.abs(r.jphReal-94/(123.798/60))<1e-9);         // 45.56
assert.strictEqual(r.jphObj,50);assert.strictEqual(r.jph85,42.5);
// Caso 3: balance cerrado: productivo + pérdidas + ganancia = tiempo registrado (100 %)
const sumLoss=Object.values(r.loss).reduce((a,b)=>a+b,0);
assert.ok(Math.abs(r.va+sumLoss+r.gain-r.T)<1e-9);
// Caso 4: ninguna causa negativa; defectivos llevan todo su tiempo
assert.ok(Object.values(r.loss).every(v=>v>=0));
assert.ok(Math.abs(r.loss['14']-6.913)<1e-9);
// Caso 5: registro lento sin causa -> 12 (pérdida de tiempo ciclo); rápido -> ganancia
const q=stCalc([{t:1.5,cause:''},{t:1.0,cause:''},{t:1.4,cause:'2'}],1.2,0);
assert.ok(Math.abs(q.loss['12']-0.3)<1e-12);assert.ok(Math.abs(q.gain+0.2)<1e-12);assert.ok(Math.abs(q.loss['2']-0.2)<1e-12);
// Caso 6: sin registros no truena
const z=stCalc([],1.2,0);assert.strictEqual(z.oee,0);assert.strictEqual(z.tcReal,0);
console.log('OK: Speed Trial, 6 casos pasan · OEE',(r.oee*100).toFixed(2)+'%');
// Caso 7: costo — JPH plan = 60/TC × OEE plan; proyección con 22.5 h, 6 días, 4 semanas, 12 meses
let k=stCost(40,1.2,85,23000,22.5,6,4);
assert.strictEqual(k.jphPlan,42.5);                       // 60/1.2 x 0.85
assert.ok(Math.abs(k.gap-2.5)<1e-12);
assert.ok(Math.abs(k.hour-57500)<1e-6);                   // 2.5 x 23,000
assert.ok(Math.abs(k.day-57500*22.5)<1e-6);
assert.ok(Math.abs(k.year-57500*22.5*6*4*12)<1e-3);
assert.ok(Math.abs(k.months[11]-k.year)<1e-6);           // acumulado al mes 12 = anual
// Caso 8: con los 99 registros de Angel la línea va ARRIBA del plan al 85 % (gap negativo = ventaja)
k=stCost(r.jphReal,1.2,85,25000,22.5,6,4);
assert.ok(k.gap<0);assert.ok(Math.abs(k.gap-(42.5-r.jphReal))<1e-12);
// Caso 9: JPH plan siempre por fórmula; horas por día propias de la empresa (24-0.5-0.5-0.5 = 22.5); OEE plan distinto
k=stCost(40,1.2,85,1000,24-0.5-0.5-0.5,6,4);assert.strictEqual(k.jphPlan,42.5);assert.ok(Math.abs(k.day-2500*22.5)<1e-9);
k=stCost(40,1.5,90,1000,22.5,6,4);assert.ok(Math.abs(k.jphPlan-36)<1e-12);assert.ok(Math.abs(k.gap+4)<1e-12);
console.log('OK: costo, 3 casos pasan · gap ejemplo',k.gap.toFixed(2),'JPH');
// Caso 10: cascada del OEE con los 99 registros: OK = productivo; A × P × Q = OEE; los niveles bajan en orden
const o=stOEE(r);
assert.ok(Math.abs(o.ok-r.va)<1e-9);
assert.ok(Math.abs(o.A*o.P*o.Q-r.oee)<1e-12);
assert.ok(Math.abs(o.avail-9.97)<1e-9);                     // paros (1 a 10)
assert.ok(Math.abs(o.qual-6.913)<1e-9);                     // defectivos (13 y 14)
assert.ok(o.P>1);                                           // piezas más rápidas que el TC objetivo: desempeño > 100 %
// Caso 11: paro programado suma al disponible pero no al laborable
const o2=stOEE(stCalc([{t:1.2,cause:''},{t:1.5,cause:'1'}],1.2,30));
assert.strictEqual(o2.disp,32.7);assert.ok(Math.abs(o2.lab-2.7)<1e-12);assert.ok(Math.abs(o2.A-2.4/2.7)<1e-12);
console.log('OK: cascada OEE, 2 casos pasan · A',(o.A*100).toFixed(1),'P',(o.P*100).toFixed(1),'Q',(o.Q*100).toFixed(1));
// Caso 12: estadísticas de la línea con los 99 registros
const ls=stLineStats(r,1.2,85);
assert.strictEqual(ls.jph100,50);assert.strictEqual(ls.jphPlan,42.5);
assert.ok(Math.abs(ls.jphMax-60/0.87)<1e-9);                 // 68.97 (en el Excel aparecía como "MIN")
assert.strictEqual(ls.jphMin,30);                             // 60 / 2.00 (en el Excel aparecía como "MAX")
assert.ok(Math.abs(ls.jphTT-60/(123.798/99))<1e-9);          // 47.98 (Excel 47.87 con 98 registros)
assert.ok(Math.abs(ls.possible-123.798/1.2)<1e-9);           // T. total / T.T = 103.17
assert.ok(Math.abs(ls.lossMin-(9.97+1.03+6.913))<1e-9);      // 17.913 min de anomalías
assert.ok(Math.abs(ls.lostPz-ls.lossMin/1.2)<1e-12);
assert.ok(Math.abs(ls.promWA-(123.798-ls.lossMin)/99)<1e-12);
console.log('OK: estadísticas de línea · JPH WOA',ls.jphWOA.toFixed(2),'· piezas perdidas',ls.lostPz.toFixed(2));
// Caso 13: Pareto con los 99 registros (sin problemas asignados -> agrupa por causa)
const pa=stPareto(recs,1.2,[]);
assert.strictEqual(pa.items.length,10);
assert.ok(Math.abs(pa.total-17.913)<1e-9);                       // mismo total que las estadísticas de línea
assert.ok(pa.items[0].label.startsWith('14.'));assert.ok(Math.abs(pa.items[0].min-6.913)<1e-9);
assert.strictEqual(pa.items.find(x=>x.key==='c2').rep,10);       // 14 marcados como paro corto, solo 10 excedieron el TC
assert.ok(Math.abs(pa.items[9].acc-1)<1e-12);                    // acumulado termina en 100 %
assert.ok(pa.items.every((x,i,a)=>!i||a[i-1].min>=x.min));        // ordenado por tiempo
// Caso 14: sin causa y lenta -> CAÍDA DE VELOCIDAD; rápida con falla -> no cuenta; problema del catálogo agrupa
const cat=[{id:7,est:'102',desc:'SE CAE HERRAMIENTA',m6:'Mano de obra',cause:'2'}];
const pb=stPareto([{t:1.5,cause:''},{t:1.4,cause:''},{t:1.0,cause:'2',probId:7},{t:1.6,cause:'2',probId:7},{t:1.3,cause:'2',probId:7}],1.2,cat);
assert.strictEqual(pb.items[0].label,'EST 102 · SE CAE HERRAMIENTA');assert.strictEqual(pb.items[0].rep,2);assert.ok(Math.abs(pb.items[0].min-0.5)<1e-12);
assert.strictEqual(pb.items[1].label,'CAÍDA DE VELOCIDAD');assert.ok(Math.abs(pb.items[1].min-0.5)<1e-12);
// Caso 15: más de 10 problemas -> top 9 + OTROS con el residuo
const many=Array.from({length:13},(_,i)=>({id:i+1,est:String(100+i),desc:'P'+i,cause:'1'}));
const pc=stPareto(many.map((p,i)=>({t:1.2+(13-i)*0.1,cause:'1',probId:p.id})),1.2,many);
assert.strictEqual(pc.items.length,10);assert.strictEqual(pc.items[9].label,'OTROS');assert.strictEqual(pc.items[9].otros,4);
assert.ok(Math.abs(pc.items[9].min-(0.4+0.3+0.2+0.1))<1e-9);
console.log('OK: Pareto, 3 casos pasan');
// Caso 16: cascada de caída de JPH — arranca en 60/TC, cierra exacto en el JPH real
{const C=stCascade(recs,1.2,[]);
assert.strictEqual(C.start,50);
assert.ok(Math.abs(C.end-r.jphReal)<1e-9);                     // 45.56
assert.ok(Math.abs(C.steps[0].jph+6.913/1.2/(123.798/60))<1e-9); // defectivo −2.79
assert.ok(Math.abs(C.gain.jph-6.915/1.2/(123.798/60))<1e-9);    // ganancia +2.79
assert.ok(C.steps.every(s=>s.jph<=0));
// sin ganancia, línea lenta: también cierra
const R2=[{t:1.5,cause:'2'},{t:1.2,cause:''},{t:2.0,cause:'14'}];const C2=stCascade(R2,1.2,[]);
assert.ok(Math.abs(C2.end-stCalc(R2,1.2,0).jphReal)<1e-9);
assert.strictEqual(stCascade([],1.2,[]),null);}
console.log('cascada OK');
