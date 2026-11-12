const fs=require('fs');eval(fs.readFileSync(__dirname+'/dscalc.js','utf8'));eval(fs.readFileSync(__dirname+'/atcalc.js','utf8'));
const assert=require('assert');const near=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,a+' != '+b);
// Ejemplo ficticio: ENSAMBLE, un mes, dos partes
const ENS={partes:[{st:30,prod:12000},{st:40,prod:8000}],horasTrab:24000,
  afect:{tecnico:200,evento:300,tpm:900,proyectos:100,otros:1500},dias:20,horasDia:22.5,
  hcPlan:100,jphCommit:60,gruposCommit:2,hcRes:104,jphRes:55,sv:6,lider:12,otrosInd:8,dst:15};
const e=atMonth(ENS);
// Caso 1: horas requeridas, ST ponderado, eficiencia y Actual Time real (= ST ÷ eficiencia)
near(e.prod,20000);near(e.horasReq,11333.333333,1e-5);near(e.st,34);near(e.efic,11333.3333333/24000,1e-9);
near(e.atReal,72);near(e.atReal,e.st/e.efic);
// Caso 2: sin afectación = trabajadas − afectaciones (genba fuera; si se usa, va en "otros")
near(e.eficSA,11333.3333333/21000,1e-9);near(e.atSA,63,1e-6);assert.ok(e.atSA<=e.atReal);
// Caso 3: meta (TARGET) y forecast
near(e.target,50);near(e.forecast,60/55*52);near(e.vsTarget,22);
// Caso 4: cascada de HC (horas por persona = 20 × 22.5 ÷ 2 = 225)
near(e.hPer,225);near(e.hcTrab,24000/225);near(e.dif,24000/225-100);near(e.ausentismo,0);near(e.arribaPlan,24000/225-100);
near(e.res1,21000/225);near(e.res2,21000/225-26);near(e.hcReq,11333.333333/225,1e-6);near(e.gap,e.res2-e.hcReq);
// Caso 5: si se trabajó menos que el plan es ausentismo (el Excel usaba valor absoluto para ambos)
const a=atMonth(Object.assign({},ENS,{horasTrab:20250}));near(a.hcTrab,90);near(a.ausentismo,10);near(a.arribaPlan,0);
// Caso 6: DSTR — objetivo sin ajuste, real − 0.07; sin afectaciones como el Excel (sin genba)
near(e.dstrObj,50/15);near(e.dstrReal,72/15-0.07);near(e.dstrRealSA,34/(11333.3333333/21000)/15-0.07,1e-6);
// Caso 7: grupos reales para convertir horas en personas; comprometidos para la meta (MAQUINADO, 2 de 3 turnos)
const MAQ={partes:[{st:14,prod:19000}],horasTrab:8000,afect:{tpm:380,evento:280},dias:24,horasDia:22.5,
  hcPlan:66,jphCommit:60,gruposCommit:3,gruposReal:2,hcRes:44,jphRes:62};
const q=atMonth(MAQ);near(q.target,60/60*66/3);near(q.hPer,24*22.5/2);near(q.hcTrab,8000/270);
const q3=atMonth(Object.assign({},MAQ,{gruposReal:''}));near(q3.hPer,24*22.5/3);near(q3.hcTrab,8000/180);
// Caso 8: JPMH con el mismo denominador (HC por grupo) en real y compromiso
near(q.jpmh,62/22);near(q.jpmhCommit,60/22);
// Caso 9: ensamble y Manejo de materiales: mismo DST y producción; cambia el HC/horas
const MH=Object.assign({},ENS,{partes:[{st:9,prod:20000}],horasTrab:6000,afect:{tpm:300},hcPlan:28,hcRes:30,sv:2,lider:3,otrosInd:1});
const h=atMonth(MH);near(h.atReal,18);near(h.dstrReal,18/15-0.07);near(h.target,60/60*28/2);
// Caso 10: sin datos no truena
const z=atMonth({});assert.strictEqual(z.atReal,0);assert.strictEqual(z.target,0);assert.strictEqual(z.gap,0);
// Caso 12: 100 números de parte — cada fila aporta sus horas requeridas; el resto es sobre el total
const cien=[];for(let i=1;i<=100;i++)cien.push({parte:'P-'+i,st:10+i%7,prod:100+i});
const c=atMonth(Object.assign({},ENS,{partes:cien}));let req=0,pz=0;cien.forEach(p=>{req+=p.prod*p.st/60;pz+=p.prod;});
near(c.horasReq,req,1e-6);near(c.prod,pz);near(c.atReal,24000*60/pz,1e-9);near(c.partes.reduce((a,p)=>a+p.pct,0),1,1e-9);assert.strictEqual(c.partes.length,100);
// Caso 13: ST en ensamble, LAT en las demás áreas
assert.strictEqual(atTimeLbl('ENSAMBLE'),'ST');assert.strictEqual(atTimeLbl('MAQUINADO'),'LAT');assert.strictEqual(atTimeLbl('FUNDICIÓN'),'LAT');
// Caso 14: Manejo de materiales como espejo de ensamble (misma producción y DST; su LAT, horas y HC)
const EM=Object.assign({},ENS,{partes:[{parte:'A',st:30,lat:9,prod:12000},{parte:'B',st:40,lat:9,prod:8000}],  // un solo LAT de MH para toda la línea

  mh:{horasTrab:6000,afect:{tpm:300},hcPlan:28,hcRes:30,sv:2,lider:3,otrosInd:1}});
const em=atMH(EM);near(em.prod,20000);near(em.horasReq,20000*9/60);near(em.atReal,18);near(em.target,14);
near(em.dstrReal,18/15-0.07);near(em.hcTrab,6000/225);near(em.res2,(6000-300)/225-6);near(atMonth(EM).atReal,72);
// Caso 11: días del mes del año fiscal (FY26 = abril 2026 a marzo 2027): abril = 30, enero = 31, febrero 2027 = 28; FY27 incluye febrero 2028 = 29
assert.strictEqual(atDiasMes(26,0),30);assert.strictEqual(atDiasMes(26,10),28);assert.strictEqual(atDiasMes(26,9),31);assert.strictEqual(atDiasMes(27,10),29);
console.log('OK: Actual Time, 14 casos pasan · AT real '+e.atReal.toFixed(2)+' vs target '+e.target.toFixed(2)+' · GAP '+e.gap.toFixed(2)+' HC');
