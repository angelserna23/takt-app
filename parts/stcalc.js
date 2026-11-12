// ---- Speed Trial (funciones puras) ----
// recs: [{t: minutos de la pieza, cause: '1'..'14' o ''}]; tcobj: TC objetivo (min); paro: paro programado (min)
const ST_CAUSES=['Falla de máquina','Paro corto','Cambio de modelo','Cambio de herramienta','Inspección y medición','Ajuste','Preparación de arranque y paro','Otros','Falta de material por proceso anterior','Falta de material por proceso siguiente','Inactividad','Pérdida de tiempo ciclo','Defectivo propio de proceso','Defectivo por proceso anterior'];
const stIsDef=c=>c==='13'||c==='14';
function stCalc(recs,tcobj,paro){
  const To=num(tcobj);const P=num(paro);
  const R=recs.filter(r=>num(r.t)>0);const N=R.length;
  const T=R.reduce((s,r)=>s+num(r.t),0);
  const def=R.filter(r=>stIsDef(r.cause)).length;const ok=N-def;
  const loss={};for(let i=1;i<=14;i++)loss[String(i)]=0;let gain=0;
  R.forEach(r=>{const t=num(r.t);
    if(stIsDef(r.cause)){loss[r.cause]+=t;return;}       // pieza defectiva: todo su tiempo es pérdida de calidad
    const e=t-To;
    if(e<0){gain+=e;return;}                              // más rápida que el objetivo: renglón aparte
    loss[r.cause||'12']+=e;                               // exceso a su causa; sin causa = pérdida de tiempo ciclo
  });
  const va=To*ok;
  const ts=R.map(r=>num(r.t));
  return {N,T,ok,def,va,loss,gain,paro:P,
    tcReal:N?T/N:0,max:N?Math.max(...ts):0,min:N?Math.min(...ts):0,
    oee:T?va/T:0,jphReal:T?ok/(T/60):0,jphObj:To?60/To:0,jph85:To?60/To*0.85:0,
    periodo:T+P};
}
// Costo por incumplimiento de JPH (proyección)
// JPH plan = (60 / TC plan) × OEE plan; GAP = JPH plan − JPH real; costo/hora = GAP × costo unitario
// Proyección: día = hora × horas por día; semana = día × días; mes = semana × semanas; año = mes × 12
// JPH plan siempre automático: (60 / TC plan) × OEE plan
function stJphSug(tcobj,oeePlan){const To=num(tcobj);return To?60/To*num(oeePlan)/100:0;}
function stCost(jphReal,tcobj,oeePlan,costo,hd,dw,wm){
  const c=costo;
  const jphPlan=stJphSug(tcobj,oeePlan);const gap=jphPlan-jphReal;
  const hour=gap*c,day=hour*num(hd),week=day*num(dw),month=week*num(wm),year=month*12;
  return {jphPlan,jphReal,gap,hour,day,week,month,year,valorHora:jphReal*c,months:Array.from({length:12},(_,i)=>month*(i+1))};
}
// Árbol de pérdidas del OEE (cascada): disponible → laborable → trabajado → neto (NG+OK) → piezas OK
const ST_AV=['1','2','3','4','5','6','7','8','9','10'],ST_SP=['11','12'],ST_Q=['13','14'];
function stOEE(r){
  const sum=ks=>ks.reduce((s,k)=>s+(r.loss[k]||0),0);
  const avail=sum(ST_AV),speed=sum(ST_SP)+r.gain,qual=sum(ST_Q);
  const disp=r.T+r.paro,lab=r.T,trab=lab-avail,neto=trab-speed,ok=neto-qual;
  const A=lab?trab/lab:0,P=trab?neto/trab:0,Q=neto?ok/neto:0;
  return {disp,lab,trab,neto,ok,paro:r.paro,avail,speed,qual,A,P,Q,oee:A*P*Q,speedLoss:trab?speed/trab:0};
}
// Estadísticas de la línea (IE)
function stLineStats(r,tcobj,oeePlan){
  const To=num(tcobj);const lossMin=Object.values(r.loss).reduce((a,b)=>a+b,0);   // minutos de anomalías (1 a 14)
  const h=r.T/60;const promWA=r.N?(r.T-lossMin)/r.N:0;const lostPz=To?lossMin/To:0;
  return {jph100:To?60/To:0,jphPlan:stJphSug(tcobj,oeePlan),
    jphMax:r.min?60/r.min:0,jphMin:r.max?60/r.max:0,           // pieza más rápida -> JPH máximo; más lenta -> mínimo
    jphReal:r.jphReal,jphTT:r.tcReal?60/r.tcReal:0,jphWOA:promWA>0?60/promWA:0,
    lossMin,lostPz,jphLost:h?lostPz/h:0,possible:To?r.T/To:0,promWA,promTT:r.tcReal};
}
// Pareto de afectaciones (por tiempo). Solo cuentan piezas que excedieron el TC objetivo (o defectivas).
// Agrupa por problema del catálogo; con causa pero sin problema -> por causa; sin causa -> CAÍDA DE VELOCIDAD.
// Si hay más de 10 grupos: top 9 + "OTROS" (residuo).
function stPareto(recs,tcobj,probs){
  const To=num(tcobj);const g=new Map();
  recs.forEach(r=>{const t=num(r.t);if(!(t>0))return;const def=stIsDef(r.cause);const m=def?t:t-To;if(!(m>0))return;
    let key,label,m6='';
    const p=r.probId!=null?(probs||[]).find(x=>x.id===r.probId):null;
    if(p){key='p'+p.id;label=(p.est?'EST '+p.est+' · ':'')+p.desc;m6=p.m6||'';}
    else if(r.cause){key='c'+r.cause;label=r.cause+'. '+ST_CAUSES[+r.cause-1].toUpperCase()+' · SIN PROBLEMA ASIGNADO';}
    else{key='speed';label='CAÍDA DE VELOCIDAD';}
    const it=g.get(key)||{key,label,m6,rep:0,min:0};it.rep++;it.min+=m;g.set(key,it);});
  let items=[...g.values()].sort((a,b)=>b.min-a.min||b.rep-a.rep);
  if(items.length>10){const rest=items.slice(9);items=items.slice(0,9).concat([{key:'otros',label:'OTROS',m6:'',rep:rest.reduce((s,x)=>s+x.rep,0),min:rest.reduce((s,x)=>s+x.min,0),otros:rest.length}]);}
  const tot=items.reduce((s,x)=>s+x.min,0);let acc=0;
  items.forEach((x,i)=>{x.pos=i+1;x.pct=tot?x.min/tot:0;acc+=x.pct;x.acc=acc;x.lostPz=To?x.min/To:0;});
  return {items,total:tot,lostPz:To?tot/To:0};
}
// Caída de JPH (cascada): JPH 100 % − pérdidas del Pareto + ganancia = JPH real
// puntos de JPH = (minutos ÷ TC objetivo) ÷ horas registradas
function stCascade(recs,tcobj,probs){
  const To=num(tcobj);const r=stCalc(recs,tcobj,0);const H=r.T/60;
  if(!To||!(H>0))return null;
  const P=stPareto(recs,tcobj,probs);const k=m=>m/To/H;
  const steps=P.items.map(x=>({pos:x.pos,key:x.key,label:x.label,min:x.min,pz:x.lostPz,jph:-k(x.min)}));
  const gainMin=-r.gain;const gain={min:gainMin,pz:gainMin/To,jph:k(gainMin)};
  const start=60/To;const end=start+steps.reduce((s,x)=>s+x.jph,0)+gain.jph;
  return {start,steps,gain,end,jphReal:r.jphReal,H};
}
