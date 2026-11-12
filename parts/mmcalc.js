// ===== MAN MACHINE CHART · cálculos del llenado =====
// Estación: {id,name,kind:'maq'|'ent'|'sal',n,tcs:[TC de cada máquina igual],tcplan,cd,man:[{t,dur}],pasos,ov:{}}
const mmIsMaq=s=>s.kind==='maq';
function mmTcAvg(s){const v=(s.tcs||[]).map(num).filter(x=>x>0);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0;}
// Gemelas/trillizas: promedio de las máquinas iguales ÷ cantidad (una sola vuelta del operador)
function mmTcEff(s){if(!mmIsMaq(s))return 0;if(s.ov&&s.ov.tc!=null&&s.ov.tc!=='')return num(s.ov.tc);const n=Math.max(1,+s.n||1);return mmTcAvg(s)/n;}
// Operación manual = carga+descarga + actividades fuera del ciclo de la máquina
function mmMan(s){if(s.ov&&s.ov.man!=null&&s.ov.man!=='')return num(s.ov.man);return num(s.cd)+(s.man||[]).filter(a=>!a.dur).reduce((a,b)=>a+num(b.t),0);}
// Operación manual durante el TC de la máquina
function mmDur(s){if(s.ov&&s.ov.dur!=null&&s.ov.dur!=='')return num(s.ov.dur);return (s.man||[]).filter(a=>a.dur).reduce((a,b)=>a+num(b.t),0);}
function mmPasos(s){if(s.ov&&s.ov.pasos!=null&&s.ov.pasos!=='')return Math.max(0,Math.round(num(s.ov.pasos)));return Math.max(0,Math.round(num(s.pasos)));}
function mmGap(s){const p=num(s.tcplan),r=mmTcAvg(s);return mmIsMaq(s)&&p>0&&r>0?p-r:null;}
// Recorrido: se conserva el orden en que camina el operador, pero arranca en la máquina con el TC efectivo más alto
function mmRoute(sts){if(!sts.length)return [];let k=-1,mx=-1;sts.forEach((s,i)=>{const t=mmTcEff(s);if(mmIsMaq(s)&&t>mx){mx=t;k=i;}});if(k<0)k=0;return sts.slice(k).concat(sts.slice(0,k));}
function mmTable(sts,mpp){const rows=mmRoute(sts).map((s,i)=>({proc:i+1,s,name:s.name,n:mmIsMaq(s)?Math.max(1,+s.n||1):1,piezas:1,man:mmMan(s),dur:mmDur(s),pasos:mmPasos(s),tc:mmTcEff(s),tcAvg:mmTcAvg(s),gap:mmGap(s)}));
  const pasos=rows.reduce((a,r)=>a+r.pasos,0);
  return {rows,man:rows.reduce((a,r)=>a+r.man,0),dur:rows.reduce((a,r)=>a+r.dur,0),pasos,metros:pasos*num(mpp),tcMax:Math.max(0,...rows.map(r=>r.tc))};}
// Acomodo automático del layout en U: la mitad arriba (derecha → izquierda) y la otra abajo (izquierda → derecha)
function mmAutoLayout(ids){const n=ids.length,top=Math.ceil(n/2),cols=Math.max(top,n-top,1);const pos={};
  ids.forEach((id,i)=>{pos[id]=i<top?[0,cols-1-i]:[1,i-top];});return {rows:2,cols,pos};}
// Agregar estación desde el layout: se inserta en la vuelta entre las dos estaciones donde menos alarga el recorrido
// (inserción más barata, distancia en línea recta entre casillas). Devuelve el índice de la lista donde va.
function mmInsertAt(sts,pos,cell){const n=sts.length;if(n<2)return n;const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);let best=n,bc=Infinity;
  for(let i=0;i<n;i++){const a=pos[sts[i].id],b=pos[sts[(i+1)%n].id];if(!a||!b)continue;const c=dist(a,cell)+dist(cell,b)-dist(a,b);if(c<bc-1e-9){bc=c;best=i+1;}}return best;}
