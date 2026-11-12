// ===== CÁLCULO DE PERSONAL (headcount) · lógica del formato de Angel =====
// Año fiscal: abril → marzo. Se nombra por el año en que empieza: FY26 = abril 2026 a marzo 2027.
const PC_MONTHS=['Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre','Enero','Febrero','Marzo'];
function pcFY(date){const d=date||new Date();return (d.getFullYear()-(d.getMonth()>=3?0:1))%100;}
// Volumen: la coma es separador de miles (30,000 = 30000)
function pcInt(v){const x=parseFloat(String(v??'').replace(/[^0-9.\-]/g,''));return isNaN(x)?0:x;}
const pcGroups=e=>({A:1,B:2,C:3})[String(e||'').toUpperCase()]||0;
// Un renglón (sublínea) de un mes
function pcRow(r){
  const dias=num(r.dias),hd=num(r.hd),tpm=num(r.tpm),dom=num(r.dom),jph=num(r.jph),oee=num(r.oee)/100;
  const op=num(r.op),ld=num(r.ld),sup=num(r.sup),ind=num(r.hcTpm)+num(r.hcProy)+num(r.hcOtros),vol=pcInt(r.vol),Z=pcGroups(r.esq);
  const S=op+ld;
  const tc=jph?60/jph*oee:0;                 // dato visual: TC = (60 ÷ JPH plan) × OEE plan
  const lat=jph?60/jph*S:0;                   // Line Actual Time: min-hombre por pieza
  const hDisp=dias*(hd-tpm)+dom*hd;           // los domingos no llevan TPM
  const hReq=jph?vol/jph:0;
  const occ=hDisp?hReq/hDisp:0;
  const at=occ?lat/occ:0;                     // Actual Time (KPI)
  const cap=hDisp*jph;                        // = volumen ÷ ocupación
  const gap=cap-vol;                          // positivo = sobra capacidad · negativo = falta
  const hPer=Z?hDisp/Z:0;                     // horas disponibles por persona
  const hh=vol*lat/60;                        // horas-hombre requeridas
  const porGrupo=hDisp?hh/hDisp:0;            // personas directas por grupo (= HH ÷ horas por persona ÷ grupos)
  const directVol=Math.ceil(porGrupo-1e-9)*Z; // redondeo por grupo
  const hcVol=Z?directVol+sup*Z+ind:0;
  const hcEsq=Z?(op+ld+sup)*Z+ind:0;
  // Personal que agrega valor (operadores + líderes) vs afectación (supervisores + TPM + proyectos + otros), sobre la plantilla del esquema
  const dirEsq=Z?S*Z:0,afecEsq=Z?sup*Z+ind:0;
  return {Z,S,ind,tc,lat,hDisp,hReq,occ,at,cap,gap,hPer,hh,porGrupo,directVol,hcVol,hcEsq,dirEsq,afecEsq,jph,oee:num(r.oee)};
}
function pcRed(hcEsq,red){return Math.ceil(hcEsq*(1-num(red)/100)-1e-9);}
// Total de un mes: suma de renglones; la ocupación es horas requeridas ÷ disponibles de todos
function pcMonth(rows,red){const R=(rows||[]).map(r=>Object.assign({r},pcRow(r),{}));R.forEach(x=>x.hcRed=pcRed(x.hcEsq,red));
  const s=k=>R.reduce((a,x)=>a+x[k],0);const hDisp=s('hDisp'),hReq=s('hReq');
  return {rows:R,n:R.length,hcVol:s('hcVol'),hcEsq:s('hcEsq'),hcRed:s('hcRed'),hDisp,hReq,occ:hDisp?hReq/hDisp:0,vol:R.reduce((a,x)=>a+pcInt(x.r.vol),0),cap:s('cap'),gap:s('gap'),hh:s('hh'),dir:s('dirEsq'),afec:s('afecEsq'),
    get lat(){return this.vol?this.hh*60/this.vol:0;},get at(){return this.occ?this.lat/this.occ:0;},get afecPct(){return this.hcEsq?this.afec/this.hcEsq:0;},get reducir(){return this.hcEsq-this.hcRed;},
    get sobre(){return this.hcEsq-this.hcVol;},get pzPer(){return this.hcEsq?this.vol/this.hcEsq:0;},get holg(){return this.cap?this.gap/this.cap:0;}};}
