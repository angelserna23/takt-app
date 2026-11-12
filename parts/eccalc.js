// ===== EFICIENCIA COMPUESTA · vista general de planta (sin captura) =====
// Lee los Actual Time de un año fiscal. Ensamble + manejo de materiales = una sola área; maquinado y fundición, cada uno aparte.
// Sin reparto de áreas sin producción y sin genba. Inventario y pre-arranque se capturan en afectaciones «otros» del Actual Time.
// Requiere atcalc.js.
function ecArea(st,m){const mo=st.months[m];if(!mo)return null;const a=atMonth(mo);if(!a.prod)return null;
  let req=a.horasReq,trab=a.trab,afect=a.afect;
  if(st.tipo==='ENSAMBLE'&&st.mh){const b=atMH(mo);req+=b.horasReq;trab+=b.trab;afect+=b.afect;}
  return {req,trab,afect,prod:a.prod,efic:trab?req/trab:0,eficSA:trab-afect>0?req/(trab-afect):0,vol:trab?a.prod/trab:0};}
// prev = Actual Time del año fiscal anterior (misma área) para comparar abril contra marzo pasado
function ecSeries(st,prev){const s=PC_MONTHS.map((_,m)=>ecArea(st,m));const base=prev?ecArea(prev,11):null;
  s.forEach((x,m)=>{if(!x)return;let p=null;for(let i=m-1;i>=0;i--)if(s[i]){p=s[i];break;}if(!p&&m===0)p=base;
    x.dEfic=p?x.efic-p.efic:null;x.dEficSA=p?x.eficSA-p.eficSA:null;x.dVol=p&&p.vol?x.vol/p.vol-1:null;});
  return {months:s,base};}
// planta: suma de horas de todas las áreas (ponderado), no promedio de porcentajes
function ecPlant(list){return PC_MONTHS.map((_,m)=>{let req=0,trab=0,afect=0,n=0;
  list.forEach(L=>{const x=L.months[m];if(x){req+=x.req;trab+=x.trab;afect+=x.afect;n++;}});
  return n?{req,trab,afect,n,efic:req/trab,eficSA:trab-afect>0?req/(trab-afect):0}:null;});}
function ecYear(months){let req=0,trab=0,afect=0;months.forEach(x=>{if(x){req+=x.req;trab+=x.trab;afect+=x.afect;}});return trab?{req,trab,afect,efic:req/trab,eficSA:trab-afect>0?req/(trab-afect):0}:null;}
