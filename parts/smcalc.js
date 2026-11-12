// ===== SMED · cambio de modelo (método público de Shingo) =====
const SM_CATS=['Preparación','Búsqueda y traslado','Montaje y desmontaje','Ajustes y pruebas','Limpieza','Espera','Otro'];
// Sugerencia de clasificación por categoría: lo que se prepara o se trae puede hacerse con la máquina corriendo;
// la espera no agrega valor; el resto necesita la máquina parada. El analista decide.
const SM_SUG={'Preparación':'E','Búsqueda y traslado':'E','Espera':'X'};
const smSug=cat=>SM_SUG[cat]||'I';
const smCls=s=>s.cls||smSug(s.cat);
// Tiempo propuesto del paso: el mejorado si se escribió, si no el actual; eliminado = 0
function smNew(s){if(smCls(s)==='X')return 0;const tn=String(s.tn??'').trim();return tn===''?num(s.t):num(tn);}
function smCalc(steps,o){o=o||{};
  const actual=steps.reduce((a,s)=>a+num(s.t),0);
  let I=0,E=0,X=0,Iact=0,Eact=0;steps.forEach(s=>{const c=smCls(s);if(c==='I'){I+=smNew(s);Iact+=num(s.t);}else if(c==='E'){E+=smNew(s);Eact+=num(s.t);}else X+=num(s.t);});
  const prop=I,red=actual-prop;const byCat=SM_CATS.map(c=>({cat:c,t:steps.filter(s=>(s.cat||'Otro')===c).reduce((a,s)=>a+num(s.t),0)})).filter(x=>x.t>0).sort((a,b)=>b.t-a.t);
  const To=num(o.tcobj),cpw=num(o.cpw),wm=num(o.wm)||4;
  const proj=perCambio=>{const week=perCambio*cpw,month=week*wm;return {cambio:perCambio,week,month,year:month*12};};
  return {actual,prop,red,pct:actual?red/actual:0,I,E,X,Iact,Eact,byCat,
    // externo: se hace antes o después del cambio con la máquina corriendo (no es paro)
    pzActual:To?actual/To:0,pzRec:To?red/To:0,hrs:cpw?proj(red/60):null,pz:cpw&&To?proj(red/To):null,meta:prop<10};
}
