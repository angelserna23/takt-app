// ================= DELAY STUDY =================
const PERIODS=[['hora','Hora',60],['turno','Turno',480],['dia','Día',720],['otro','Otro',null]];
const SCEN=[[1,'Actual'],[1.1,'+10 %'],[1.2,'+20 %'],[1.3,'+30 %']];
const DS={studies:[],d:null,view:'info',sel:null,scen:1,run:null};
const mm=s=>{s=Math.max(0,s);const m=Math.floor(s/60);const r=s-m*60;return String(m).padStart(2,'0')+':'+r.toFixed(1).padStart(4,'0');};
const f2=x=>(Math.round(x*100)/100).toFixed(2);
function dsNew(){DS.d={id:nid(),titulo:'',observador:'',area:'',fecha:new Date().toISOString().slice(0,10),periodo:'hora',disp:60,obj:'',acts:[],ops:[],assign:{},estado:'Abierto'};DS.view='info';DS.sel=null;DS.scen=1;DS.run=null;}
function dsCur(){const d=DS.d;return dsCalc(d.acts,d.ops,d.assign,d.obj,d.disp,1);}
function dsPal(acts){return palette(acts.map(a=>({id:a.id,nec:a.va!==false})));}
function dsName(a,i){return a.name||('Actividad '+(i+1));}