// Mover una estación en el layout: sale de su lugar en la vuelta y entra donde quedó físicamente
function mmMoveTo(sts,pos,id,cell){const s=sts.find(x=>x.id===id);const rest=sts.filter(x=>x!==s);const p=Object.assign({},pos);p[id]=cell;const j=mmInsertAt(rest,p,cell);rest.splice(j,0,s);return {sts:rest,pos:p};}
// Intercambiar dos estaciones: cambian de lugar en el dibujo y también en la vuelta
function mmSwap(sts,pos,a,b){const p=Object.assign({},pos);[p[a],p[b]]=[p[b],p[a]];const out=sts.slice();const i=out.findIndex(x=>x.id===a),j=out.findIndex(x=>x.id===b);[out[i],out[j]]=[out[j],out[i]];return {sts:out,pos:p};}
// ===== Gráfica hombre-máquina (misma lógica que el VBA de Angel + espera y ocio) =====
const MM_MIN_PASO=0.01;   // estándar: cada paso = 0.01 min (0.6 s), igual que el VBA
// rows: renglones de mmTable (ya arrancan en la máquina con TC más alto)
function mmChart(rows){
  let x=0;const R=[];
  rows.forEach((r,k)=>{const walk=k?rows[k-1].pasos*MM_MIN_PASO:0;const w0=x;x+=walk;const a=x;x+=r.man;const ld=x;x+=r.dur;
    const maq=r.tc>0;R.push({k,name:r.name,walkFrom:w0,arr:a,fin:ld,durEnd:x,maq,tc:r.tc,mEnd:maq?ld+r.tc:null,need:maq?r.man+r.tc:0,dur:r.dur,man:r.man,durOver:maq&&r.dur>r.tc+1e-9});});
  const back=rows.length?rows[rows.length-1].pasos*MM_MIN_PASO:0;const top=x+back;
  const walkT=rows.reduce((s,r)=>s+r.pasos*MM_MIN_PASO,0),manT=rows.reduce((s,r)=>s+r.man,0),durT=rows.reduce((s,r)=>s+r.dur,0);
  let lim=null;R.forEach(r=>{if(r.maq&&(!lim||r.need>lim.need))lim=r;});
  const C=Math.max(top,lim?lim.need:0);const machineLimits=!!lim&&lim.need>top+1e-9;
  R.forEach(r=>{r.idle=r.maq?C-r.need:0;r.util=r.maq&&C?r.need/C:0;r.next=r.arr+C;});
  return {rows:R,back,backFrom:x,top,C,lim:machineLimits?lim:null,wait:C-top,occ:C?top/C:0,jph:C?60/C:0,walkT,manT,durT,
    xmax:Math.max(top,...R.map(r=>r.mEnd||0))};
}
// ===== KPIs del Man Machine (sin dinero: piezas y tiempos) =====
// JPH plan = (60 ÷ TC objetivo) × OEE plan, igual que en el Speed Trial
function mmKpis(G,rows,o){const To=num(o.tcobj);const hd=num(o.hd)||0,dw=num(o.dw)||0,wm=num(o.wm)||0;const oee=(o.oeePlan===''||o.oeePlan==null?85:num(o.oeePlan))/100;
  const proj=perH=>{const day=perH*hd,week=day*dw,month=week*wm;return {hour:perH,day,week,month,year:month*12};};
  const jph100=To?60/To:0,jphPlan=jph100*oee,jphReal=G.jph,gap=To?jphPlan-jphReal:0;
  // espera del operador = horas-hombre sin trabajo (no son piezas: la celda la limita la máquina)
  const waitFrac=G.C?G.wait/G.C:0;
  const maqs=rows.filter(r=>r.tc>0).map(r=>({name:r.name,tc:r.tc,occ:To?r.tc/To:0}));
  const avg=maqs.length?maqs.reduce((s,m)=>s+m.tc,0)/maqs.length:0;
  return {To,oee,jph100,jphPlan,jphReal,gap,pz:proj(gap),waitFrac,hh:proj(waitFrac),maqs,tcAvg:avg,occAvg:To&&maqs.length?avg/To:0,over:maqs.filter(m=>m.occ>1+1e-9)};}
