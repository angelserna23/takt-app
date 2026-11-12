// ===== ACTUAL TIME · pantallas =====
const AT={studies:[],d:null,view:'info',m:null,area:'ens',cm:null,miss:[]};
const AT_TIPOS=['ENSAMBLE','MAQUINADO','FUNDICIÓN','OTRO'];
const AT_AFL={tecnico:'Técnico',evento:'Evento',tpm:'TPM',proyectos:'Proyectos (PIC)',otros:'Otros'};
const atTipo=d=>d.tipo==='OTRO'&&String(d.tipoOtro||'').trim()?String(d.tipoOtro).trim():d.tipo;
const atName=d=>(d.nombre||'Nuevo Actual Time')+' · FY'+String(d.fy).padStart(2,'0');
const atHasMH=d=>d.tipo==='ENSAMBLE'&&!!d.mh;
const atIsJPMH=d=>d.tipo==='MAQUINADO'||d.tipo==='FUNDICIÓN';
const atIsDSTR=d=>d.tipo==='ENSAMBLE';
const atEmptyAf=()=>({tecnico:'',evento:'',tpm:'',proyectos:'',otros:''});
const atNewPart=()=>({id:nid(),parte:'',st:'',lat:'',prod:''});
function atNewMonth(){return {partes:[atNewPart()],horasTrab:'',afect:atEmptyAf(),dias:'',horasDia:'22.5',hcPlan:'',jphCommit:'',gruposCommit:'',gruposReal:'',hcRes:'',jphRes:'',sv:'',lider:'',otrosInd:'',dst:'',
  mh:{horasTrab:'',afect:atEmptyAf(),hcPlan:'',hcRes:'',sv:'',lider:'',otrosInd:''}};}
