const fs=require('fs');['dscalc','pccalc','atcalc','eccalc'].forEach(f=>eval.call(global,fs.readFileSync(__dirname+'/'+f+'.js','utf8')));
global.PC_MONTHS=global.PC_MONTHS||['Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre','Enero','Febrero','Marzo'];
const assert=require('assert');const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,a+' != '+b);
const M=(o)=>Object.assign({dias:20,horasDia:22.5,gruposCommit:2,hcPlan:100,jphCommit:60,afect:{}},o);
// Ensamble + MH (abril y mayo)
const ENS={tipo:'ENSAMBLE',mh:true,months:Array(12).fill(null)};
ENS.months[0]=M({partes:[{st:30,lat:9,prod:12000},{st:40,lat:9,prod:8000}],horasTrab:24000,afect:{tpm:900,otros:2100},mh:{horasTrab:6000,afect:{tpm:300}}});
ENS.months[1]=M({partes:[{st:30,lat:9,prod:13200},{st:40,lat:9,prod:8600}],horasTrab:25800,afect:{tpm:900,otros:1650},mh:{horasTrab:6400,afect:{tpm:300}}});
// Maquinado (abril y mayo)
const MAQ={tipo:'MAQUINADO',months:Array(12).fill(null)};
MAQ.months[0]=M({partes:[{st:14,prod:12000},{st:16,prod:7000}],horasTrab:9200,afect:{tpm:380,evento:280}});
MAQ.months[1]=M({partes:[{st:14,prod:12900},{st:16,prod:7600}],horasTrab:9900,afect:{tpm:380,otros:745}});
// Caso 1: ensamble + MH como una sola área
const e0=ecArea(ENS,0);near(e0.req,11333.333333333334+3000);near(e0.trab,30000);near(e0.afect,3300);near(e0.efic,14333.333333333334/30000);near(e0.eficSA,14333.333333333334/26700);near(e0.vol,20000/30000);
// Caso 2: maquinado solo
const q0=ecArea(MAQ,0);near(q0.req,(12000*14+7000*16)/60);near(q0.efic,q0.req/9200);near(q0.eficSA,q0.req/(9200-660));
// Caso 3: planta ponderada por horas (no promedio de %)
const S=[ecSeries(ENS),ecSeries(MAQ)];const P=ecPlant(S);near(P[0].efic,(e0.req+q0.req)/(30000+9200));
assert.ok(Math.abs(P[0].efic-(e0.efic+q0.efic)/2)>0.001,'debe diferir del promedio simple');
// Caso 4: cambio contra el mes anterior (puntos y % de volumen)
const e1=S[0].months[1];near(e1.dEfic,e1.efic-e0.efic);near(e1.dVol,e1.vol/e0.vol-1);assert.strictEqual(S[0].months[0].dEfic,null);
// Caso 5: abril contra marzo del año fiscal anterior
const PREV={tipo:'MAQUINADO',months:Array(12).fill(null)};PREV.months[11]=M({partes:[{st:14,prod:10000}],horasTrab:4000});
const sq=ecSeries(MAQ,PREV);near(sq.months[0].dEfic,q0.efic-(10000*14/60)/4000);
// Caso 6: año = suma de horas, nunca mezcla con el año anterior
const y=ecYear(S[1].months);near(y.efic,(q0.req+S[1].months[1].req)/(9200+9900));
console.log('OK: Eficiencia compuesta, 6 casos pasan');
const f=x=>(x*100).toFixed(1)+'%';
console.log('ENS+MH abr',f(e0.efic),f(e0.eficSA),'vol',e0.vol.toFixed(3),'| may',f(e1.efic),f(e1.eficSA),'Δ',(e1.dEfic*100).toFixed(1),'pts vol',(e1.dVol*100).toFixed(1)+'%');
const q1=S[1].months[1];console.log('MAQ abr',f(q0.efic),f(q0.eficSA),'vol',q0.vol.toFixed(3),'| may',f(q1.efic),f(q1.eficSA),'Δ',(q1.dEfic*100).toFixed(1),'pts vol',(q1.dVol*100).toFixed(1)+'%');
console.log('PLANTA abr',f(P[0].efic),f(P[0].eficSA),'promedio simple sería',f((e0.efic+q0.efic)/2),'| may',f(P[1].efic),f(P[1].eficSA));
console.log('horas abr: req',(e0.req+q0.req).toFixed(1),'trab',30000+9200,'afect',e0.afect+q0.afect);