function vDSList(){
  setHead('Delay Study',[['Estudios','estudios'],['Delay Study','ds']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Estudios de Delay Study</h2><p class="sub">Ocupación de operadores en actividades no cíclicas</p></div>
    <button class="btn orange" type="button" data-dsnew="1">${svg('plus',18,2.2)} Nuevo estudio</button></div>
    <div class="grid" style="margin-top:18px">
    ${DS.studies.map(st=>{const r=dsCalc(st.acts,st.ops,st.assign,st.obj,st.disp,1);return `<button type="button" class="study" data-dsopen="${st.id}">
      <div class="logo" style="background:rgba(194,65,12,.1);color:var(--orange)" aria-hidden="true">DS</div>
      <div class="meta"><b>${esc(st.titulo)} <span class="tag ${st.estado==='Cerrado'?'':'on'}" style="vertical-align:2px;margin-left:6px">${st.estado==='Cerrado'?'FINALIZADO':'EN PROCESO'}</span></b><span>${esc(st.area||'—')} · ${esc(st.fecha)} · ${esc(st.observador||'—')} · ${st.acts.length} actividades · ${st.ops.length} operador${st.ops.length!==1?'es':''}</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:var(--blue)">${st.ops.length?pc(r.avgOcc):'—'}</span><br><span style="font-size:12px;color:var(--muted)">ocupación promedio</span></div>
      ${svg('next',20,2)}</button>`}).join('')}
    ${DS.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${svg('list',30)}</div><b style="font-size:17px">Aún no hay estudios</b><p>Toca <b>Nuevo estudio</b> para crear el primero.</p></div>`}
    </div></section>`;
}

function dsSteps(){
  const L=[['info','Información'],['crono','Cronometraje'],['asig','Asignación'],['res','Resultados']];const idx=L.findIndex(x=>x[0]===DS.view);
  return `<nav class="steps" aria-label="Pasos del estudio">${L.map(([v,l],i)=>`<button type="button" class="step ${i<idx?'done':''}" data-dsv="${v}" ${i>idx?'disabled title="Usa el botón de continuar"':''} ${i===idx?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;
}
const dsFoot=(l,r)=>`<div class="row" style="margin-top:22px">${l||'<span></span>'}<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">${r||''}</div></div>`;
const perLbl=d=>({hora:'hora',turno:'turno',dia:'día',otro:'periodo'})[d.periodo];

function dsActRow(a,i,d){
  const pz=(+a.racks||0)*(+a.snp||0);const pp=dsPerPiece(a,d.acts);const un=dsUnlinked(a);
  const trips=d.acts.filter(x=>x.id!==a.id&&(+x.racks||0)*(+x.snp||0)>0);
  return `<div class="dsrow ${a.va===false?'inn':''}" id="dsr${a.id}">
    <div class="dshead"><span class="mono opn">${i+1}</span>
      <label class="dstime"><span>Tiempo (min)</span><input type="number" step="0.01" min="0" inputmode="decimal" data-dsf="min" data-id="${a.id}" value="${f2(a.secs/60)}"></label>
      <span class="sub mono" style="margin:0">${mm(a.secs)}</span>
      <span style="flex:1"></span>
      <div class="seg2" role="group" aria-label="Valor de la actividad ${i+1}"><button type="button" data-dsva="${a.id}" data-v="1" aria-pressed="${a.va!==false}">Agrega valor</button><button type="button" data-dsva="${a.id}" data-v="0" aria-pressed="${a.va===false}">No agrega</button></div>
      <button type="button" class="iconbtn" data-dsdel="${a.id}" aria-label="Quitar actividad ${i+1}">${svg('trash',18)}</button></div>
    <div class="dsgrid">
      <label class="wide">Actividad<input list="dlActs" data-dsf="name" data-id="${a.id}" value="${esc(a.name)}" placeholder="Ej. Trasladar piezas"></label>
      <label>Material<input list="dlMats" data-dsf="material" data-id="${a.id}" value="${esc(a.material)}" placeholder="Ej. Cascarones"></label>
      <label>Carritos / racks<input type="number" min="0" inputmode="numeric" data-dsf="racks" data-id="${a.id}" value="${esc(a.racks)}"></label>
      <label>SNP (pzs por rack)<input type="number" min="0" inputmode="numeric" data-dsf="snp" data-id="${a.id}" value="${esc(a.snp)}"></label>
      <label>No. de parte<input data-dsf="parte" data-id="${a.id}" value="${esc(a.parte)}"></label>
      <div class="dspp"><span>Min por pieza</span><b class="mono" id="pp${a.id}">${pz>0||!un?f2(pp):'—'}</b></div>
    </div>
    ${pz<=0?`<div class="dslink ${un?'warn':''}"><label>Sin piezas en esta vuelta (regreso vacío). ¿A qué traslado pertenece?
      <select data-dslink="${a.id}"><option value="">— Elegir traslado —</option>${trips.map(t=>`<option value="${t.id}" ${a.linkTo===t.id?'selected':''}>${d.acts.indexOf(t)+1}. ${esc(dsName(t,d.acts.indexOf(t)))}</option>`).join('')}</select></label>
      ${un?'<span>Si no la ligas, su tiempo no cuenta en la ocupación.</span>':''}</div>`:''}
  </div>`;
}

function dsYama(r,acts,pal){
  const ymax=Math.max(r.disp*1.15,...r.rows.map(x=>x.load*1.08),1);const L=r.disp/ymax;
  return `<div class="yama" role="img" aria-label="Yamazumi: carga por operador contra tiempo disponible">
    <div class="ylim" style="top:calc(26px + 280px * ${1-L})"><span>${f2(r.disp)} min disponibles</span></div>
    ${r.rows.map(x=>`<div class="ycol ${x.occ>1?'over':''}">
      <span class="yocc mono">${pc(x.occ)}</span>
      <div class="yb"><div class="ybar">${x.items.filter(it=>it.load>0).map(it=>{const a=acts.find(z=>z.id===it.id);const i=acts.indexOf(a);return `<div class="vfill" data-h="${it.load/ymax*100}" title="${esc(dsName(a,i))}: ${f2(it.load)} min" style="background:${pal[a.id]}"></div>`;}).join('')}</div></div>
      <span class="yname">${esc(x.name)}</span><span class="yfree mono" style="color:${x.free<0?'var(--orange)':'var(--muted)'}">${x.free<0?'excede '+f2(-x.free):'libre '+f2(x.free)} min</span></div>`).join('')}
  </div>`;
}

function vDS(){
  if(!DS.d)dsNew();const d=DS.d;const tit=d.titulo||'Nuevo estudio';
  const base=[['Estudios','estudios'],['Delay Study','ds']];
  setHead(tit,[...base,[tit,'ds-nuevo']]);
  const del=d.estado&&DS.studies.includes(d)?`<button class="btn danger sm" type="button" data-dsdelstudy="1">${svg('trash',16,2)} Eliminar estudio</button>`:'';
  let body='';
  if(DS.view==='info'){
    body=`<div class="row"><div><h2>Información del estudio</h2><p class="sub">Lo que va arriba de tu hoja · el tiempo disponible y el objetivo son el estándar para todos los operadores</p></div>${del}</div>
    <form class="form" id="dsh" style="margin-top:18px" onsubmit="return false">
      <label style="grid-column:1/-1">Título<input name="titulo" value="${esc(d.titulo)}" placeholder="Ej. Análisis de ensamble 1"></label>
      <label>Observador<input name="observador" value="${esc(d.observador)}" placeholder="Nombre"></label>
      <label>Área de análisis<input name="area" value="${esc(d.area)}" placeholder="Ej. Ensamble de poleas"></label>
      <label>Fecha<input type="date" name="fecha" value="${esc(d.fecha)}"></label>
    </form>
    <div style="margin-top:22px"><b style="font-size:17px">Periodo de análisis</b><p class="sub">¿Contra qué tiempo se mide la ocupación?</p></div>
    <div class="chips" style="margin-top:12px" role="group" aria-label="Periodo">${PERIODS.map(([k,l,m])=>`<button type="button" class="chip" data-dsper="${k}" aria-pressed="${d.periodo===k}"><span>${l}</span>${m?`<span class="mono">${m} min</span>`:''}</button>`).join('')}</div>
    <div class="form" style="margin-top:14px">
      <label>Tiempo disponible (min por ${perLbl(d)})<input type="number" min="1" inputmode="decimal" data-dsg="disp" value="${esc(d.disp)}"></label>
      <label>Objetivo (piezas por ${perLbl(d)})<input type="number" min="0" inputmode="decimal" data-dsg="obj" value="${esc(d.obj)}" placeholder="Ej. 6"></label>
    </div>
    ${dsFoot(`<button class="btn ghost" type="button" data-go="ds">${svg('back',18,2.2)} ${DS.studies.includes(d)?'Lista de estudios':'Cancelar'}</button>`,`<button class="btn" type="button" data-dsv="crono" data-need="info">Continuar a cronometraje ${svg('next',18,2.2)}</button>`)}`;
  }
  if(DS.view==='crono'){
    const names=[...new Set(DS.studies.flatMap(s=>s.acts).concat(d.acts).map(a=>a.name).filter(Boolean))];
    const mats=[...new Set(DS.studies.flatMap(s=>s.acts).concat(d.acts).map(a=>a.material).filter(Boolean))];
    body=`<div class="row"><div><h2>Cronometraje</h2><p class="sub">Cada toque a "Siguiente actividad" cierra la actual y arranca la nueva. Los datos los llenas cuando tengas las manos libres.</p></div>${del}</div>
    <div class="clock ${DS.run?'on':''}">
      <div><span class="sub" style="margin:0">${DS.run?'Actividad '+(d.acts.length+1)+' en curso':'Cronómetro detenido'}</span><div class="mono big" id="dsclock">${DS.run?mm((Date.now()-DS.run)/1000):'00:00.0'}</div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${DS.run?`<button class="btn ghost" type="button" data-dsstop="1">Terminar</button><button class="btn lapbtn" type="button" data-dslap="1">Siguiente actividad ${svg('next',20,2.4)}</button>`
              :`<button class="btn orange lapbtn" type="button" data-dsstart="1">${svg('estudios',20,2.2)} ${d.acts.length?'Reanudar cronómetro':'Iniciar cronómetro'}</button>`}
      </div></div>
    <datalist id="dlActs">${names.map(n=>`<option value="${esc(n)}">`).join('')}</datalist><datalist id="dlMats">${mats.map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
    <div class="grid" style="margin-top:16px;gap:12px">${d.acts.map((a,i)=>dsActRow(a,i,d)).join('')}</div>
    <button class="btn ghost" type="button" data-dsadd="1" style="margin-top:12px">${svg('plus',18,2.2)} Agregar actividad a mano</button>
    ${dsFoot(`<button class="btn ghost" type="button" data-dsv="info">${svg('back',18,2.2)} Información</button>`,`<button class="btn" type="button" data-dsv="asig" data-need="crono" ${d.acts.length&&!DS.run?'':'disabled'}>Continuar a asignación ${svg('next',18,2.2)}</button>`)}
    ${DS.run?'<p class="sub" style="text-align:right">Termina el cronómetro para continuar.</p>':''}`;
  }
  if(DS.view==='asig'){
    const r=dsCur();const pal=dsPal(d.acts);const sel=DS.sel;
    const chip=a=>{const i=d.acts.indexOf(a);const pp=dsPerPiece(a,d.acts);return `<button type="button" class="achip ${sel===a.id?'sel':''} ${a.va===false?'inn':''}" data-dssel="${a.id}" aria-pressed="${sel===a.id}">
      <i style="background:${pal[a.id]}"></i><span class="an">${i+1}. ${esc(dsName(a,i))}${dsUnlinked(a)?' ⚠':''}</span><span class="mono">${f2(pp*(+d.obj||0))} min</span></button>`;};
    const pool=d.acts.filter(a=>!d.ops.some(o=>o.id===d.assign[a.id]));
    const moveBtn=(target,label)=>sel!=null&&d.assign[sel]!==target?`<button type="button" class="btn sm movebtn" data-dsmove="${target}">${svg('next',16,2.2)} ${label}</button>`:'';
    body=`<div class="row"><div><h2>Asignación y balanceo</h2><p class="sub">Toca una actividad y luego <b>Mover aquí</b> en el operador destino. La ocupación se recalcula al instante.</p></div>${del}</div>
    <div class="chips" style="margin-top:12px"><span class="chip" style="cursor:default">Disponible <span class="mono">${f2(+d.disp)} min</span></span><span class="chip" style="cursor:default">Objetivo <span class="mono">${esc(d.obj||0)} pzs/${perLbl(d)}</span></span>${sel!=null?`<button type="button" class="chip" data-dssel="${sel}">Cancelar selección</button>`:''}</div>
    <div class="board">
      <div class="lane pool"><div class="lanehead"><b>Sin asignar</b><span class="sub" style="margin:0">${pool.length} actividad${pool.length!==1?'es':''}</span></div>
        ${moveBtn('none','Quitar de su operador')}
        <div class="lanebody">${pool.map(chip).join('')||'<p class="sub">Todas las actividades están asignadas.</p>'}</div></div>
      ${d.ops.map(o=>{const x=r.rows.find(y=>y.id===o.id);const w=Math.min(x.occ,1.5)/1.5*100;return `<div class="lane ${x.occ>1?'over':''}">
        <div class="lanehead"><input data-dsopname="${o.id}" value="${esc(o.name)}" aria-label="Nombre del operador"><button type="button" class="iconbtn" data-dsopdel="${o.id}" aria-label="Quitar operador">${svg('trash',16)}</button></div>
        <div class="occ"><div class="occbar"><div style="width:${w}%;background:${x.occ>1?'var(--orange)':'var(--blue)'}"></div><span style="left:${100/1.5}%"></span></div><span class="mono" style="color:${x.occ>1?'var(--orange)':'var(--ink)'}">${pc(x.occ)}</span></div>
        <span class="sub" style="margin:0">${f2(x.load)} de ${f2(+d.disp)} min · ${x.free<0?'excede '+f2(-x.free):'libre '+f2(x.free)}</span>
        ${moveBtn(o.id,'Mover aquí')}
        <div class="lanebody">${d.acts.filter(a=>d.assign[a.id]===o.id).map(chip).join('')||'<p class="sub">Sin actividades.</p>'}</div></div>`;}).join('')}
      <button type="button" class="lane addlane" data-dsopadd="1">${svg('plus',26,2)}<b>Agregar operador</b></button>
    </div>
    ${dsFoot(`<button class="btn ghost" type="button" data-dsv="crono">${svg('back',18,2.2)} Cronometraje</button>`,`<button class="btn" type="button" data-dsv="res" data-need="asig" ${d.ops.length?'':'disabled'}>Ver resultados ${svg('next',18,2.2)}</button>`)}`;
  }
  if(DS.view==='res'){
    const r=dsCalc(d.acts,d.ops,d.assign,d.obj,d.disp,DS.scen);const pal=dsPal(d.acts);const over=r.rows.filter(x=>x.occ>1).length;
    const unl=d.acts.filter(dsUnlinked).length;
    body=`<div class="row"><div><h2>Resultados</h2><p class="sub">Yamazumi: carga de cada operador contra el tiempo disponible del ${perLbl(d)}</p></div>${del}</div>
    <div class="row" style="margin-top:14px"><div><b>Escenario de demanda</b><p class="sub">Objetivo actual ${esc(d.obj||0)} pzs → ${f2(r.obj)} pzs por ${perLbl(d)}</p></div>
      <div class="chips" role="group" aria-label="Escenario de demanda">${SCEN.map(([f,l])=>`<button type="button" class="chip" data-dsscen="${f}" aria-pressed="${DS.scen===f}"><span>${l}</span></button>`).join('')}</div></div>
    ${unl?`<div class="dslink warn" style="margin-top:12px"><span>⚠ ${unl} actividad${unl>1?'es':''} sin piezas no está${unl>1?'n':''} ligada${unl>1?'s':''} a un traslado y no cuenta${unl>1?'n':''} en la ocupación. Revísalas en Cronometraje.</span></div>`:''}
    <div class="kpis" style="margin-top:16px">
      <div class="kpi"><span>Ocupación promedio</span><span class="v" style="color:var(--blue)">${pc(r.avgOcc,1)}</span><span class="sub">${d.ops.length} operador${d.ops.length!==1?'es':''}</span></div>
      <div class="kpi"><span>Personal requerido teórico</span><span class="v">${r.needed.toFixed(2)}</span><span class="sub">carga total ÷ tiempo disponible</span></div>
      <div class="kpi"><span>Operadores arriba de 100 %</span><span class="v" style="color:${over?'var(--orange)':'var(--blue)'}">${over}</span><span class="sub">${over?'hay que rebalancear':'todos dentro del tiempo'}</span></div>
      <div class="kpi"><span>Carga total</span><span class="v">${f2(r.total)}</span><span class="sub">min por ${perLbl(d)}</span></div>
    </div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><div class="row"><b style="font-size:16px">Carga por operador</b>
      <div class="legend"><span><i style="background:var(--blue)"></i>Agrega valor</span><span><i style="background:var(--orange)"></i>No agrega valor</span><span><i style="background:#DC2626;height:3px;vertical-align:3px"></i>Tiempo disponible</span></div></div>
      ${dsYama(r,d.acts,pal)}
      <div class="legend" style="margin-top:14px">${d.acts.filter(a=>d.ops.some(o=>o.id===d.assign[a.id])).map(a=>`<span><i style="background:${pal[a.id]}"></i>${d.acts.indexOf(a)+1}. ${esc(dsName(a,d.acts.indexOf(a)))}</span>`).join('')}</div></div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Detalle por operador</b>
      <div class="tbl"><table><thead><tr><th>Operador</th><th>Actividad</th><th>Material</th><th>Min/pza</th><th>Carga (min)</th><th>% del disponible</th></tr></thead><tbody>
      ${r.rows.map(x=>x.items.map((it,k)=>{const a=d.acts.find(z=>z.id===it.id);return `<tr class="${a.va===false?'':''}">${k===0?`<th rowspan="${x.items.length+1}">${esc(x.name)}</th>`:''}<td style="text-align:left;font-family:inherit" class="${a.va===false?'hinn':''}">${esc(dsName(a,d.acts.indexOf(a)))}</td><td style="font-family:inherit">${esc(a.material||'—')}</td><td>${f2(it.pp)}</td><td>${f2(it.load)}</td><td>${pc(r.disp?it.load/r.disp:0,1)}</td></tr>`;}).join('')+`<tr class="trow">${x.items.length?'':`<th>${esc(x.name)}</th>`}<td style="text-align:left;font-family:inherit;font-weight:600">Total</td><td></td><td></td><td style="font-weight:600">${f2(x.load)}</td><td style="font-weight:600;color:${x.occ>1?'var(--orange)':'var(--blue)'}">${pc(x.occ,1)}</td></tr>`).join('')}
      </tbody></table></div></div>
    ${dsFoot(`<button class="btn ghost" type="button" data-dsv="asig">${svg('back',18,2.2)} Rebalancear</button>`,`<button class="btn orange" type="button" data-dsfinish="1">Finalizar estudio</button>`)}`;
  }
  return `${dsSteps()}<section class="glass panel ${S.keep?'':'view'}">${body}</section>`;
}

// ---- eventos Delay Study ----
function dsSync(){const f=document.getElementById('dsh');if(f&&DS.d)new FormData(f).forEach((v,k)=>DS.d[k]=v);}
setInterval(()=>{if(DS.run){const el=document.getElementById('dsclock');if(el)el.textContent=mm((Date.now()-DS.run)/1000);}},100);
function dsLap(){const now=Date.now();DS.d.acts.push({id:nid(),secs:(now-DS.run)/1000,name:'',material:'',racks:'',snp:'',parte:'',va:true,linkTo:null});DS.run=now;}
document.addEventListener('click',e=>{
  if(e.target.classList&&e.target.classList.contains('mback'))return;
  const t=e.target.closest('button');if(!t||t.disabled)return;const d=DS.d;const D=t.dataset;
  if(D.dsnew){dsNew();go('ds-nuevo');return;}
  if(D.dsopen){DS.d=DS.studies.find(x=>x.id==D.dsopen);DS.view='res';DS.sel=null;DS.scen=1;DS.run=null;if(!DS.d.ops.length)DS.view='crono';go('ds-nuevo');return;}
  if(!d)return;
  if(D.dsv){dsSync();const v=D.dsv;
    if(D.need==='info'){if(!d.titulo)d.titulo='Estudio sin título';if(!DS.studies.includes(d))DS.studies.unshift(d);}
    if(v==='asig'&&!d.ops.length){const op={id:nid(),name:'Operador 1'};d.ops.push(op);d.acts.forEach(a=>{if(d.assign[a.id]==null)d.assign[a.id]=op.id;});}
    if(v!=='asig')DS.sel=null;
    DS.view=v;render();return;}
  if(D.dsper){dsSync();d.periodo=D.dsper;const p=PERIODS.find(x=>x[0]===D.dsper);if(p[2])d.disp=p[2];render(true);return;}
  if(D.dsstart){DS.run=Date.now();S.keep=true;render(true);S.keep=false;return;}
  if(D.dslap){dsLap();S.keep=true;render(true);S.keep=false;const r=document.getElementById('dsr'+d.acts[d.acts.length-1].id);if(r)r.classList.add('pulse');return;}
  if(D.dsstop){dsLap();DS.run=null;S.keep=true;render(true);S.keep=false;return;}
  if(D.dsadd){d.acts.push({id:nid(),secs:0,name:'',material:'',racks:'',snp:'',parte:'',va:true,linkTo:null});S.keep=true;render(true);S.keep=false;return;}
  if(D.dsdel){const id=+D.dsdel;const a=d.acts.find(x=>x.id===id);ask('¿Quitar esta actividad?','Se borra «'+(a.name||'Actividad')+'» y su tiempo de '+f2(a.secs/60)+' min.','Quitar actividad',()=>{d.acts=d.acts.filter(x=>x.id!==id);d.acts.forEach(x=>{if(x.linkTo===id)x.linkTo=null;});delete d.assign[id];S.keep=true;render(true);S.keep=false;});return;}
  if(D.dsva){const a=d.acts.find(x=>x.id==D.dsva);a.va=D.v==='1';S.keep=true;render(true);S.keep=false;return;}
  if(D.dssel){const id=+D.dssel;DS.sel=DS.sel===id?null:id;S.keep=true;render(true);S.keep=false;return;}
  if(D.dsmove){if(DS.sel!=null){d.assign[DS.sel]=D.dsmove==='none'?null:+D.dsmove;DS.sel=null;}S.keep=true;render(true);S.keep=false;return;}
  if(D.dsopadd){d.ops.push({id:nid(),name:'Operador '+(d.ops.length+1)});S.keep=true;render(true);S.keep=false;return;}
  if(D.dsopdel){const id=+D.dsopdel;const o=d.ops.find(x=>x.id===id);ask('¿Quitar a '+o.name+'?','Sus actividades regresan a "Sin asignar". No se borra ningún tiempo.','Quitar operador',()=>{d.ops=d.ops.filter(x=>x.id!==id);Object.keys(d.assign).forEach(k=>{if(d.assign[k]===id)d.assign[k]=null;});render(true);});return;}
  if(D.dsscen){DS.scen=+D.dsscen;S.keep=true;render(true);S.keep=false;return;}
  if(D.dsdelstudy){ask('¿Eliminar este estudio?','Se borra «'+(d.titulo||'Estudio')+'» con todas sus actividades y operadores. No se puede deshacer.','Eliminar estudio',()=>{DS.studies=DS.studies.filter(x=>x!==d);DS.d=null;DS.run=null;go('ds');});return;}
  if(D.dsfinish){d.estado='Cerrado';DS.d=null;DS.run=null;go('ds');return;}
});
document.addEventListener('input',e=>{
  const el=e.target;const d=DS.d;if(!d)return;
  if(el.closest&&el.closest('#dsh')){dsSync();return;}
  if(el.dataset.dsg){d[el.dataset.dsg]=el.value;return;}
  if(el.dataset.dsopname){const o=d.ops.find(x=>x.id==el.dataset.dsopname);if(o)o.name=el.value;return;}
  if(el.dataset.dsf){const a=d.acts.find(x=>x.id==el.dataset.id);if(!a)return;const f=el.dataset.dsf;
    if(f==='min')a.secs=(parseFloat(el.value)||0)*60;else a[f]=el.value;
    const p=document.getElementById('pp'+a.id);if(p){const pz=(+a.racks||0)*(+a.snp||0);p.textContent=pz>0||!dsUnlinked(a)?f2(dsPerPiece(a,d.acts)):'—';}}
});
document.addEventListener('change',e=>{
  const el=e.target;const d=DS.d;if(!d)return;
  if(el.dataset.dslink){const a=d.acts.find(x=>x.id==el.dataset.dslink);a.linkTo=el.value?+el.value:null;S.keep=true;render(true);S.keep=false;return;}
  if(el.dataset.dsf==='racks'||el.dataset.dsf==='snp'){S.keep=true;render(true);S.keep=false;}
});
