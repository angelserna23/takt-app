// Pruebas de la Hoja de trabajo estándar: lee las funciones puras directo de index.html (bloque <hs-pure>).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <hs-pure>[^\n]*\n([\s\S]*?)\/\/ <\/hs-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <hs-pure> en index.html');process.exit(1);}
const {hsNum,hsCalc,HS_SYMS}=new Function(m[1]+';return {hsNum,hsCalc,HS_SYMS};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};
const near=(a,b,e=1e-6)=>Math.abs(a-b)<e;
const P=(sym,t,kp)=>({sym,t:String(t),kp:(kp||[]).map(([tipo,txt])=>({tipo,txt}))});

// 1. Ejemplo de la app: inserción de balero, 8 pasos, Σ 1.12 min; takt 1.20
const d={takt:'1.2',pasos:[P('tra',0.06),P('op',0.15,[['cal','MUESCA']]),P('op',0.32,[['seg','BIMANUAL']]),P('dem',0.10),
  P('insp',0.18,[['cal','PASA / NO PASA']]),P('op',0.17,[['erg','AMBAS MANOS']]),P('tra',0.08),P('alm',0.06)]};
const r=hsCalc(d);
ok(near(r.tc,1.12),'TC 1.12: '+r.tc);
ok(near(r.pct,1.12/1.2)&&near(r.holg,0.08)&&!r.over,'93.3 % del takt, holgura 0.08');
ok(r.n===8,'8 pasos');
// 2. Resumen ASME por símbolo
ok(r.res.op.n===3&&near(r.res.op.t,0.64),'operación: 3 pasos, 0.64 min');
ok(r.res.insp.n===1&&near(r.res.insp.t,0.18),'inspección: 1, 0.18');
ok(r.res.tra.n===2&&near(r.res.tra.t,0.14),'transporte: 2, 0.14');
ok(r.res.dem.n===1&&near(r.res.dem.t,0.10),'demora: 1, 0.10');
ok(r.res.alm.n===1&&near(r.res.alm.t,0.06),'almacén: 1, 0.06');
ok(HS_SYMS.reduce((a,s)=>a+r.res[s].n,0)===r.n,'el resumen suma todos los pasos');
// 3. Puntos clave por tipo (los vacíos no cuentan)
ok(r.kp.seg===1&&r.kp.cal===2&&r.kp.erg===1,'puntos clave: 1 seguridad, 2 calidad, 1 ergonomía');
ok(hsCalc({pasos:[P('op',1,[['seg','  '],['cal','X']])]}).kp.seg===0,'punto clave vacío no cuenta');
// 4. Sobre takt
const o=hsCalc({takt:'1',pasos:[P('op',0.7),P('op','0,45')]});
ok(near(o.tc,1.15)&&o.over&&near(o.holg,-0.15),'coma decimal y TC sobre takt (1.15 > 1)');
// 5. Takt vacío: sin división entre cero
const z=hsCalc({takt:'',pasos:[P('op',0.5)]});
ok(z.pct===0&&z.holg===0&&z.over===false,'sin takt: pct 0, sin exceso');
// 6. Tiempos vacíos o con texto valen 0; símbolo desconocido cuenta como operación
const e=hsCalc({takt:'1',pasos:[P('op',''),P('xx','abc'),P('insp','0.2')]});
ok(near(e.tc,0.2)&&e.res.op.n===2,'vacíos = 0; símbolo desconocido = operación');
// 7. Sin pasos
const v=hsCalc({takt:'1.2'});ok(v.tc===0&&v.n===0&&!v.over,'hoja sin pasos');

if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: Hoja estándar, '+n+' casos');
