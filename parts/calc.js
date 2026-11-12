// ---- Cálculo Work Sampling (función pura, probada aparte) ----
function calcWS(ops,acts,counts){
  const one=(cnt)=>{
    const sum=acts.reduce((a,x)=>a+(cnt[x.id]||0),0);
    const pct={};acts.forEach(x=>pct[x.id]=sum?(cnt[x.id]||0)/sum:0);
    const innec=acts.filter(x=>!x.nec).reduce((a,x)=>a+pct[x.id],0);
    return {sum,pct,innec:sum?innec:0,nec:sum?1-innec:0};
  };
  const rows=ops.map(o=>Object.assign({id:o.id,name:o.name},one(counts[o.id]||{})));
  const pooled={};acts.forEach(x=>pooled[x.id]=ops.reduce((a,o)=>a+((counts[o.id]||{})[x.id]||0),0));
  return {rows,total:Object.assign({id:'total',name:'Total línea'},one(pooled))};
}
// Un operador: sus propias actividades y conteos
function calcOp(op){return calcWS([op],op.acts,{[op.id]:op.counts||{}}).rows[0];}
// General de línea: une actividades por nombre y suma conteos de todos los operadores
function calcLine(ops){
  const key=n=>String(n).trim().toLowerCase();const map=new Map();
  ops.forEach(o=>o.acts.forEach(a=>{const k=key(a.name);if(!map.has(k))map.set(k,{id:'u'+map.size,name:String(a.name).trim(),nec:a.nec});}));
  const acts=[...map.values()];const counts={};
  ops.forEach(o=>{const c={};o.acts.forEach(a=>{const u=map.get(key(a.name));c[u.id]=(c[u.id]||0)+((o.counts||{})[a.id]||0);});counts[o.id]=c;});
  return Object.assign({acts},calcWS(ops.map(o=>({id:o.id,name:o.name})),acts,counts));
}
// Precisión del muestreo: margen e = Z·√(p(1−p)/n); n requerida = Z²·p(1−p)/e²
// Si p es 0 o 1 se usa p = 0.5 (caso más conservador) para no reportar margen 0.
const ZTAB={'90':1.645,'95':1.96,'99':2.576};
function precisionWS(p,n,conf,target){
  const z=ZTAB[conf]||1.96;const pp=(p<=0||p>=1)?0.5:p;
  const e=n?z*Math.sqrt(pp*(1-pp)/n):null;
  const req=Math.ceil(z*z*pp*(1-pp)/(target*target));
  return {e,req,falta:Math.max(0,req-n),ok:n>=req};
}
