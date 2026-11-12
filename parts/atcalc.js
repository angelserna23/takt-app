// ===== ACTUAL TIME · seguimiento mensual del costo real en minutos-hombre por pieza =====
// Lógica del formato de Angel (Ensamble + Manejo de materiales; Maquinado = Fundición), con las correcciones acordadas.
// Requiere num() de dscalc.js. Año fiscal abril → marzo (mismos meses que Cálculo de personal).
const AT_AFECT=['tecnico','evento','tpm','proyectos','otros'];
const AT_BASE=0.07;   // afectación base controlada del DSTR (implícita, no se captura)

// m = un mes de un área:
//  partes:[{parte, st, prod}] una fila por número de parte (ST en min-hombre por pieza, lo define el usuario).
//  Las partes solo aportan horas requeridas; todo lo demás se calcula sobre el total del área.
//  horasTrab, afect:{tecnico,evento,tpm,proyectos,otros}  (horas-hombre del mes; las horas genba, si se usan, van en "otros")
//  dias, horasDia (ej. 22.5), hcPlan, jphCommit, gruposCommit, gruposReal (opcional)
//  hcRes (HC total del área), jphRes, sv, lider, otrosInd (personas), dst (solo ensamble / MH)
function atMonth(m){
  const P=(m.partes||[]).map(p=>{const st=num(p.st),prod=num(p.prod);return {parte:p.parte||'',st,prod,horasReq:prod*st/60};});
  const prod=P.reduce((a,p)=>a+p.prod,0);
  const horasReq=P.reduce((a,p)=>a+p.horasReq,0);              // horas requeridas = Σ por parte (producción × ST ÷ 60)
  const st=prod?horasReq*60/prod:0;                             // ST ponderado por producción (con una parte = su ST)
  const trab=num(m.horasTrab);
  const af={};AT_AFECT.forEach(k=>af[k]=num((m.afect||{})[k]));
  const afect=AT_AFECT.reduce((a,k)=>a+af[k],0);
  const efic=trab?horasReq/trab:0;
  const baseSA=trab-afect;                                      // sin afectación = trabajadas − afectaciones (genba fuera del estándar)
  const eficSA=baseSA>0?horasReq/baseSA:0;
  const atReal=prod?trab*60/prod:0;                             // = ST ÷ eficiencia
  const atSA=eficSA?st/eficSA:0;
  // Meta: grupos comprometidos. Forecast y conversión a personas: grupos reales (si no hay, comprometidos)
  const gC=num(m.gruposCommit),gR=num(m.gruposReal)||gC;
  const jphC=num(m.jphCommit),hcPlan=num(m.hcPlan),jphR=num(m.jphRes),hcR=num(m.hcRes);
  const target=(jphC&&gC)?60/jphC*hcPlan/gC:0;
  const forecast=(jphR&&gR)?60/jphR*hcR/gR:0;
  // JPMH (maquinado/fundición): piezas por hora-hombre de un grupo, igual en real y en compromiso
  const jpmh=(hcR&&gR)?jphR/(hcR/gR):0, jpmhCommit=(hcPlan&&gC)?jphC/(hcPlan/gC):0;
  // Cascada de HC: horas → personas equivalentes. Horas por persona en el mes = días × horas/día ÷ grupos reales
  const hPer=gR?num(m.dias)*num(m.horasDia)/gR:0;
  const hc=h=>hPer?h/hPer:0;
  const hcTrab=hc(trab),dif=hcTrab-hcPlan;                       // dif < 0 = ausentismo · dif > 0 = arriba del plan (el Excel lo mostraba como ausentismo)
  const afHC={};AT_AFECT.forEach(k=>afHC[k]=hc(af[k]));
  const res1=hcTrab-hc(afect);
  const sv=num(m.sv),lider=num(m.lider),otrosInd=num(m.otrosInd);
  const res2=res1-sv-lider-otrosInd;                            // operadores equivalentes
  const hcReq=hc(horasReq),gap=res2-hcReq;                      // gap > 0 = sobra gente
  // DSTR (ensamble y su espejo MH): objetivo ya trae la afectación base; al real se le resta 0.07
  const dst=num(m.dst);
  const dstrObj=dst?target/dst:0;
  const dstrReal=dst&&atReal?atReal/dst-AT_BASE:0;
  const dstrRealSA=dst&&atSA?atSA/dst-AT_BASE:0;
  return {partes:P.map(p=>Object.assign(p,{pct:horasReq?p.horasReq/horasReq:0})),prod,horasReq,st,trab,afect,af,efic,eficSA,atReal,atSA,target,forecast,jpmh,jpmhCommit,gC,gR,
    hPer,hcPlan,hcTrab,dif,ausentismo:Math.max(0,-dif),arribaPlan:Math.max(0,dif),afHC,res1,sv,lider,otrosInd,res2,hcReq,gap,
    dstrObj,dstrReal,dstrRealSA,vsTarget:target?atReal-target:0};
}
// Días del mes del año fiscal (FY27: abril 2026 … marzo 2027) para validar la captura
function atDiasMes(fy,i){const y=2000+fy-(i<9?1:0),mo=(i+3)%12;return new Date(y,mo+1,0).getDate();}
// Tiempo por pieza: ensamble usa el tiempo estándar planeado (ST); manejo de materiales, maquinado y fundición
// usan el Line Actual Time (LAT) que sale de Cálculo de personal.
function atTimeLbl(tipo){return tipo==='ENSAMBLE'?'ST':'LAT';}
// Manejo de materiales = espejo de ensamble: misma producción, días, horas/día, JPH, grupos y DST;
// su propio LAT por parte, horas trabajadas, afectaciones, HC e indirectos.
function atMH(m){const mh=m.mh||{};
  return atMonth(Object.assign({},m,{horasTrab:mh.horasTrab,afect:mh.afect||{},hcPlan:mh.hcPlan,hcRes:mh.hcRes,sv:mh.sv,lider:mh.lider,otrosInd:mh.otrosInd,
    partes:(m.partes||[]).map(p=>({parte:p.parte,st:p.lat,prod:p.prod}))}));}
