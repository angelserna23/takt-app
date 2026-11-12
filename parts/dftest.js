const fs=require('fs');global.nid=(()=>{let i=0;return()=>++i;})();['dscalc','dfcalc'].forEach(f=>eval.call(global,fs.readFileSync(__dirname+'/'+f+'.js','utf8')));
const assert=require('assert');
const D=()=>({nodes:[],lay:{rows:4,cols:4,pos:{}}});
// Caso 1: agregar y conectar en cadena (siguiente abajo)
let d=D();const a=dfAdd(d,'ini',[0,0]);let s=dfSlot(d,a.id,'next');assert.deepStrictEqual(s,[1,0]);
const b=dfAdd(d,'op',s,a.id,'next');assert.strictEqual(a.next,b.id);assert.deepStrictEqual(d.lay.pos[b.id],[1,0]);
// Caso 2: decisión con dos caminos automáticos: SÍ abajo, NO a la derecha
const c=dfAdd(d,'dec',dfSlot(d,b.id,'next'),b.id,'next');assert.deepStrictEqual(dfSlot(d,c.id,'yes'),[3,0]);assert.deepStrictEqual(dfSlot(d,c.id,'no'),[2,1]);
const y=dfAdd(d,'tra',dfSlot(d,c.id,'yes'),c.id,'yes');const n=dfAdd(d,'dem',dfSlot(d,c.id,'no'),c.id,'no');
assert.strictEqual(c.yes,y.id);assert.strictEqual(c.no,n.id);assert.deepStrictEqual(dfOpen(d,c),[]);
// Caso 3: la cuadrícula crece sola al agregar fuera del borde
const f=dfAdd(d,'ini',dfSlot(d,y.id,'next'),y.id,'next');assert.strictEqual(d.lay.rows,5);
// Caso 4: orden del proceso: siguiente → SÍ → NO
assert.deepStrictEqual(dfOrder(d).map(x=>x.t),['ini','op','dec','tra','ini','dem']);
// Caso 5: avisos: demora sin siguiente y sin acciones escritas; el fin no pide siguiente
const w=dfWarn(d);assert.ok(w.some(([id,t])=>id===n.id&&t==='no tiene siguiente paso'));assert.ok(!w.some(([id,t])=>id===f.id&&t==='no tiene siguiente paso'));
assert.strictEqual(w.filter(([,t])=>t==='sin acción escrita').length,6);
// Caso 6: retrabajo: NO regresa a la operación (ciclo) sin trabarse
n.next=b.id;assert.strictEqual(dfOrder(d).length,6);assert.ok(!dfWarn(d).some(([id,t])=>id===n.id&&t==='no tiene siguiente paso'));
// Caso 7: resumen ASME (sin inicio/fin ni decisiones)
b.tiempo='2.5';y.tiempo='1.20';y.dist='35';n.tiempo='4';const S=dfSummary(d);
assert.strictEqual(S.act,3);assert.strictEqual(S.dec,1);assert.strictEqual(S.rows.find(r=>r.t==='tra').dist,35);assert.ok(Math.abs(S.tiempo-7.7)<1e-9);assert.ok(Math.abs(S.pctOp-1/3)<1e-9);
// Caso 8: quitar un símbolo limpia las conexiones que llegaban a él
dfRemove(d,c.id);assert.strictEqual(b.next,null);assert.strictEqual(d.lay.pos[c.id],undefined);
// Caso 9: flechas en escuadra (solo horizontales y verticales)
const g={cx:c=>c*200,cy:r=>r*150,W:140,H:90,G:60};const ortho=P=>P.every((p,i)=>i===0||p[0]===P[i-1][0]||p[1]===P[i-1][1]);
[[[0,0],[1,0],'next'],[[0,0],[0,2],'next'],[[0,0],[2,1],'next'],[[1,0],[2,2],'no'],[[3,1],[0,0],'next'],[[1,0],[3,0],'no'],[[2,2],[0,2],'next']].forEach(([A,B,o])=>assert.ok(ortho(dfPath(A,B,o,g)),JSON.stringify([A,B])));
assert.strictEqual(dfPath([0,0],[1,0],'next',g).length,2);assert.ok(dfPath([1,0],[3,0],'no',g).every(p=>p[0]>=70),'NO hacia abajo no cruza la columna');assert.strictEqual(dfPath([1,0],[2,2],'no',g).length,3);
// Caso 10: mover e intercambiar no cambia las conexiones
const e=D();const p1=dfAdd(e,'op',[0,0]);const p2=dfAdd(e,'insp',[1,0],p1.id);dfSwap(e.lay,p1.id,p2.id);assert.deepStrictEqual(e.lay.pos[p1.id],[1,0]);assert.strictEqual(p1.next,p2.id);
dfMoveTo(e.lay,p2.id,[5,6]);assert.strictEqual(e.lay.cols,7);
console.log('OK: Diagrama de flujo, 10 casos pasan');
