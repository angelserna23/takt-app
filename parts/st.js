// ================= SPEED TRIAL =================
const ST_EXAMPLE=[[1.4, "5"], [1.2, ""], [1.23, "2"], [1.2, ""], [0.98, ""], [0.96, ""], [1.39, "6"], [1.42, "2"], [1.2, ""], [1.32, "12"], [1.6, "1"], [1.2, ""], [1, ""], [2, "14"], [1.43, "10"], [0.87, ""], [0.903, ""], [1.23, "8"], [1.2, ""], [1.19, ""], [1.57, "6"], [1.32, "9"], [0.96, ""], [1.42, "2"], [1.6, "5"], [0.87, ""], [1.23, "10"], [1.42, "3"], [1.32, "6"], [1.2, ""], [0.903, ""], [1.57, "12"], [0.96, ""], [1.4, "5"], [1.2, "2"], [1.23, "6"], [1.2, "2"], [0.98, "12"], [0.96, "1"], [1.39, "14"], [1.42, "10"], [1.2, "8"], [1.32, "6"], [1.6, "9"], [1.2, "2"], [1, "5"], [2, "10"], [1.43, "3"], [0.87, "6"], [0.903, "12"], [1.23, "5"], [1.2, "2"], [1.19, "6"], [1.57, "2"], [1.32, "12"], [0.96, "1"], [1.42, "14"], [1.6, "10"], [0.87, "8"], [1.23, "6"], [1.42, "9"], [1.32, "2"], [1.2, "5"], [0.903, "10"], [1.57, "3"], [0.96, "6"], [1.4, "12"], [1.2, ""], [1.23, "9"], [1.2, "10"], [0.98, "3"], [0.96, "5"], [1.39, "2"], [1.42, "12"], [1.2, "14"], [1.32, "10"], [1.6, "9"], [1.2, "10"], [1, "3"], [2, "5"], [1.43, "2"], [0.87, "12"], [0.903, "14"], [1.23, "10"], [1.2, "6"], [1.19, "9"], [1.57, "2"], [1.32, "3"], [0.96, "12"], [1.42, "10"], [1.6, "9"], [0.87, "5"], [1.23, "2"], [1.42, "10"], [1.32, "2"], [1.2, ""], [0.903, ""], [1.57, "5"], [0.96, ""]];   // 99 registros ficticios del Excel de Angel (para validar)
const ST={studies:[],d:null,view:'info',run:null,cur:{cause:'',prob:''},miss:[]};
const ST_REQ=[['parte','No. de parte'],['proceso','Nombre del proceso'],['modelo','Nombre del modelo'],['costo','Costo unitario'],['tcobj','Tiempo ciclo objetivo'],['analista','Nombre del analista'],['periodo','Periodo de análisis']];
const stName=d=>[d.proceso,d.modelo].filter(Boolean).join(' · ')||'Nuevo Speed Trial';
const money=x=>'$'+Math.round(x).toLocaleString('es-MX');
function stNew(){const now=new Date();ST.d={id:nid(),parte:'',proceso:'',modelo:'',costo:'',tcobj:'',analista:'',periodo:now.toISOString().slice(0,10),paro:'0',
  fecha:now.toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'}),recs:[],estado:'Abierto'};ST.view='info';ST.run=null;ST.cur={cause:'',prob:''};ST.miss=[];}
function stC(d){return stCalc(d.recs,d.tcobj,d.paro);}
const causeLbl=c=>c?c+'. '+ST_CAUSES[+c-1]:'—';

function vSTList(){
  setHead('Speed Trial',[['Estudios','estudios'],['Speed Trial','st']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Estudios de Speed Trial</h2><p class="sub">Velocidad real de la línea contra el objetivo: OEE, pérdidas y costo</p></div>
    <button class="btn orange" type="button" data-stnew="1">${svg('plus',18,2.2)} Nuevo estudio</button></div>
    <div class="grid" style="margin-top:18px">
    ${ST.studies.map(st=>{const r=stC(st);return `<button type="button" class="study" data-stopen="${st.id}">
      <div class="logo" style="background:rgba(29,95,168,.12);color:var(--blue)" aria-hidden="true">ST</div>
      <div class="meta"><b>${esc(stName(st))} <span class="tag ${st.estado==='Cerrado'?'':'on'}" style="vertical-align:2px;margin-left:6px">${st.estado==='Cerrado'?'FINALIZADO':'EN PROCESO'}</span></b><span>No. parte ${esc(st.parte||'—')} · ${esc(st.periodo)} · ${esc(st.analista||'—')} · ${r.N} piezas</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:var(--blue)">${r.N?pc(r.oee,1):'—'}</span><br><span style="font-size:12px;color:var(--muted)">OEE</span></div>
      ${svg('next',20,2)}</button>`}).join('')}
    ${ST.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${svg('list',30)}</div><b style="font-size:17px">Aún no hay estudios</b><p>Toca <b>Nuevo estudio</b> para crear el primero.</p></div>`}
    </div></section>`;
}

function stSteps(){const L=[['info','Información'],['reg','Registro'],['res','Resultados']];const idx=L.findIndex(x=>x[0]===ST.view);
  return `<nav class="steps" style="grid-template-columns:repeat(3,minmax(0,1fr))" aria-label="Pasos del estudio">${L.map(([v,l],i)=>`<button type="button" class="step ${i<idx?'done':''}" data-stv="${v}" ${i>idx?'disabled title="Usa el botón de continuar"':''} ${i===idx?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;}

function stStats(r){return `<div class="ststats">
  <div><span>Muestras</span><b class="mono">${r.N}</b></div>
  <div><span>TC real (promedio)</span><b class="mono">${r.N?f2(r.tcReal):'—'}</b></div>
  <div><span>Tiempo registrado</span><b class="mono">${f2(r.T)}</b></div>
  <div><span>Máx / mín T.T</span><b class="mono">${r.N?f2(r.max)+' / '+f2(r.min):'—'}</b></div>
  <div><span>Piezas OK / NG</span><b class="mono">${r.ok} / <span style="color:var(--orange)">${r.def}</span></b></div></div>`;}

function vST(){
  if(!ST.d)stNew();const d=ST.d;const r=stC(d);const tit=stName(d);
  setHead(tit,[['Estudios','estudios'],['Speed Trial','st'],[tit,'st-nuevo']]);
  const del=ST.studies.includes(d)?`<button class="btn danger sm" type="button" data-stdel="1">${svg('trash',16,2)} Eliminar estudio</button>`:'';
  const f=(k,l,ph,extra='')=>`<label class="${ST.miss.includes(k)?'miss':''}">${l} <span class="req" aria-hidden="true">*</span><input name="${k}" value="${esc(d[k])}" placeholder="${ph}" ${extra} aria-required="true"></label>`;
  let body='';
  if(ST.view==='info'){
    body=`<div class="row"><div><h2>Información complementaria</h2><p class="sub">Los campos con * son obligatorios. Lo demás lo calcula la app con el registro.</p></div>${del}</div>
    <form class="form" id="sth" style="margin-top:18px" onsubmit="return false">
      ${f('parte','No. de parte','Ej. 00000-XXXX')}${f('proceso','Nombre del proceso','Ej. Ensamble')}${f('modelo','Nombre del modelo','Ej. MOD-01')}
      ${f('costo','Costo unitario ($)','Ej. 250','inputmode="decimal"')}${f('tcobj','Tiempo ciclo objetivo (min)','Ej. 1.20','inputmode="decimal"')}${f('analista','Nombre del analista','Nombre')}
      ${f('periodo','Periodo de análisis','Ej. 2026-11-10 turno 1')}
      <label>Paro programado (min)<input name="paro" value="${esc(d.paro)}" inputmode="decimal" placeholder="0"></label>
    </form>
    ${ST.miss.length?`<div class="dslink warn" style="margin-top:12px"><span>Faltan: ${ST.miss.map(k=>ST_REQ.find(x=>x[0]===k)[1]).join(', ')}.</span></div>`:''}
    <div style="margin-top:22px"><b style="font-size:17px">Calculado automáticamente</b><p class="sub">Fecha del estudio: ${esc(d.fecha)} · se llena con el registro</p></div>
    ${stStats(r)}
    ${dsFoot(`<button class="btn ghost" type="button" data-go="st">${svg('back',18,2.2)} ${ST.studies.includes(d)?'Lista de estudios':'Cancelar'}</button>`,`<button class="btn" type="button" data-stv="reg" data-stneed="info">Continuar al registro ${svg('next',18,2.2)}</button>`)}`;
  }
  if(ST.view==='reg'){
    const To=num(d.tcobj);const n=d.recs.length;
    body=`<div class="row"><div><h2>Registro de tiempos</h2><p class="sub">Un registro por pieza. Si hubo pérdida, marca la causa antes de cerrar la pieza (o corrígela después en la tabla).</p></div>
      <button class="btn" type="button" data-stv="res" data-stneed="reg" ${n&&!ST.run?'':'disabled'}>Ver resultados ${svg('next',18,2.2)}</button></div>
    ${stStats(r)}
    <div class="clock ${ST.run?'on':''}"><div class="clockrow">
      <div><span class="sub" style="margin:0">${ST.run?'Pieza '+(n+1)+' en curso':'Cronómetro detenido'} · objetivo ${f2(To)} min</span>
        <div class="big"><span class="mono" id="stclock">${ST.run?((Date.now()-ST.run)/60000).toFixed(2):'0.00'}</span><span class="mono" style="font-size:22px;margin-left:8px;color:var(--ink2)">min</span></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${ST.run?`<button class="btn ghost" type="button" data-stpause="1">Pausar</button><button class="btn lapbtn" type="button" data-stlap="1">Pieza terminada ${svg('next',20,2.4)}</button>`
          :`<button class="btn orange lapbtn" type="button" data-ststart="1">${svg('estudios',20,2.2)} ${n?'Reanudar cronómetro':'Iniciar cronómetro'}</button>`}
      </div></div>
      <div class="curcard"><div class="row"><b>Causa de pérdida de esta pieza</b><span class="sub" style="margin:0">${ST.cur.cause?causeLbl(ST.cur.cause):'Sin pérdida'}</span></div>
        <div class="causes">${ST_CAUSES.map((c,i)=>`<button type="button" class="cz ${i>=12?'q':''}" data-stcause="${i+1}" aria-pressed="${ST.cur.cause===String(i+1)}"><span class="mono">${i+1}</span>${c}</button>`).join('')}
          <button type="button" class="cz none" data-stcause="" aria-pressed="${!ST.cur.cause}">Sin pérdida</button></div>
        <label class="form" style="display:block;margin-top:10px"><span style="display:block;font-size:12px;font-weight:600;color:var(--ink2);margin-bottom:5px">Problema encontrado (opcional)</span><input id="stprob" data-stcurprob="1" value="${esc(ST.cur.prob)}" placeholder="Ej. Sensor de la estación 3 no detecta pieza" style="width:100%"></label>
      </div></div>
    <div class="row" style="margin-top:22px"><div><b style="font-size:17px">Registros</b><p class="sub">${n} pieza${n!==1?'s':''} · la más reciente arriba · puedes corregir tiempo, causa y problema</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${n?'':`<button class="btn ghost sm" type="button" data-stexample="1">Cargar ejemplo (99 registros del Excel)</button>`}<button class="btn ghost sm" type="button" data-stadd="1">${svg('plus',16,2.2)} Agregar a mano</button></div></div>
    <div class="tbl strec"><table><thead><tr><th>No.</th><th>Tiempo (min)</th><th>Target</th><th>GAP vs TC</th><th style="text-align:left">Pérdida</th><th style="text-align:left">Problema encontrado</th><th>Cumplimiento</th><th>Pieza OK</th><th></th></tr></thead><tbody>
    ${d.recs.map((x,i)=>{const t=num(x.t);const g=t-To;const okp=!stIsDef(x.cause);return `<tr>
      <td class="mono">${i+1}</td><td><input type="text" inputmode="decimal" data-strt="${x.id}" value="${f2(t)}"></td><td class="mono">${f2(To)}</td>
      <td class="mono" style="color:${g>0?'var(--orange)':'var(--blue)'}">${g>0?'+':''}${f2(g)}</td>
      <td style="text-align:left"><select data-strc="${x.id}" aria-label="Pérdida del registro ${i+1}"><option value="">—</option>${ST_CAUSES.map((c,k)=>`<option value="${k+1}" ${x.cause===String(k+1)?'selected':''}>${k+1}. ${c}</option>`).join('')}</select></td>
      <td style="text-align:left"><input data-strp="${x.id}" value="${esc(x.prob||'')}" style="width:220px;text-align:left"></td>
      <td><span class="stag ${g>0?'cnt':'ok'}">${g>0?'N/G':'OK'}</span></td><td class="mono">${okp?'1':'—'}</td>
      <td><button type="button" class="iconbtn" data-strdel="${x.id}" aria-label="Quitar registro ${i+1}">${svg('trash',16)}</button></td></tr>`;}).reverse().join('')}
    </tbody></table></div>
    ${dsFoot(`<button class="btn ghost" type="button" data-stv="info">${svg('back',18,2.2)} Información</button>`,del)}`;
  }
  if(ST.view==='res'){
    const lines=[['Tiempo productivo (TC objetivo × piezas OK)',r.va,'var(--blue)']].concat(Object.entries(r.loss).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[causeLbl(k),v,stIsDef(k)?'#9A3412':'var(--orange)']));
    const mx=Math.max(...lines.map(l=>l[1]),Math.abs(r.gain),0.0001);
    body=`<div class="row"><div><h2>Resultados (preliminar)</h2><p class="sub">OEE y balance de tiempo. Gráficas, Pareto, caída de JPH y costos llegan con las siguientes partes.</p></div>${del}</div>
    <div class="kpis" style="margin-top:16px">
      <div class="kpi"><span>OEE</span><span class="v" style="color:${r.oee>=0.85?'var(--blue)':'var(--orange)'}">${pc(r.oee,1)}</span><span class="sub">TC objetivo × piezas OK ÷ tiempo registrado</span></div>
      <div class="kpi"><span>JPH real</span><span class="v">${f2(r.jphReal)}</span><span class="sub">objetivo ${f2(r.jphObj)} (100 %) · ${f2(r.jph85)} (85 %)</span></div>
      <div class="kpi"><span>TC real vs objetivo</span><span class="v">${f2(r.tcReal)}</span><span class="sub">objetivo ${f2(num(d.tcobj))} min · promedio de ${r.N} ciclos</span></div>
      <div class="kpi"><span>Piezas OK / NG</span><span class="v">${r.ok} <span style="font-size:22px;color:var(--orange)">/ ${r.def}</span></span><span class="sub">${f2(r.T)} min registrados</span></div>
    </div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">¿A dónde se fue el tiempo?</b><p class="sub">Cada minuto registrado cae en un solo renglón · suma 100 %</p>
      <div class="bars" style="margin-top:14px">${lines.map(([l,v,c])=>`<div class="bar stbar"><span>${esc(l)}</span><div class="track"><div class="fill" data-w="${v/mx*100}" style="background:${c}"></div></div><span class="mono" style="text-align:right;font-weight:600">${f2(v)} min · ${pc(r.T?v/r.T:0,1)}</span></div>`).join('')}
      ${r.gain<0?`<div class="bar stbar"><span>Ganancia vs TC objetivo (piezas más rápidas)</span><div class="track"><div class="fill" data-w="${-r.gain/mx*100}" style="background:#6B7A8A"></div></div><span class="mono" style="text-align:right;font-weight:600;color:var(--blue)">${f2(r.gain)} min · ${pc(r.gain/r.T,1)}</span></div>`:''}
      <div class="bar stbar tot"><span><b>Total registrado</b></span><div></div><span class="mono" style="text-align:right;font-weight:700">${f2(r.T)} min · 100 %</span></div></div>
      ${r.gain<-0.02*r.T?`<p class="sub" style="margin-top:12px;color:#9A3412">Muchas piezas salieron más rápido que el TC objetivo: revisa si el objetivo está holgado o si hay registros que no son ciclos completos.</p>`:''}
      ${num(d.paro)>0?`<p class="sub" style="margin-top:6px">Paro programado: ${f2(num(d.paro))} min (fuera del tiempo registrado; periodo total ${f2(r.periodo)} min).</p>`:''}
    </div>
    ${dsFoot(`<button class="btn ghost" type="button" data-stv="reg">${svg('back',18,2.2)} Registro</button>`,`<button class="btn orange" type="button" data-stfinish="1">Finalizar estudio</button>`)}`;
  }
  return `${stSteps()}<section class="glass panel ${S.keep?'':'view'}">${body}</section>`;
}

// ---- eventos Speed Trial ----
function stSync(){const f=document.getElementById('sth');if(f&&ST.d)new FormData(f).forEach((v,k)=>ST.d[k]=v);}
const stRe=()=>{S.keep=true;render(true);S.keep=false;};
setInterval(()=>{if(ST.run){const el=document.getElementById('stclock');if(el)el.textContent=((Date.now()-ST.run)/60000).toFixed(2);}},100);
document.addEventListener('click',e=>{
  if(e.target.classList&&e.target.classList.contains('mback'))return;
  const t=e.target.closest('button');if(!t||t.disabled)return;const D=t.dataset;
  if(D.stnew){stNew();go('st-nuevo');return;}
  if(D.stopen){ST.d=ST.studies.find(x=>x.id==D.stopen);ST.view=ST.d.recs.length?'res':'info';ST.run=null;ST.miss=[];go('st-nuevo');return;}
  const d=ST.d;if(!d)return;
  if(D.stv){stSync();
    if(D.stneed==='info'){ST.miss=ST_REQ.map(x=>x[0]).filter(k=>!String(d[k]||'').trim()||((k==='costo'||k==='tcobj')&&!(num(d[k])>0)));if(ST.miss.length){stRe();return;}if(!ST.studies.includes(d))ST.studies.unshift(d);}
    ST.view=D.stv;render();return;}
  if(D.ststart){ST.run=Date.now();stRe();return;}
  if(D.stpause){ST.run=null;stRe();return;}
  if(D.stlap){const now=Date.now();d.recs.push({id:nid(),t:(now-ST.run)/60000,cause:ST.cur.cause,prob:ST.cur.prob});ST.run=now;ST.cur={cause:'',prob:''};if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}stRe();return;}
  if(D.stcause!==undefined){ST.cur.cause=D.stcause;stRe();return;}
  if(D.stadd){d.recs.push({id:nid(),t:num(d.tcobj)||0,cause:'',prob:''});stRe();return;}
  if(D.stexample){ST_EXAMPLE.forEach(([tt,c])=>d.recs.push({id:nid(),t:tt,cause:c,prob:''}));stRe();return;}
  if(D.strdel){d.recs=d.recs.filter(x=>x.id!=D.strdel);stRe();return;}
  if(D.stdel){ask('¿Eliminar este estudio?','Se borra «'+stName(d)+'» con sus '+d.recs.length+' registros. No se puede deshacer.','Eliminar estudio',()=>{ST.studies=ST.studies.filter(x=>x!==d);ST.d=null;ST.run=null;go('st');});return;}
  if(D.stfinish){d.estado='Cerrado';ST.d=null;ST.run=null;go('st');return;}
});
document.addEventListener('input',e=>{const el=e.target;const d=ST.d;if(!d)return;
  if(el.closest&&el.closest('#sth')){stSync();if(ST.miss.length){ST.miss=ST.miss.filter(k=>!String(d[k]||'').trim());}return;}
  if(el.dataset.stcurprob){ST.cur.prob=el.value;return;}
  if(el.dataset.strp){const x=d.recs.find(y=>y.id==el.dataset.strp);if(x)x.prob=el.value;return;}
  if(el.dataset.strt){const x=d.recs.find(y=>y.id==el.dataset.strt);if(x)x.t=el.value;return;}
});
document.addEventListener('change',e=>{const el=e.target;const d=ST.d;if(!d)return;
  if(el.dataset.strc){const x=d.recs.find(y=>y.id==el.dataset.strc);if(x){x.cause=el.value;stRe();}return;}
  if(el.dataset.strt){stRe();return;}
});