function atNew(){AT.d={id:nid(),nombre:'',tipo:'ENSAMBLE',tipoOtro:'',mh:true,fy:pcFY(),months:Array(12).fill(null)};AT.view='info';AT.m=null;AT.area='ens';AT.cm=null;AT.miss=[];}
const atR=(m,area)=>m?(area==='mh'?atMH(m):atMonth(m)):null;
const atAll=(d,area)=>d.months.map(m=>atR(m,area));
const atClone=m=>{const c=JSON.parse(JSON.stringify(m));c.partes.forEach(p=>p.id=nid());return c;};
const atMonthLbl=(d,i)=>PC_MONTHS[i]+' '+(2000+d.fy+(i<9?0:1));
const atAreaLbl=a=>a==='mh'?'Manejo de materiales':'Ensamble';
const f1=x=>(Math.round(x*10)/10).toFixed(1);
const h2=x=>(+x||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const atNice=v=>{if(!(v>0))return 1;const e=Math.pow(10,Math.floor(Math.log10(v))),f=v/e;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*e;};
// valor del modelo por ruta: 'horasTrab', 'afect.tpm', 'mh.horasTrab', 'mh.afect.tpm'
const atGet=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function atSet(o,p,v){const k=p.split('.');const last=k.pop();k.reduce((a,x)=>a[x]=a[x]||{},o)[last]=v;}

// ---- ejemplo (datos ficticios) ----
function atExample(d){
  const ens=d.tipo==='ENSAMBLE';
  for(let i=0;i<5;i++){const m=atNewMonth();
    if(ens){
      m.partes=[{id:nid(),parte:'MOD-A',st:'30',lat:'9',prod:String([12000,13200,9800,12500,11000][i])},{id:nid(),parte:'MOD-B',st:'40',lat:'9',prod:String([8000,8600,6400,8200,7300][i])}];
      Object.assign(m,{horasTrab:String([24000,25800,22400,26500,21900][i]),dias:String([20,22,21,22,21][i]),hcPlan:'100',jphCommit:'60',gruposCommit:'2',hcRes:String([104,106,98,108,96][i]),jphRes:String([55,56,50,52,51][i]),sv:'6',lider:'12',otrosInd:'8',dst:'15'});
      m.afect={tecnico:String([200,0,150,0,0][i]),evento:String([300,450,0,300,0][i]),tpm:'900',proyectos:String([100,0,0,100,0][i]),otros:String([1500,1200,2200,0,900][i])};
      m.mh={horasTrab:String([6000,6400,5600,6300,5500][i]),afect:Object.assign(atEmptyAf(),{tpm:'300',tecnico:String([0,120,0,0,0][i])}),hcPlan:'28',hcRes:String([30,31,29,31,28][i]),sv:'2',lider:'3',otrosInd:'1'};
    }else{
      m.partes=[{id:nid(),parte:'MOD-A',st:'14',lat:'',prod:String([12000,12900,11300,12400,14200][i])},{id:nid(),parte:'MOD-B',st:'16',lat:'',prod:String([7000,7600,6500,7200,8300][i])}];
      Object.assign(m,{horasTrab:String([9200,9900,8800,9500,11800][i]),dias:String([24,25,24,25,24][i]),hcPlan:'60',jphCommit:'60',gruposCommit:'3',gruposReal:String([3,3,3,3,2][i]),hcRes:String([58,59,57,58,44][i]),jphRes:String([62,61,63,60,62][i]),sv:'3',lider:'6',otrosInd:'2'});
      m.afect={tecnico:'',evento:String([280,0,0,280,0][i]),tpm:'380',proyectos:'',otros:String([0,745,745,0,0][i])};
    }
    d.months[i]=m;}
}
// LAT por número de parte desde Cálculo de personal (mismo tipo de área y año fiscal)
function atPcSrc(d,m){if(d.tipo==='ENSAMBLE')return null;const s=PC.studies.find(x=>x.fy===d.fy&&x.tipo===d.tipo&&x.months[m]&&x.months[m].length);return s?s.months[m]:null;}
function atFromPC(d,m){const rows=atPcSrc(d,m);if(!rows)return 0;const mo=d.months[m];let n=0;
  mo.partes=mo.partes.filter(p=>String(p.parte).trim()||String(p.st).trim()||String(p.prod).trim());
  rows.forEach(r=>{const nm=String(r.parte||r.nombre||'').trim();const lat=pcRow(r).lat;if(!nm||!lat)return;
    let p=mo.partes.find(x=>String(x.parte).trim()===nm);if(!p){p=atNewPart();p.parte=nm;mo.partes.push(p);}p.st=String(+lat.toFixed(3));n++;});
  if(!mo.partes.length)mo.partes.push(atNewPart());return n;}

// ---- lista ----
function vATList(){
  setHead('Actual Time',[['Actual Time','at']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Actual Time</h2><p class="sub">Minutos-hombre reales por pieza, mes a mes del año fiscal (abril a marzo)</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn ghost" type="button" data-ecopen="1">${svg('chart',18,2)} Eficiencia compuesta</button><button class="btn orange" type="button" data-atnew="1">${svg('plus',18,2.2)} Nuevo Actual Time</button></div></div>
    <div class="grid" style="margin-top:18px">
    ${AT.studies.map(st=>{const R=atAll(st,'ens');const last=R.map((x,i)=>[x,i]).filter(([x])=>x&&x.prod).pop();
      return `<div class="studyrow"><button type="button" class="study" data-atopen="${st.id}">
      <div class="logo" style="background:rgba(194,65,12,.12);color:var(--orange)" aria-hidden="true">AT</div>
      <div class="meta"><b>${esc(atName(st))} <span class="tag" style="vertical-align:2px;margin-left:6px">${esc(atTipo(st))}${atHasMH(st)?' + MH':''}</span></b><span>${R.filter(x=>x&&x.prod).length} de 12 meses capturados</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:${last&&last[0].target&&last[0].atReal>last[0].target?'#B42318':'var(--blue)'}">${last?f2(last[0].atReal):'—'}</span><br><span style="font-size:12px;color:var(--muted)">${last?'Actual Time · '+PC_MONTHS[last[1]]+(last[0].target?' · meta '+f2(last[0].target):''):'Actual Time'}</span></div>
      ${svg('next',20,2)}</button><button type="button" class="iconbtn sdel" data-sdel="at|${st.id}" data-sdeln="${esc(atName(st))}" aria-label="Eliminar ${esc(atName(st))}" title="Eliminar">${svg('trash',18,2)}</button></div>`;}).join('')}
    ${AT.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${svg('at',30)}</div><b style="font-size:17px">Aún no hay Actual Time</b><p>Crea uno por área: ensamble (con manejo de materiales), maquinado, fundición…</p></div>`}
    </div></section>`;
}
function atSteps(){const L=[['info','Información'],['mes','Meses'],['res','Resumen anual']];const idx=L.findIndex(x=>x[0]===AT.view);
  return `<nav class="steps" style="grid-template-columns:repeat(3,minmax(0,1fr))" aria-label="Pasos">${L.map(([v,l],i)=>`<button type="button" class="step ${i<idx?'done':''}" data-atv="${v}" ${i>idx&&!AT.studies.includes(AT.d)?'disabled':''} ${i===idx?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;}
const atAreaSeg=d=>atHasMH(d)?`<div class="seg atarea" role="group" aria-label="Área">${['ens','mh'].map(a=>`<button type="button" data-atarea="${a}" aria-pressed="${AT.area===a}">${atAreaLbl(a).toUpperCase()}</button>`).join('')}</div>`:'';

// ---- indicadores del mes ----
function atKpis(d,r,area){const tl=area==='mh'?'LAT':atTimeLbl(d.tipo);const over=r.target&&r.atReal>r.target;
  const extra=atIsDSTR(d)?`<div class="kpi"><span>DSTR real vs objetivo</span><span class="v" style="color:${r.dstrObj&&r.dstrReal>r.dstrObj?'#B42318':'#15803D'}">${f2(r.dstrReal)}</span><span class="sub">objetivo ${f2(r.dstrObj)} · sin afectación ${f2(r.dstrRealSA)}</span></div>`
    :atIsJPMH(d)?`<div class="kpi"><span>JPMH real vs compromiso</span><span class="v" style="color:${r.jpmh<r.jpmhCommit?'#B42318':'#15803D'}">${f2(r.jpmh)}</span><span class="sub">compromiso ${f2(r.jpmhCommit)} piezas por hora-hombre</span></div>`
    :`<div class="kpi"><span>Forecast</span><span class="v">${f2(r.forecast)}</span><span class="sub">(60 ÷ JPH real) × HC ÷ grupos</span></div>`;
  return `<div class="kpis pck8">
    <div class="kpi"><span>Actual Time real</span><span class="v" style="color:${over?'#B42318':'#15803D'}">${f2(r.atReal)}</span><span class="sub">min-hombre por pieza · ${r.target?(over?'<b style="color:#B42318">+'+f2(r.atReal-r.target)+'</b> arriba de la meta':'<b style="color:#15803D">'+f2(r.atReal-r.target)+'</b> vs meta'):'sin meta'}</span></div>
    <div class="kpi"><span>Meta (TARGET)</span><span class="v">${f2(r.target)}</span><span class="sub">(60 ÷ JPH compr.) × HC plan ÷ grupos compr.</span></div>
    <div class="kpi"><span>Actual Time sin afectación</span><span class="v">${f2(r.atSA)}</span><span class="sub">quitando técnico, evento, TPM, PIC y otros</span></div>
    ${extra}
    <div class="kpi"><span>Eficiencia</span><span class="v" style="color:var(--blue)">${pc(r.efic,1)}</span><span class="sub">sin afectación ${pc(r.eficSA,1)}</span></div>
    <div class="kpi"><span>Horas requeridas / trabajadas</span><span class="v" style="font-size:26px">${nInt(r.horasReq)} <span style="font-size:16px;color:var(--muted)">/ ${nInt(r.trab)}</span></span><span class="sub">${tl} ponderado ${f2(r.st)} · ${nInt(r.prod)} piezas</span></div>
    <div class="kpi"><span>${r.dif<0?'Ausentismo':'Arriba del plan'}</span><span class="v" style="color:${r.dif<0?'#B42318':'var(--orange)'}">${r.dif<0?'−':'+'}${f1(Math.abs(r.dif))}</span><span class="sub">HC trabajado ${f1(r.hcTrab)} vs plan ${f1(r.hcPlan)}</span></div>
    <div class="kpi"><span>GAP de personal</span><span class="v" style="color:${r.gap>0?'var(--orange)':r.gap<0?'#B42318':'#15803D'}">${r.gap>0?'+':''}${f1(r.gap)}</span><span class="sub">${r.gap>0?'personas equivalentes de más':r.gap<0?'faltan personas para lo requerido':'justo lo requerido'} (${f1(r.res2)} vs ${f1(r.hcReq)})</span></div>
  </div>`;}

// ---- cascada de HC ----
function atCasc(r){
  const S=[['PLAN',r.hcPlan,1],[r.dif<0?'AUSENTISMO':'ARRIBA DEL PLAN',r.dif,0],['HC TRABAJADO',r.hcTrab,1],
    ...AT_AFECT.map(k=>[AT_AFL[k].replace(' (PIC)','').toUpperCase(),-r.afHC[k],0]),['RESULTADO',r.res1,1],
    ['SV',-r.sv,0],['LÍDER',-r.lider,0],['OTROS IND.',-r.otrosInd,0],['OPERADORES',r.res2,1],['GAP',-r.gap,0],['HC REQUERIDO',r.hcReq,1]];
  let run=0;const B=S.map(([l,v,tot],i)=>{let a,b;if(tot){a=0;b=v;run=v;}else{a=run;b=run+v;run=b;}return {l,v,tot,a,b,i};});
  const raw=Math.max(1,...B.map(x=>Math.max(x.a,x.b)))*1.1,cs=atNice(raw/4),hi=cs*Math.ceil(raw/cs),lo=Math.min(0,cs*Math.floor(Math.min(0,...B.map(x=>Math.min(x.a,x.b)))/cs));
  const W=window.innerWidth<1100?760:1000,H=330,L=44,R=12,T=26,BT=58;const Y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-BT);const n=B.length,slot=(W-L-R)/n,bw=slot*0.62;
  const tk=[];for(let v=lo;v<=hi+1e-9;v+=cs)tk.push(v);
  const col=x=>x.tot?'#1D5FA8':x.l==='GAP'?(x.v<0?'#C2410C':'#15803D'):x.l==='ARRIBA DEL PLAN'?'#E9A23B':x.l==='AUSENTISMO'?'#B42318':'#E9A47F';
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cascada de headcount">${tk.map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gl"/><text x="${L-8}" y="${(Y(v)+4).toFixed(1)}" text-anchor="end" class="ax">${Math.round(v)}</text>`).join('')}
    ${B.map((x,i)=>{const cx=L+slot*i+slot/2,y1=Y(Math.max(x.a,x.b)),y2=Y(Math.min(x.a,x.b)),h=Math.max(1.5,y2-y1);const words=x.l.split(' ');
      const nx=i<n-1?`<line x1="${(cx+bw/2).toFixed(1)}" x2="${(cx+slot-bw/2).toFixed(1)}" y1="${Y(x.b).toFixed(1)}" y2="${Y(x.b).toFixed(1)}" stroke="rgba(27,36,48,.35)" stroke-dasharray="3 3"/>`:'';
      return `<rect x="${(cx-bw/2).toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${col(x)}"><title>${x.l}: ${x.tot?f1(x.v):(x.v>0?'+':'')+f1(x.v)}</title></rect>${nx}
      <text x="${cx.toFixed(1)}" y="${(y1-6).toFixed(1)}" text-anchor="middle" class="lbl" style="font-size:11px">${x.tot?f1(x.v):Math.abs(x.v)<0.05?'0':(x.v>0?'+':'−')+f1(Math.abs(x.v))}</text>
      ${words.map((w,k)=>`<text x="${cx.toFixed(1)}" y="${(H-BT+16+k*12).toFixed(1)}" text-anchor="middle" class="ax" style="font-size:10px;font-weight:700">${w}</text>`).join('')}`;}).join('')}
  </svg>`;}

// ---- gráficas anuales: barras por mes + líneas de meta ----
function atChart(d,area,o){const R=atAll(d,area);const W=window.innerWidth<1100?720:1000,H=o.h||260,L=56,Rr=16,T=24,B=36,n=12;
  const vals=[];R.forEach((r,i)=>{if(!r||!r.prod&&!o.any)return;o.bars.forEach(b=>vals.push(b[2](r,d.months[i])));(o.lines||[]).forEach(l=>vals.push(l[2](r,d.months[i])));});
  if(!vals.length)return '<p class="sub">Sin datos.</p>';
  const raw=Math.max(o.min||0,...vals.filter(isFinite))*1.12||1;const st=atNice(raw/4),hi=st*Math.ceil(raw/st);const Y=v=>T+(1-v/hi)*(H-T-B);const slot=(W-L-Rr)/n,nb=o.bars.length,bw=slot*(nb>1?0.32:0.55);
  const fmt=o.fmt||(v=>f2(v));const ax=o.ax||(v=>Math.abs(v-Math.round(v))<1e-9?nInt(v):String(+v.toFixed(2)));const tk=[];for(let v=0;v<=hi+1e-9;v+=st)tk.push(v);
  const lines=(o.lines||[]).map(([lbl,c,fn,dash])=>{const pts=R.map((r,i)=>r&&(r.prod||o.any)?[L+slot*i+slot/2,Y(fn(r,d.months[i])),i]:null);
    const segs=[];let cur=[];pts.forEach(p=>{if(p)cur.push(p);else{if(cur.length)segs.push(cur);cur=[];}});if(cur.length)segs.push(cur);
    return segs.map(s=>s.length>1?`<polyline points="${s.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="2.4" ${dash?'stroke-dasharray="6 5"':''}/>`:`<line x1="${(s[0][0]-slot*0.4).toFixed(1)}" x2="${(s[0][0]+slot*0.4).toFixed(1)}" y1="${s[0][1].toFixed(1)}" y2="${s[0][1].toFixed(1)}" stroke="${c}" stroke-width="2.4" ${dash?'stroke-dasharray="6 5"':''}/>`).join('');}).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title||'')}">${tk.map(v=>`<line x1="${L}" x2="${W-Rr}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gl"/><text x="${L-8}" y="${(Y(v)+4).toFixed(1)}" text-anchor="end" class="ax">${ax(v)}</text>`).join('')}
    ${R.map((r,i)=>{const x0=L+slot*i;return `<text x="${(x0+slot/2).toFixed(1)}" y="${H-B+18}" text-anchor="middle" class="ax" style="font-weight:700">${PC_MONTHS[i].slice(0,3).toUpperCase()}</text>${r&&(r.prod||o.any)?o.bars.map(([lbl,c,fn],k)=>{const v=fn(r,d.months[i]);const x=x0+slot/2-bw*nb/2+bw*k;
      return `<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,H-B-Y(v)).toFixed(1)}" rx="3" fill="${c}"><title>${PC_MONTHS[i]} · ${lbl}: ${fmt(v)}</title></rect>${o.labels!==false&&k===0?`<text x="${(x+bw/2).toFixed(1)}" y="${(Y(v)-5).toFixed(1)}" text-anchor="middle" class="lbl" style="font-size:10px">${fmt(v)}</text>`:''}`;}).join(''):''}`;}).join('')}
    ${lines}</svg>`;}
const atLegend=o=>`<div class="legend" style="margin-top:6px">${o.bars.map(b=>`<span><i style="background:${b[1]}"></i>${b[0]}</span>`).join('')}${(o.lines||[]).map(l=>`<span><i style="background:transparent;border-top:2px ${l[3]?'dashed':'solid'} ${l[1]};height:0;vertical-align:3px"></i>${l[0]}</span>`).join('')}</div>`;
const atBox=(d,area,o)=>`<div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">${o.title}</b>${o.sub?`<p class="sub" style="margin:2px 0 0">${o.sub}</p>`:''}<div class="stchart parchart">${atChart(d,area,o)}</div>${atLegend(o)}</div>`;

// ---- tabla de números de parte ----
function atPartRows(d,mo,area){const tl=atTimeLbl(d.tipo);const mh=atHasMH(d);const r=atR(mo,area);
  return `<div class="tbl attbl"><table><thead><tr><th style="width:40px">#</th><th style="text-align:left">No. de parte</th><th>${tl} ${d.tipo==='ENSAMBLE'?'ensamble':''}<br><small>min-h/pza</small></th>${mh?`<th>LAT manejo de materiales<br><small>uno para toda la línea</small></th>`:''}<th>Producción<br><small>piezas</small></th><th>Horas requeridas${mh?'<br><small>'+atAreaLbl(area).toLowerCase()+'</small>':''}</th><th>% del total</th><th style="width:52px"></th></tr></thead><tbody>
    ${mo.partes.map((p,i)=>{const x=r.partes[i];return `<tr><td>${i+1}</td><td><input class="txt" data-atp="${p.id}|parte" value="${esc(p.parte)}" placeholder="Ej. MOD-A" autocomplete="off" aria-label="Número de parte ${i+1}"></td>
      <td><input data-atp="${p.id}|st" value="${esc(p.st)}" inputmode="decimal" autocomplete="off" aria-label="${tl} parte ${i+1}"></td>${mh?(i===0?`<td><input data-atp="${p.id}|lat" value="${esc(p.lat)}" inputmode="decimal" autocomplete="off" aria-label="LAT de manejo de materiales (aplica a todas las partes)"></td>`:`<td><input class="atcopy" data-atlatc="${p.id}" value="${esc(p.lat)}" readonly tabindex="-1" aria-label="LAT de manejo de materiales copiado de la primera parte" title="Se copia de la primera parte"></td>`):''}
      <td><input data-atp="${p.id}|prod" data-atint="1" value="${esc(pcIntFmt(p.prod))}" inputmode="decimal" autocomplete="off" aria-label="Producción parte ${i+1}"></td>
      <td data-atph="${p.id}">${h2(x.horasReq)}</td><td data-atpp="${p.id}">${pc(x.pct,1)}</td>
      <td><button type="button" class="iconbtn" data-atpdel="${p.id}" aria-label="Quitar parte ${i+1}" title="Quitar parte" ${mo.partes.length<2?'disabled':''}>${svg('trash',16,2)}</button></td></tr>`;}).join('')}
    <tr class="trow"><th colspan="${mh?4:3}">Total · ${mo.partes.length} parte${mo.partes.length!==1?'s':''}</th><td data-atpt="prod">${nInt(r.prod)}</td><td data-atpt="req">${h2(r.horasReq)}</td><td>100%</td><td></td></tr>
  </tbody></table></div>`;}

// ---- campos del mes ----
function atFld(mo,path,lbl,o={}){const v=atGet(mo,path);const miss=o.miss?' miss':'';
  return `<label class="${o.w2?'w2':''}${miss}">${lbl}<input data-atf="${path}" value="${esc(o.int?pcIntFmt(v):(v??''))}" inputmode="decimal" autocomplete="off"${o.int?' data-atint="1"':''}${o.ph?` placeholder="${o.ph}"`:''}>${o.hint?`<small class="athint">${o.hint}</small>`:''}</label>`;}
function atFields(d,mo,area){const m=AT.m;const dm=atDiasMes(d.fy,m);const badD=num(mo.dias)>dm;const pre=area==='mh'?'mh.':'';
  const g=(t,inner,sub)=>`<div class="pcgrp"><b>${t}${sub?` <span class="hint">${sub}</span>`:''}</b><div class="pcgrid">${inner}</div></div>`;
  const af=g('Afectaciones','' + AT_AFECT.map(k=>atFld(mo,pre+'afect.'+k,AT_AFL[k],{int:1})).join(''),'horas-hombre que se restan a las trabajadas · genba, si aplica, en «Otros»');
  if(area==='mh')return `<p class="sub atnote">${svg('list',16,2)} Producción, días, horas por día, JPH, grupos y DST se toman de <b>ensamble</b>.</p>
    ${g('Horas del mes · manejo de materiales',atFld(mo,'mh.horasTrab','Horas trabajadas',{int:1,w2:1}))}${af}
    ${g('Personal · manejo de materiales',atFld(mo,'mh.hcPlan','HC plan (compromiso)')+atFld(mo,'mh.hcRes','HC total del área (real)')+atFld(mo,'mh.sv','SV')+atFld(mo,'mh.lider','Líder')+atFld(mo,'mh.otrosInd','Otros indirectos'),'personas')}`;
  return `${g('Horas del mes',atFld(mo,'horasTrab','Horas trabajadas',{int:1,w2:1})+atFld(mo,'dias','Días trabajados',{miss:badD,hint:badD?PC_MONTHS[m]+' tiene '+dm+' días':''})+atFld(mo,'horasDia','Horas por día',{hint:'22.5 = 2 turnos · 11.25 = 1 turno'}))}
    ${af}
    ${g('Plan (compromiso)',atFld(mo,'hcPlan','HC plan')+atFld(mo,'jphCommit','JPH comprometido')+atFld(mo,'gruposCommit','Grupos comprometidos'),'define la meta (TARGET)')}
    ${g('Resultado real',atFld(mo,'hcRes','HC total del área')+atFld(mo,'jphRes','JPH real')+atFld(mo,'gruposReal','Grupos reales',{ph:'= COMPR.'}),'grupos reales convierten horas en personas')}
    ${g('Indirectos',atFld(mo,'sv','SV')+atFld(mo,'lider','Líder')+atFld(mo,'otrosInd','Otros indirectos'),'personas')}
    ${atIsDSTR(d)?g('DSTR',atFld(mo,'dst','Tiempo estándar de diseño (DST)',{w2:1}),'objetivo ya determinado; al real se le resta la afectación base'):''}`;}

// ---- tarjetas del año (vista general de meses y resumen anual) ----
function atYearKpis(d,area){const R=atAll(d,area);const ok=R.map((r,i)=>[r,i]).filter(([r])=>r&&r.prod);if(!ok.length)return '';
  const sum=k=>ok.reduce((a,[r])=>a+r[k],0);const atY=sum('prod')?sum('trab')*60/sum('prod'):0;const effY=sum('trab')?sum('horasReq')/sum('trab'):0;
  const tgt=ok.filter(([r])=>r.target);const tgtY=tgt.length?tgt.reduce((a,[r])=>a+r.target*r.prod,0)/tgt.reduce((a,[r])=>a+r.prod,0):0;
  const[lm,li]=ok[ok.length-1];
  return `<div class="kpis pck8" style="margin-top:16px">
        <div class="kpi"><span>Actual Time del año</span><span class="v" style="color:${tgtY&&atY>tgtY?'#B42318':'#15803D'}">${f2(atY)}</span><span class="sub">Σ horas trabajadas × 60 ÷ Σ producción</span></div>
        <div class="kpi"><span>Meta del año</span><span class="v">${f2(tgtY)}</span><span class="sub">TARGET ponderado por producción</span></div>
        <div class="kpi"><span>Eficiencia del año</span><span class="v" style="color:var(--blue)">${pc(effY,1)}</span><span class="sub">Σ horas requeridas ÷ Σ trabajadas</span></div>
        <div class="kpi"><span>Producción del año</span><span class="v" style="font-size:28px">${nInt(sum('prod'))}</span><span class="sub">${ok.length} mes${ok.length!==1?'es':''}</span></div>
        <div class="kpi"><span>Actual Time · ${PC_MONTHS[li]}</span><span class="v" style="color:${lm.target&&lm.atReal>lm.target?'#B42318':'#15803D'}">${f2(lm.atReal)}</span><span class="sub">meta ${f2(lm.target)} · sin afectación ${f2(lm.atSA)}</span></div>
        <div class="kpi"><span>GAP de personal · ${PC_MONTHS[li]}</span><span class="v" style="color:${lm.gap>0?'var(--orange)':lm.gap<0?'#B42318':'#15803D'}">${lm.gap>0?'+':''}${f1(lm.gap)}</span><span class="sub">operadores ${f1(lm.res2)} vs requeridos ${f1(lm.hcReq)}</span></div>
        <div class="kpi"><span>${lm.dif<0?'Ausentismo':'Arriba del plan'} · ${PC_MONTHS[li]}</span><span class="v" style="color:${lm.dif<0?'#B42318':'var(--orange)'}">${lm.dif<0?'−':'+'}${f1(Math.abs(lm.dif))}</span><span class="sub">HC trabajado ${f1(lm.hcTrab)} vs plan ${f1(lm.hcPlan)}</span></div>
        ${atIsDSTR(d)?`<div class="kpi"><span>DSTR · ${PC_MONTHS[li]}</span><span class="v" style="color:${lm.dstrObj&&lm.dstrReal>lm.dstrObj?'#B42318':'#15803D'}">${f2(lm.dstrReal)}</span><span class="sub">objetivo ${f2(lm.dstrObj)}</span></div>`
          :atIsJPMH(d)?`<div class="kpi"><span>JPMH · ${PC_MONTHS[li]}</span><span class="v" style="color:${lm.jpmh<lm.jpmhCommit?'#B42318':'#15803D'}">${f2(lm.jpmh)}</span><span class="sub">compromiso ${f2(lm.jpmhCommit)}</span></div>`
          :`<div class="kpi"><span>Forecast · ${PC_MONTHS[li]}</span><span class="v">${f2(lm.forecast)}</span><span class="sub">(60 ÷ JPH real) × HC ÷ grupos</span></div>`}
      </div>`;}
// ---- vista principal ----
function vAT(){
  if(!AT.d)atNew();const d=AT.d;const tit=atName(d);if(!atHasMH(d))AT.area='ens';
  setHead(tit,[['Actual Time','at'],[tit,'at-nuevo']]);
  const del=AT.studies.includes(d)?`<button class="btn danger sm" type="button" data-atdel="1">${svg('trash',16,2)} Eliminar</button>`:'';
  let body='';
  if(AT.view==='info'){const fys=[d.fy-1,d.fy,d.fy+1];
    body=`<div class="row"><div><h2>Información</h2><p class="sub">Un Actual Time por área y año fiscal. Cada mes se captura una vez, al cierre.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${del}<button class="btn" type="button" data-atv="mes" data-atneed="1">Continuar a meses ${svg('next',18,2.2)}</button></div></div>
    <form class="form" id="ath" style="margin-top:18px" onsubmit="return false">
      <label class="${AT.miss.includes('nombre')?'miss':''}">Nombre del área <span class="req" aria-hidden="true">*</span><input name="nombre" value="${esc(d.nombre)}" placeholder="Ej. ENSAMBLE PLANTA 1" autocomplete="off"></label>
    </form>
    <div style="margin-top:16px"><span class="mmlbl">Tipo de área</span><div class="chips">${AT_TIPOS.map(t=>`<button type="button" class="chip" data-attipo="${t}" aria-pressed="${d.tipo===t}">${t}</button>`).join('')}</div>
      ${d.tipo==='OTRO'?`<label class="form" style="display:block;margin-top:10px;max-width:420px"><span style="display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px">¿Qué área es?</span><input data-attipootro="1" value="${esc(d.tipoOtro||'')}" placeholder="Ej. PINTURA" autocomplete="off" style="width:100%"></label>`:''}
      <p class="sub" style="margin-top:8px">${d.tipo==='ENSAMBLE'?'Tiempo por pieza: <b>ST</b> (tiempo estándar planeado). Incluye DSTR.':'Tiempo por pieza: <b>LAT</b> (Line Actual Time de Cálculo de personal).'+(atIsJPMH(d)?' Incluye JPMH.':'')}</p></div>
    ${d.tipo==='ENSAMBLE'?`<div style="margin-top:16px"><span class="mmlbl">Manejo de materiales <span class="hint">espejo de ensamble con su propio personal</span></span><div class="chips"><button type="button" class="chip" data-atmh="1" aria-pressed="${!!d.mh}">Incluir</button><button type="button" class="chip" data-atmh="0" aria-pressed="${!d.mh}">No incluir</button></div></div>`:''}
    <div style="margin-top:16px"><span class="mmlbl">Año fiscal <span class="hint">abril a marzo</span></span><div class="chips">${fys.map(f=>`<button type="button" class="chip" data-atfy="${f}" aria-pressed="${d.fy===f}">FY${String(f).padStart(2,'0')} · abr ${2000+f} – mar ${2000+f+1}</button>`).join('')}</div></div>`;
  }
  if(AT.view==='mes'&&AT.m==null){const area=AT.area;const R=atAll(d,area);const n=R.filter(r=>r&&r.prod).length;
    body=`<div class="row"><div><h2>Meses · FY${String(d.fy).padStart(2,'0')}</h2><p class="sub">${esc(atTipo(d))}${atHasMH(d)?' + manejo de materiales':''} · ${n} de 12 meses capturados · toca un mes para capturarlo o revisarlo</p></div>${atAreaSeg(d)}</div>
    <div class="pcmonths atmonths" role="list" aria-label="Meses del año fiscal">${PC_MONTHS.map((nm,i)=>{const r=R[i];const over=r&&r.target&&r.atReal>r.target;return `<button type="button" role="listitem" class="pcm ${r&&r.prod?'ok':''}" data-atm="${i}" aria-label="${atMonthLbl(d,i)}"><b>${nm.slice(0,3).toUpperCase()}</b><small class="mono" ${r&&r.prod?`style="color:${over?'#B42318':'#15803D'}"`:''}>${r&&r.prod?f1(r.atReal):d.months[i]?'incompleto':'—'}</small></button>`;}).join('')}</div>
    ${n?`<p class="mmlbl" style="margin:18px 0 0">Acumulado del año</p>${atYearKpis(d,area)}`:`<div class="slot empty" style="min-height:180px;margin-top:16px"><b style="font-size:17px">Aún no hay meses capturados</b><p>Toca un mes para empezar. Cada mes se captura una vez, al cierre.</p>${d.months.every(x=>!x)?`<button class="btn ghost" type="button" data-atexample="1">Cargar ejemplo (5 meses)</button>`:''}</div>`}
    <div class="pcbottom"><button class="btn ghost" type="button" data-atv="info">${svg('back',18,2.2)} Información</button><button class="btn" type="button" data-atv="res">Resumen anual ${svg('next',18,2.2)}</button></div>`;
  }
  else if(AT.view==='mes'){const m=AT.m;const mo=d.months[m];const area=AT.area;
    const prev=(()=>{for(let i=m-1;i>=0;i--)if(d.months[i])return i;return -1;})();
    const src=mo&&atPcSrc(d,m);
    body=`<div class="row"><div><button type="button" class="btn ghost sm atback" data-atmall="1">${svg('back',16,2.2)} Todos los meses</button><h2 style="margin-top:10px">${atMonthLbl(d,m)}</h2><p class="sub">${mo?esc(atTipo(d))+(atHasMH(d)?' + manejo de materiales':'')+' · se captura al cierre del mes':'Mes sin capturar'}</p></div>${atAreaSeg(d)}</div>
    ${!mo?`<div class="slot empty" style="min-height:200px;margin-top:16px"><b style="font-size:17px">${PC_MONTHS[m]} sin capturar</b><p>${prev>=0?`Copia <b>${PC_MONTHS[prev]}</b> (partes, plan y personal) y cambia solo lo que se movió.`:'Captura las partes, las horas y el personal del mes.'}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${prev>=0?`<button class="btn" type="button" data-atcopy="${prev}">Copiar de ${PC_MONTHS[prev]}</button>`:''}<button class="btn ghost" type="button" data-atstart="1">${svg('plus',18,2.2)} Empezar en blanco</button></div></div>`
    :`<div data-atlive="1" style="margin-top:16px">${atKpis(d,atR(mo,area),area)}</div>
    <div class="pcgrp" style="margin-top:18px"><b>Números de parte <span class="hint">cada parte aporta sus horas requeridas = producción × ${area==='mh'?'LAT':atTimeLbl(d.tipo)} ÷ 60</span></b>${atPartRows(d,mo,area)}
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn ghost sm" type="button" data-atpadd="1">${svg('plus',16,2.2)} Agregar parte</button>${src?`<button class="btn ghost sm" type="button" data-atpc="1">Traer LAT de Cálculo de personal</button>`:''}</div></div>
    <div class="pcbody atbody">${atFields(d,mo,area)}</div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><div class="row"><div><b style="font-size:16px">Cascada de headcount${atHasMH(d)?' · '+atAreaLbl(area).toLowerCase():''}</b><p class="sub" style="margin:2px 0 0">Horas convertidas a personas equivalentes: días × horas por día ÷ grupos reales = <span data-athper="1">${f2(atR(mo,area).hPer)}</span> h por persona</p></div></div>
      <div class="stchart parchart" data-atcasc="1">${atCasc(atR(mo,area))}</div></div>
    <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">${prev>=0?`<button class="btn ghost sm" type="button" data-atcopy="${prev}" data-atask="1">Reemplazar con ${PC_MONTHS[prev]}</button>`:''}<button class="btn ghost sm" type="button" data-atclear="1">Borrar mes</button></div>`}
    <div class="pcbottom"><button class="btn ghost" type="button" data-atmall="1">${svg('back',18,2.2)} Todos los meses</button>${!mo?'':atHasMH(d)&&area==='ens'?`<button class="btn" type="button" data-atarea="mh" data-attop="1">Siguiente: manejo de materiales ${svg('next',18,2.2)}</button>`:`<div style="display:flex;gap:10px;flex-wrap:wrap">${atHasMH(d)?`<button class="btn ghost" type="button" data-atarea="ens" data-attop="1">${svg('back',18,2.2)} Ensamble</button>`:''}<button class="btn orange" type="button" data-atsave="1">Guardar ${PC_MONTHS[m].toLowerCase()} ${svg('next',18,2.2)}</button></div>`}</div>`;
  }
  if(AT.view==='res'){const area=AT.area;const R=atAll(d,area);const ok=R.map((r,i)=>[r,i]).filter(([r])=>r&&r.prod);const tl=area==='mh'?'LAT':atTimeLbl(d.tipo);
    body=`<div class="row"><div><h2>Resumen anual · FY${String(d.fy).padStart(2,'0')}</h2><p class="sub">${esc(d.nombre)} · ${esc(atTipo(d))}${atHasMH(d)?' · '+atAreaLbl(area).toLowerCase():''} · ${ok.length} de 12 meses capturados</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${atAreaSeg(d)}${del}<button class="btn ghost" type="button" data-atv="mes">${svg('back',18,2.2)} Meses</button><button class="btn orange" type="button" data-atfinish="1">Guardar</button></div></div>
    ${!ok.length?`<div class="slot empty" style="min-height:160px;margin-top:16px"><p>Captura al menos un mes para ver el resumen.</p></div>`:(()=>{
      const sum=k=>ok.reduce((a,[r])=>a+r[k],0);const atY=sum('prod')?sum('trab')*60/sum('prod'):0;const effY=sum('trab')?sum('horasReq')/sum('trab'):0;
      const tgt=ok.filter(([r])=>r.target);const tgtY=tgt.length?tgt.reduce((a,[r])=>a+r.target*r.prod,0)/tgt.reduce((a,[r])=>a+r.prod,0):0;
      const[lm,li]=ok[ok.length-1];const cm=AT.cm!=null&&R[AT.cm]&&R[AT.cm].prod?AT.cm:li;const cr=R[cm];
      const AF='#C2410C',SA='#E9A47F',TG='#1D5FA8';
      return `${atYearKpis(d,area)}
      ${atBox(d,area,{title:'Actual Time'+(atHasMH(d)?' · '+atAreaLbl(area).toLowerCase():''),sub:'Minutos-hombre por pieza contra la meta · abajo es mejor',bars:[['Con afectación',AF,r=>r.atReal],['Sin afectación',SA,r=>r.atSA]],lines:[['Meta (TARGET)',TG,r=>r.target,1]]})}
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><div class="row"><div><b style="font-size:16px">Cascada de headcount · ${PC_MONTHS[cm]}</b><p class="sub" style="margin:2px 0 0">Del plan al HC requerido, en personas equivalentes</p></div></div>
        <div class="chips" style="margin-top:10px" role="group" aria-label="Mes">${ok.map(([r,i])=>`<button type="button" class="chip sm" data-atcm="${i}" aria-pressed="${i===cm}">${PC_MONTHS[i].slice(0,3).toUpperCase()}</button>`).join('')}</div>
        <div class="stchart parchart">${atCasc(cr)}</div></div>
      ${atBox(d,area,{title:'Eficiencia',sub:'Horas requeridas ÷ horas trabajadas · arriba es mejor',bars:[['Eficiencia',AF,r=>r.efic*100],['Sin afectación',SA,r=>r.eficSA*100]],lines:[['Compromiso 100 %',TG,()=>100,1]],fmt:v=>f1(v)+'%',ax:v=>Math.round(v)+'%',min:100})}
      ${atBox(d,area,{title:'Horas trabajadas vs requeridas',bars:[['Trabajadas','#A7B0BA',r=>r.trab],['Requeridas','#1D5FA8',r=>r.horasReq]],fmt:v=>nInt(v),labels:false})}
      ${area==='ens'?atBox(d,area,{title:'Producción mensual',sub:'Piezas · arriba es mejor',bars:[['Producción','#3E7BC4',r=>r.prod]],fmt:v=>nInt(v)}):''}
      ${area==='ens'?atBox(d,area,{title:'JPH real vs comprometido',bars:[['JPH real','#1D5FA8',(r,m)=>num(m.jphRes)]],lines:[['JPH comprometido','#C2410C',(r,m)=>num(m.jphCommit),1]],fmt:v=>f1(v)}):''}
      ${atIsDSTR(d)?atBox(d,area,{title:'DSTR'+(atHasMH(d)?' · '+atAreaLbl(area).toLowerCase():''),sub:'Actual Time ÷ tiempo estándar de diseño · abajo es mejor',bars:[['Real (con afectación)',AF,r=>r.dstrReal],['Real (sin afectación)',SA,r=>r.dstrRealSA]],lines:[['Objetivo',TG,r=>r.dstrObj,1]]}):''}
      ${atIsJPMH(d)?atBox(d,area,{title:'JPMH',sub:'Piezas por hora-hombre de un grupo · arriba es mejor',bars:[['JPMH real','#1D5FA8',r=>r.jpmh]],lines:[['Compromiso','#C2410C',r=>r.jpmhCommit,1]]}):''}
      <div class="tbl smtbl"><table><thead><tr><th style="text-align:left">Mes</th><th>Producción</th><th>Horas req.</th><th>Horas trab.</th><th>${tl} pond.</th><th>Eficiencia</th><th>Sin afect.</th><th>Actual Time</th><th>Sin afect.</th><th>Meta</th><th>HC trabajado</th><th>Operadores</th><th>HC req.</th><th>GAP</th>${atIsDSTR(d)?'<th>DSTR</th><th>DSTR obj.</th>':''}${atIsJPMH(d)?'<th>JPMH</th><th>JPMH compr.</th>':''}</tr></thead><tbody>
        ${ok.map(([r,i])=>`<tr><th>${atMonthLbl(d,i)}</th><td>${nInt(r.prod)}</td><td>${nInt(r.horasReq)}</td><td>${nInt(r.trab)}</td><td>${f2(r.st)}</td><td>${pc(r.efic,1)}</td><td>${pc(r.eficSA,1)}</td><td style="color:${r.target&&r.atReal>r.target?'#B42318':'#15803D'}"><b>${f2(r.atReal)}</b></td><td>${f2(r.atSA)}</td><td>${f2(r.target)}</td><td>${f1(r.hcTrab)}</td><td>${f1(r.res2)}</td><td>${f1(r.hcReq)}</td><td style="color:${r.gap>0?'var(--orange)':'#B42318'}">${r.gap>0?'+':''}${f1(r.gap)}</td>${atIsDSTR(d)?`<td>${f2(r.dstrReal)}</td><td>${f2(r.dstrObj)}</td>`:''}${atIsJPMH(d)?`<td>${f2(r.jpmh)}</td><td>${f2(r.jpmhCommit)}</td>`:''}</tr>`).join('')}
      </tbody></table></div>`;})()}`;
  }
  return `${atSteps()}<section class="glass panel ${S.keep?'':'view'}">${body}</section>`;
}
// ---- eventos ----
const atRe=()=>{S.keep=true;render(true);S.keep=false;};
function atSync(){const f=document.getElementById('ath');if(f&&AT.d)new FormData(f).forEach((v,k)=>AT.d[k]=v);}
function atLive(){const d=AT.d;const mo=d&&AT.m!=null&&d.months[AT.m];if(!mo)return;const r=atR(mo,AT.area);
  const set=(sel,h)=>{const e=document.querySelector(sel);if(e)e.innerHTML=h;};
  set('[data-atlive]',atKpis(d,r,AT.area));set('[data-atcasc]',atCasc(r));set('[data-athper]',f2(r.hPer));
  mo.partes.forEach((p,i)=>{set(`[data-atph="${p.id}"]`,h2(r.partes[i].horasReq));set(`[data-atpp="${p.id}"]`,pc(r.partes[i].pct,1));});
  set('[data-atpt="prod"]',nInt(r.prod));set('[data-atpt="req"]',h2(r.horasReq));
  const mb=document.querySelector(`[data-atm="${AT.m}"] small`);if(mb)mb.textContent=r.prod?f1(r.atReal):'—';
  const di=document.querySelector('[data-atf="dias"]');if(di){const dm=atDiasMes(d.fy,AT.m),bad=num(mo.dias)>dm;const lb=di.closest('label');lb.classList.toggle('miss',bad);let h=lb.querySelector('.athint');if(bad){if(!h){h=document.createElement('small');h.className='athint';lb.appendChild(h);}h.textContent=PC_MONTHS[AT.m]+' tiene '+dm+' días';}else if(h)h.remove();}}
document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('button');if(!t||t.disabled)return;const D=t.dataset;
  if(D.atnew){atNew();go('at-nuevo');return;}
  if(D.atopen){AT.d=AT.studies.find(x=>x.id==D.atopen);AT.view=AT.d.months.some(Boolean)?'res':'info';AT.m=null;AT.area='ens';AT.cm=null;AT.miss=[];go('at-nuevo');return;}
  const d=AT.d;if(!d||!Object.keys(D).some(k=>k.startsWith('at')))return;
  if(D.atv){atSync();if(D.atneed){AT.miss=String(d.nombre||'').trim()?[]:['nombre'];if(AT.miss.length){atRe();return;}if(!AT.studies.includes(d))AT.studies.unshift(d);
}
    if(D.atv==='mes')AT.m=null;AT.view=D.atv;render();return;}
  if(D.attipo){atSync();d.tipo=D.attipo;atRe();return;}
  if(D.atmh!==undefined){atSync();d.mh=D.atmh==='1';atRe();return;}
  if(D.atfy){atSync();d.fy=+D.atfy;atRe();return;}
  if(D.atarea){AT.area=D.atarea;if(D.attop){render();scrollTo({top:0});}else atRe();return;}
  if(D.atsave){const mo=d.months[AT.m];const done=()=>{if(!AT.studies.includes(d))AT.studies.unshift(d);AT.cm=AT.m;AT.m=null;AT.view='res';AT.area='ens';render();scrollTo({top:0});};
    const faltan=[];if(!num(mo.horasTrab)||!atMonth(mo).prod)faltan.push('ensamble');if(atHasMH(d)&&(!num((mo.mh||{}).horasTrab)||!num((mo.partes[0]||{}).lat)))faltan.push('manejo de materiales');
    if(faltan.length)ask('¿Guardar '+PC_MONTHS[AT.m]+' incompleto?','Falta capturar '+faltan.join(' y ')+' (horas trabajadas, producción o LAT). Puedes guardarlo así y completarlo después.','Guardar así',done,{ok:1,icon:'list'});else done();return;}
  if(D.atm!==undefined){AT.m=+D.atm;render();scrollTo({top:0});return;}
  if(D.atmall){AT.m=null;render();scrollTo({top:0});return;}
  if(D.atcm!==undefined){AT.cm=+D.atcm;atRe();return;}
  if(D.atexample){atExample(d);AT.m=null;atRe();return;}
  if(D.atstart){d.months[AT.m]=atNewMonth();atRe();return;}
  if(D.atcopy!==undefined){const doit=()=>{d.months[AT.m]=atClone(d.months[+D.atcopy]);atRe();};
    if(D.atask)ask('¿Reemplazar '+PC_MONTHS[AT.m]+'?','Se borra lo capturado en '+PC_MONTHS[AT.m]+' y se copia '+PC_MONTHS[+D.atcopy]+'.','Reemplazar',doit);else doit();return;}
  if(D.atclear){ask('¿Borrar '+PC_MONTHS[AT.m]+'?','Se borra todo lo capturado en '+PC_MONTHS[AT.m]+'. Los demás meses no cambian.','Borrar mes',()=>{d.months[AT.m]=null;atRe();});return;}
  if(D.atpadd){const ps=d.months[AT.m].partes;const np=atNewPart();np.lat=ps.length?ps[0].lat:'';ps.push(np);atRe();const ins=document.querySelectorAll('[data-atp$="|parte"]');if(ins.length)ins[ins.length-1].focus({preventScroll:false});return;}
  if(D.atpdel){const mo=d.months[AT.m];const p=mo.partes.find(x=>x.id==D.atpdel);ask('¿Quitar esta parte?','Se quita «'+(p.parte||'parte sin nombre')+'» de '+PC_MONTHS[AT.m]+'.','Quitar',()=>{mo.partes=mo.partes.filter(x=>x!==p);atRe();});return;}
  if(D.atpc){atFromPC(d,AT.m);atRe();return;}
  if(D.atdel){ask('¿Eliminar este Actual Time?','Se borra «'+atName(d)+'» con todos sus meses. No se puede deshacer.','Eliminar',()=>{AT.studies=AT.studies.filter(x=>x!==d);AT.d=null;go('at');});return;}
  if(D.atfinish){if(!AT.studies.includes(d))AT.studies.unshift(d);AT.d=null;go('at');return;}
});
document.addEventListener('input',e=>{const el=e.target;const d=AT.d;if(!d||!el.dataset)return;
  if(el.closest&&el.closest('#ath')){atSync();if(AT.miss.length&&String(d.nombre||'').trim())AT.miss=[];return;}
  if(el.dataset.attipootro){d.tipoOtro=el.value;return;}
  if(AT.m==null)return;const mo=d.months[AT.m];if(!mo)return;
  const val=el.dataset.atint?(String(el.value).trim()===''?'':String(pcInt(el.value))):el.value;
  if(el.dataset.atf){atSet(mo,el.dataset.atf,val);atLive();return;}
  if(el.dataset.atp){const[id,k]=el.dataset.atp.split('|');const p=mo.partes.find(x=>x.id==id);if(!p)return;p[k]=val;if(k==='lat'){mo.partes.forEach(x=>x.lat=val);document.querySelectorAll('[data-atlatc]').forEach(e=>e.value=val);}if(k!=='parte')atLive();}
});
document.addEventListener('focusout',e=>{const el=e.target;if(el.dataset&&el.dataset.atint&&AT.d)el.value=pcIntFmt(el.value);});
