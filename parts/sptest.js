// Pruebas del Diagrama de espagueti: lee las funciones puras directo de index.html (bloque <sp-pure>).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <sp-pure>[^\n]*\n([\s\S]*?)\/\/ <\/sp-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <sp-pure> en index.html');process.exit(1);}
const {spNum,spLeg,spCalc}=new Function(m[1]+';return {spNum,spLeg,spCalc};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};
const near=(a,b,e=1e-6)=>Math.abs(a-b)<e;

// Ejemplo de la app: 6 puntos, recorrido de 11 toques (10 viajes), 1 m por cuadro
const pts=[{id:1,n:'ALMACÉN',x:2,y:2},{id:2,n:'EST 10',x:8,y:6},{id:3,n:'EST 20',x:14,y:6},{id:4,n:'RACK A',x:20,y:2},{id:5,n:'INSPECCIÓN',x:14,y:11},{id:6,n:'EMPAQUE',x:20,y:11}];
const d={pts,ruta:[1,2,3,4,3,5,6,4,3,2,1],escala:'1',modo:'esc',ciclos:'50',turnos:'2',vel:'60'};
const r=spCalc(d);
// 1. En escuadra: 10+6+10+10+5+6+9+10+6+10 = 82 m
ok(near(r.total,82),'82 m por ciclo: '+r.total);
ok(r.viajes===10,'10 viajes');
ok(r.legs.map(l=>l.d).join()=='10,6,10,10,5,6,9,10,6,10','distancia de cada trayecto');
// 2. Trayecto más repetido: EST 20 ↔ RACK A, 3 veces, 30 m (sin importar el sentido)
ok(r.top&&r.top.a===3&&r.top.b===4&&r.top.n===3&&near(r.top.t,30),'trayecto más repetido EST 20 ↔ RACK A ×3 = 30 m');
ok(r.pairs.length===6,'6 trayectos distintos');
// 3. Punto más visitado: EST 20, 3 veces
ok(r.topPt===3&&r.visits[3]===3&&r.visits[1]===2,'EST 20 es el más visitado (3)');
// 4. Turno y día: 82 × 50 = 4,100 m; × 2 = 8,200 m
ok(near(r.porTurno,4100)&&near(r.porDia,8200),'4,100 m por turno y 8,200 m por día');
// 5. Tiempo caminando a 60 m/min: 1.3667 min por ciclo; 68.33 min por turno
ok(near(r.tCiclo,82/60)&&near(r.tTurno,4100/60),'tiempo caminando 1.37 min/ciclo, 68.3 min/turno');
// 6. Escala: 1.5 m por cuadro → 123 m; coma decimal
ok(near(spCalc(Object.assign({},d,{escala:'1,5'})).total,123),'escala 1,5 m por cuadro = 123 m');
// 7. En línea recta: ALMACÉN → EST 10 = √(6²+4²) = 7.2111
ok(near(spLeg(pts[0],pts[1],'rec'),Math.sqrt(52))&&spLeg(pts[0],pts[1],'esc')===10,'línea recta vs escuadra');
const rr=spCalc(Object.assign({},d,{modo:'rec'}));ok(rr.total<r.total&&rr.total>60,'en línea recta da menos metros: '+rr.total.toFixed(2));
// 8. Toques repetidos al mismo punto no cuentan como viaje; puntos borrados se ignoran
const z=spCalc({pts,ruta:[1,1,2,2,99,3],escala:'1',modo:'esc'});
ok(z.viajes===2&&near(z.total,16),'toque repetido y punto inexistente no cuentan');
// 9. Sin recorrido / sin datos opcionales
const v=spCalc({pts,ruta:[1],escala:'1'});ok(v.total===0&&v.viajes===0&&v.top===null&&v.topPt===null,'sin recorrido todo en 0');
const o=spCalc(Object.assign({},d,{ciclos:'',turnos:'',vel:''}));ok(o.porTurno===0&&o.porDia===0&&o.tCiclo===0,'opcionales vacíos = sin turno ni tiempo');
const t=spCalc(Object.assign({},d,{turnos:''}));ok(near(t.porTurno,4100)&&t.porDia===0,'sin turnos: solo por turno');
// 10. Empate en repeticiones: gana el de más metros
const e=spCalc({pts,ruta:[1,2,1,3,1],escala:'1',modo:'esc'});ok(e.top.a===1&&e.top.b===3&&e.top.n===2,'empate: gana el trayecto más largo');

if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: Espagueti, '+n+' casos');
