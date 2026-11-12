const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));eval(fs.readFileSync(__dirname+'/pccalc.js','utf8'));
const assert=require('assert');const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,a+' != '+b);
// Renglones con los datos de los dos meses del Excel de Angel (nombres ficticios)
const L1={nombre:'LINEA 1',dias:26,hd:22.5,tpm:2,dom:4,oee:70,jph:30,op:5,ld:1,sup:1,hcTpm:1,hcProy:1,hcOtros:5,vol:15000,esq:'C'};
const L2={nombre:'LINEA 2',dias:26,hd:22.5,tpm:1,dom:4,oee:86,jph:50,op:5,ld:1,sup:1,hcTpm:3,hcProy:2,hcOtros:1,vol:20000,esq:'C'};
// Caso 1 (enero del Excel): 623 h disponibles, 500 requeridas, 80.26 %, HC 25 / 28 / 27
let a=pcRow(L1);near(a.hDisp,623);near(a.hReq,500);near(a.occ,500/623);near(a.cap,18690);near(a.gap,3690);
near(a.tc,1.4);near(a.lat,12);near(a.at,12/(500/623));near(a.hh,3000);near(a.hPer,623/3);
assert.strictEqual(a.hcVol,25);assert.strictEqual(a.hcEsq,28);assert.strictEqual(pcRed(a.hcEsq,5),27);
// Caso 2 (febrero del Excel): 649 h, 61.6 %, HC 21 / 27 / 26
let b=pcRow(L2);near(b.hDisp,649);near(b.occ,400/649);near(b.gap,32450-20000);
assert.strictEqual(b.hcVol,21);assert.strictEqual(b.hcEsq,27);assert.strictEqual(pcRed(b.hcEsq,5),26);
// Caso 3: redondeo POR GRUPO. 13.2 personas en 3 grupos = 4.4 por grupo → 5 × 3 = 15 (sobre el total daría 14, que no se reparte)
const L3=Object.assign({},L1,{vol:13706});const c=pcRow(L3);near(c.porGrupo,4.4);near(c.porGrupo*3,13.2);assert.strictEqual(c.directVol,15);assert.strictEqual(Math.ceil(13.2),14);
// Caso 4: domingos sin TPM; esquema B = 2 grupos
const L4={dias:26,hd:15,tpm:1,dom:0,oee:85,jph:40,op:3,ld:1,sup:1,hcTpm:1,vol:9000,esq:'B'};const d=pcRow(L4);
near(d.hDisp,364);assert.strictEqual(d.Z,2);assert.strictEqual(d.hcVol,9);assert.strictEqual(d.hcEsq,11);assert.strictEqual(pcRed(d.hcEsq,5),11);
// Caso 5: total del mes = suma de renglones; ocupación ponderada por horas
const m=pcMonth([L1,L2,L4],5);assert.strictEqual(m.hcVol,55);assert.strictEqual(m.hcEsq,66);assert.strictEqual(m.hcRed,64);near(m.occ,(500+400+225)/(623+649+364));
// Caso 6: sin esquema o sin JPH no truena (el Excel daba "Empty")
const e=pcRow({dias:26,hd:22.5,vol:100});assert.strictEqual(e.hcVol,0);assert.strictEqual(e.occ,0);assert.strictEqual(pcMonth([],5).hcVol,0);
// Caso 7: año fiscal desde abril: noviembre 2026 → FY27; marzo 2026 → FY26
assert.strictEqual(pcFY(new Date(2026,10,11)),27);assert.strictEqual(pcFY(new Date(2026,2,1)),26);
// Caso 8: volumen con coma de miles
assert.strictEqual(pcRow(Object.assign({},L1,{vol:'15,000'})).hcVol,25);near(pcRow(Object.assign({},L1,{vol:'15,000'})).hReq,500);
// Caso 9: personal que agrega valor vs afectación (plantilla del esquema): Línea 1 = 18 directos (5+1)×3 y 10 de afectación (1×3 + 7)
assert.strictEqual(a.dirEsq,18);assert.strictEqual(a.afecEsq,10);assert.strictEqual(a.dirEsq+a.afecEsq,a.hcEsq);
const mm=pcMonth([L1,L2,L4],5);assert.strictEqual(mm.dir,18+18+8);assert.strictEqual(mm.afec,10+9+3);near(mm.afecPct,22/66);
// Caso 10: LAT del mes ponderado = horas-hombre totales × 60 ÷ volumen total; AT = LAT ÷ ocupación; reducción = esquema − meta
near(mm.lat,(3000+2400+900)*60/44000);near(mm.at,mm.lat/mm.occ);assert.strictEqual(mm.reducir,2);
// Caso 11: personas arriba del volumen, piezas por persona y holgura de capacidad
assert.strictEqual(mm.sobre,66-55);near(mm.pzPer,44000/66);near(mm.holg,mm.gap/mm.cap);
const falta=pcMonth([Object.assign({},L1,{vol:30000})],5);assert.ok(falta.sobre<0);assert.ok(falta.holg<0);
console.log('OK: Cálculo de personal, 11 casos pasan · enero 25/28/27 · febrero 21/27/26 · total 55/66/64');
