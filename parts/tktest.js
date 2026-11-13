// Pruebas de Takt y balanceo: lee las funciones puras directo de index.html (bloque <tk-pure>), sin copias que se desfasen.
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <tk-pure>[^\n]*\n([\s\S]*?)\/\/ <\/tk-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <tk-pure> en index.html');process.exit(1);}
const {tkNum,tkDem,tkDisp,tkTakt,tkCalc,tkBefore}=new Function(m[1]+';return {tkNum,tkDem,tkDisp,tkTakt,tkCalc,tkBefore};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};
const near=(a,b,e=1e-6)=>Math.abs(a-b)<e;

// 1. Takt: 2 turnos × (480 − 40) = 880 min; 880 ÷ 800 = 1.10
const d={demanda:'800',turnos:'2',minTurno:'480',paros:'40'};
ok(tkDisp(d)===880,'disponible 880 min');
ok(near(tkTakt(d),1.1),'takt 1.10');
// 2. Demanda con coma de miles; tiempos con coma decimal
ok(tkDem('1,200')===1200,'1,200 piezas = 1200');
ok(tkNum('1,5')===1.5,'1,5 min = 1.5');
ok(near(tkTakt({demanda:'1,200',turnos:'3',minTurno:'480',paros:'60'}),1260/1200),'takt con coma de miles');
// 3. Sin demanda o con paros mayores al turno: takt 0 / disponible 0 (nunca negativo)
ok(tkTakt({demanda:'',turnos:'2',minTurno:'480'})===0,'sin demanda → takt 0');
ok(tkDisp({turnos:'2',minTurno:'30',paros:'40'})===0,'paros > turno → disponible 0');

// 4. Ejemplo de la app (4 estaciones, Σ 4.04): EST 20 = 1.24 excede el takt
const ST=[{id:1,nombre:'EST 10'},{id:2,nombre:'EST 20'},{id:3,nombre:'EST 30'},{id:4,nombre:'EST 40'}];
const E=[];let k=100;const add=(s,t,name)=>E.push({id:++k,name,t:String(t),st:s,st0:s});
[0.12,0.20,0.35,0.25].forEach(t=>add(1,t));[0.10,0.42,0.30].forEach(t=>add(2,t));add(2,0.18,'ATORNILLAR');add(2,0.24);
[0.08,0.27,0.34,0.16].forEach(t=>add(3,t));[0.45,0.20,0.38].forEach(t=>add(4,t));
const o={takt:tkTakt(d),disp:tkDisp(d),dem:800};
const a=tkCalc(ST,E,o);
ok(near(a.total,4.04),'Σ TC 4.04');
ok(a.bott.nombre==='EST 20'&&near(a.max,1.24),'cuello de botella EST 20 = 1.24');
ok(a.over===1&&a.rows[1].over&&!a.rows[3].over,'solo EST 20 sobre takt (EST 40 = 1.03 no)');
ok(near(a.eff,4.04/(4*1.24)),'eficiencia 81.45 %: '+a.eff);
ok(near(a.cap,60/1.24),'capacidad 48.39 pzs/h');
ok(near(a.capDia,880/1.24)&&!a.cumple,'709.7 pzs/día: no cumple 800');
ok(near(a.personal,4.04/1.1)&&a.minEst===4,'personal teórico 3.67 → 4 estaciones');
ok(near(a.rows[1].pct,1.24/1.1),'% del takt de EST 20');

// 5. Mover ATORNILLAR (0.18) a EST 30: 1.06 y 1.03 → nadie sobre takt, 95.28 %, 830 pzs/día
const at=E.find(e=>e.name==='ATORNILLAR');at.st=3;
const b=tkCalc(ST,E,o);
ok(near(b.rows[1].tc,1.06)&&near(b.rows[2].tc,1.03),'EST 20 = 1.06, EST 30 = 1.03');
ok(b.over===0&&b.bott.nombre==='EST 20','sin estaciones sobre takt; cuello EST 20');
ok(near(b.eff,4.04/(4*1.06)),'eficiencia 95.28 %: '+b.eff);
ok(near(b.capDia,880/1.06)&&b.cumple,'830 pzs/día: cumple');
// 6. «Como se trajo» (st0) no cambia al simular
const a2=tkCalc(ST,E,Object.assign({key:'st0'},o));
ok(near(a2.max,1.24)&&near(a2.eff,a.eff),'el cálculo con st0 conserva el antes');

// 7. Estación vacía agregada para simular: cuenta en el después, no en el antes
const ST2=ST.concat([{id:5,nombre:'EST NUEVA 1',nueva:true}]);
ok(tkBefore(ST2).length===4,'tkBefore excluye las estaciones nuevas');
const c=tkCalc(ST2,E,o);ok(c.n===5&&near(c.eff,4.04/(5*1.06)),'la estación vacía baja la eficiencia (5 estaciones)');
// 8. Sin elementos: sin cuello de botella ni divisiones entre cero
const z=tkCalc(ST,[],o);ok(z.bott===null&&z.eff===0&&z.cap===0&&z.over===0,'sin elementos todo en 0');
// 9. Celdas vacías o con texto valen 0
ok(tkCalc([{id:1}],[{t:'',st:1},{t:'abc',st:1},{t:'0.5',st:1}],{takt:1}).rows[0].tc===0.5,'celdas vacías = 0');

if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: Takt y balanceo, '+n+' casos');
