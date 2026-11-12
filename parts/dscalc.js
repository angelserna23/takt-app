function num(v){const x=parseFloat(String(v??'').replace(',','.'));return isNaN(x)?0:x;}
// ---- Cálculo Delay Study (funciones puras, probadas aparte) ----
// Minutos por pieza de una actividad. Si no lleva piezas (regreso vacío) y está ligada
// a un traslado, su tiempo se divide entre las piezas de ese traslado.
// Actividad sin piezas (racks × SNP = 0) = vuelta vacía: no trajo nada, pero su tiempo SÍ cuenta.
// Se suma automáticamente al traslado con piezas más cercano hacia atrás (si no hay, al siguiente).
const dsPz=a=>num(a.racks)*num(a.snp);
function dsOwner(a,acts){
  if(dsPz(a)>0)return a;
  if(a.linkTo!=null){const t=acts.find(x=>x.id===a.linkTo);if(t&&dsPz(t)>0)return t;}
  const seq=acts.filter(x=>x.cap===a.cap);const i=seq.indexOf(a);   // solo dentro del mismo operador cronometrado
  for(let k=i-1;k>=0;k--)if(dsPz(seq[k])>0)return seq[k];
  for(let k=i+1;k<seq.length;k++)if(dsPz(seq[k])>0)return seq[k];
  return null;
}
function dsPerPiece(a,acts){const o=dsOwner(a,acts);return o?(a.secs/60)/dsPz(o):0;}
function dsUnlinked(a,acts){return dsPz(a)<=0&&!dsOwner(a,acts||[a]);}
// Carga, ocupación y tiempo libre por operador. obj = objetivo estándar (piezas por periodo);
// cada operador puede tener su propio objetivo (op.obj). disp = minutos del periodo.
const dsObj=(op,obj)=>(op.obj!==undefined&&op.obj!==null&&String(op.obj).trim()!=='')?num(op.obj):num(obj);
// Escenario: número (factor) o {add: piezas extra por operador, pct: % de aumento}.
// Objetivo del escenario = (objetivo + piezas extra) × (1 + %/100), nunca menor que 0.
function dsScenObj(o,scen){
  if(typeof scen==='number')return o*scen;
  const add=num(scen&&scen.add),pct=num(scen&&scen.pct);
  return Math.max(0,(o+add)*(1+pct/100));
}
function dsCalc(acts,ops,assign,obj,disp,scen){
  const D=num(disp);
  const rows=ops.map(op=>{const o=dsScenObj(dsObj(op,obj),scen==null?1:scen);
    const items=acts.filter(a=>assign[a.id]===op.id).map(a=>{const pp=dsPerPiece(a,acts);return {id:a.id,pp,load:pp*o};});
    const load=items.reduce((s,x)=>s+x.load,0);
    return {id:op.id,name:op.name,obj:o,items,load,occ:D?load/D:0,free:D-load};
  });
  const total=rows.reduce((s,r)=>s+r.load,0);
  return {rows,total,disp:D,needed:D?total/D:0,avgOcc:rows.length&&D?total/(rows.length*D):0};
}
// ---- Work Element ----
// Promedio de los ciclos capturados de un elemento (minutos). Las celdas vacías no cuentan (como AVERAGE de Excel); un 0 escrito sí.
function weAvg(times){const v=(times||[]).filter(t=>t!==''&&t!=null&&!isNaN(parseFloat(String(t).replace(',','.')))).map(num);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0;}
// Ciclos completos: aquellos en los que TODOS los elementos tienen tiempo
function weComplete(els,n){let k=0;for(let c=0;c<n;c++){if(els.length&&els.every(e=>{const t=(e.times||[])[c];return t!==''&&t!=null;}))k++;}return k;}
