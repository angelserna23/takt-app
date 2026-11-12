function wsCalc(d){return calcWS(d.ops,d.acts,d.counts);}

function vWS(){
  setHead('Work Sampling',[['Estudios','estudios'],['Work Sampling','ws']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Muestreos</h2><p class="sub">Estudios de Work Sampling guardados</p></div>
    <button class="btn orange" type="button" data-go="ws-nuevo">${svg('plus',18,2.2)} Nuevo muestreo</button></div>
    <div class="grid" style="margin-top:18px">
    ${S.studies.map(st=>{const r=wsCalc(st);return `<button type="button" class="study" data-open="${st.id}">
      <div class="logo" style="background:rgba(29,95,168,.12);color:var(--blue)" aria-hidden="true">WS</div>
      <div class="meta"><b>${esc(st.titulo)}</b><span>${esc(st.area||'—')} · No. parte ${esc(st.parte||'—')} · ${esc(st.fecha)} · ${esc(st.analista||'—')} · ${st.ops.length} operador${st.ops.length>1?'es':''}</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:var(--orange)">${pc(r.total.innec)}</span><br><span style="font-size:12px;color:var(--muted)">innecesario · ${r.total.sum} obs.</span></div>
      ${svg('next',20,2)}</button>`}).join('')}
    ${S.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${svg('list',30)}</div><b style="font-size:17px">Aún no hay muestreos</b><p>Toca <b>Nuevo muestreo</b> para crear el primero.</p></div>`}
    </div></section>`;
}

function newDraft(){
  const op={id:nid(),name:'Operador 1'};
  S.draft={id:nid(),titulo:'',area:'',parte:'',analista:'',fecha:new Date().toISOString().slice(0,10),
    ops:[op],acts:defaultActs(),counts:{},log:[],cur:op.id,auto:false,estado:'En captura'};
  S.step=1;
}

function stepper(){
  const L=['Encabezado','Actividades','Muestreo','Resultados'];
  return `<nav class="steps" aria-label="Pasos del estudio">${L.map((l,i)=>`<button type="button" class="step ${S.step>i+1?'done':''}" data-step="${i+1}" ${S.step===i+1?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;
}

function stackRow(row,acts,pal,isTotal){
  return `<div class="srow ${isTotal?'tot':''}">
    <div class="sname"><b>${esc(row.name)}</b><span class="mono">${row.sum} obs.</span></div>
    <div class="stack" role="img" aria-label="${esc(row.name)}: ${pc(row.nec)} necesario, ${pc(row.innec)} innecesario">
      ${row.sum?acts.filter(a=>row.pct[a.id]>0).map(a=>`<div class="fill sg" data-w="${row.pct[a.id]*100}" title="${esc(a.name)}: ${pc(row.pct[a.id],1)}" style="background:${pal[a.id]};color:${LIGHT.has(pal[a.id])?'#1B2430':'#fff'}">${row.pct[a.id]>=0.04?pc(row.pct[a.id]):''}</div>`).join(''):'<span class="sub" style="padding:0 12px;line-height:44px">Sin observaciones</span>'}
    </div>
    <div class="snum"><span class="mono" style="color:var(--orange)">${pc(row.innec)}</span><span>innecesario</span></div>
  </div>`;
}

function vNuevo(){
  if(!S.draft)newDraft();
  const d=S.draft;
  setHead(d.titulo||'Nuevo muestreo',[['Estudios','estudios'],['Work Sampling','ws'],[d.estado==='Cerrado'?'Estudio':'Nuevo','ws-nuevo']]);
  let body='';
  if(S.step===1){
    body=`<div><h2>01 · Encabezado</h2><p class="sub">Datos generales del estudio y operadores a observar</p></div>
    <form class="form" id="hdr" style="margin-top:18px" onsubmit="return false">
      <label style="grid-column:1/-1">Título<input name="titulo" value="${esc(d.titulo)}" placeholder="Ej. Análisis de línea de poleas"></label>
      <label>Área<input name="area" value="${esc(d.area)}" placeholder="Ej. Ensamble 1"></label>
      <label>No. de parte<input name="parte" value="${esc(d.parte)}" placeholder="Ej. 00000-XXXX"></label>
      <label>Analista<input name="analista" value="${esc(d.analista)}" placeholder="Nombre"></label>
      <label>Fecha<input type="date" name="fecha" value="${esc(d.fecha)}"></label>
    </form>
    <div class="row" style="margin-top:26px"><div><b style="font-size:17px">Operadores</b><p class="sub">Cada operador tiene su propio conteo y su propia gráfica</p></div></div>
    <div class="grid" style="margin-top:12px;gap:10px">${d.ops.map((o,i)=>`<div class="cat"><span class="mono" style="width:32px;text-align:center;font-weight:600;color:var(--ink2)">${i+1}</span>
      <label class="sr" for="o${o.id}">Nombre del operador</label><input id="o${o.id}" data-oname="${o.id}" value="${esc(o.name)}">
      <button type="button" class="iconbtn" data-odel="${o.id}" aria-label="Quitar operador" ${d.ops.length<2?'disabled':''}>${svg('trash',18)}</button></div>`).join('')}</div>
    <button class="btn ghost" type="button" id="addop" style="margin-top:12px">${svg('plus',18,2.2)} Agregar operador</button>`;
  }
  if(S.step===2){
    body=`<div><h2>02 · Actividades</h2><p class="sub">Qué vas a contar y si es necesaria o innecesaria. Precargadas con tu formato.</p></div>
    <div class="grid" style="margin-top:16px;gap:10px">${d.acts.map(a=>`<div class="cat ${a.nec?'':'inn'}">
      <label class="sr" for="a${a.id}">Nombre de la actividad</label><input id="a${a.id}" data-aname="${a.id}" value="${esc(a.name)}">
      <div class="seg2" role="group" aria-label="Clasificación de ${esc(a.name)}">
        <button type="button" data-anec="${a.id}" data-v="1" aria-pressed="${a.nec}">Necesaria</button>
        <button type="button" data-anec="${a.id}" data-v="0" aria-pressed="${!a.nec}">Innecesaria</button></div>
      <button type="button" class="iconbtn" data-adel="${a.id}" aria-label="Quitar actividad">${svg('trash',18)}</button></div>`).join('')}</div>
    <button class="btn ghost" type="button" id="addact" style="margin-top:12px">${svg('plus',18,2.2)} Agregar actividad</button>`;
  }
  if(S.step===3){
    const r=wsCalc(d);const cur=d.ops.find(o=>o.id===d.cur)||d.ops[0];d.cur=cur.id;const cc=d.counts[cur.id]||{};
    const cr=r.rows.find(x=>x.id===cur.id);
    body=`<div class="row"><div><h2>03 · Muestreo</h2><p class="sub">Elige al operador y toca lo que está haciendo. Una marca por ciclo.</p></div>
      <label class="switch"><input type="checkbox" id="auto" ${d.auto?'checked':''}><span></span>Pasar al siguiente operador después de cada marca</label></div>
    <div class="chips" style="margin-top:16px" role="group" aria-label="Operador observado">${r.rows.map(o=>`<button type="button" class="chip" data-cur="${o.id}" aria-pressed="${o.id===cur.id}"><span>${esc(o.name)}</span><span class="mono">${o.sum}</span></button>`).join('')}</div>
    <div class="row" style="margin-top:16px"><div class="total"><span class="big">${cr.sum}</span><span class="sub">obs. de <b>${esc(cur.name)}</b> · ${r.total.sum} en total</span></div>
      <button class="btn ghost" type="button" id="undo" ${d.log.length?'':'disabled'}>${svg('undo',18,2)} Deshacer</button></div>
    <div class="cap" style="margin-top:14px">${d.acts.map(a=>`<button type="button" class="tap ${a.nec?'':'tinn'}" data-tap="${a.id}">
      <span>${esc(a.name)}</span><span style="display:flex;justify-content:space-between;align-items:flex-end"><span class="c">${cc[a.id]||0}</span><span class="k">${a.nec?'NEC':'INNEC'}</span></span></button>`).join('')}</div>`;
  }
  if(S.step===4){
    const r=wsCalc(d);const pal=palette(d.acts);
    body=`<div><h2>04 · Resultados</h2><p class="sub">Ocupación por operador y total de la línea · se calcula en vivo</p></div>
    <div class="kpis" style="margin-top:16px">
      <div class="kpi"><span>Necesario · total línea</span><span class="v" style="color:var(--blue)">${pc(r.total.nec,1)}</span></div>
      <div class="kpi"><span>Innecesario · total línea</span><span class="v" style="color:var(--orange)">${pc(r.total.innec,1)}</span></div>
      <div class="kpi"><span>Observaciones</span><span class="v">${r.total.sum}</span><span class="sub">${d.ops.length} operador${d.ops.length>1?'es':''}</span></div>
    </div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px">
      <div class="row"><b style="font-size:16px">¿A qué dedica su tiempo cada operador?</b>
        <div class="legend"><span><i style="background:var(--blue)"></i>Necesarias (azules)</span><span><i style="background:var(--orange)"></i>Innecesarias (naranjas)</span></div></div>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">
        ${r.rows.map(x=>stackRow(x,d.acts,pal,false)).join('')}
        ${d.ops.length>1?stackRow(r.total,d.acts,pal,true):''}
      </div>
      <div class="legend" style="margin-top:16px">${d.acts.map(a=>`<span><i style="background:${pal[a.id]}"></i>${esc(a.name)}</span>`).join('')}</div>
    </div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px">
      <b style="font-size:16px">Resultado %</b>
      <div class="tbl"><table><thead><tr><th>Operador</th>${d.acts.map(a=>`<th class="${a.nec?'':'hinn'}">${esc(a.name)}</th>`).join('')}<th>Innec.</th><th>Nec.</th><th>Obs.</th></tr></thead>
      <tbody>${[...r.rows,...(d.ops.length>1?[r.total]:[])].map(x=>`<tr class="${x.id==='total'?'trow':''}"><th>${esc(x.name)}</th>${d.acts.map(a=>`<td class="${a.nec?'':'hinn'}">${x.sum?pc(x.pct[a.id]):'—'}</td>`).join('')}<td style="color:var(--orange);font-weight:600">${pc(x.innec)}</td><td style="color:var(--blue);font-weight:600">${pc(x.nec)}</td><td>${x.sum}</td></tr>`).join('')}</tbody></table></div>
    </div>`;
  }
  const prev=S.step>1?`<button class="btn ghost" type="button" data-step="${S.step-1}">${svg('back',18,2.2)} Anterior</button>`:`<button class="btn ghost" type="button" data-go="ws">${svg('back',18,2.2)} Cancelar</button>`;
  const next=S.step<4?`<button class="btn" type="button" data-step="${S.step+1}">Siguiente ${svg('next',18,2.2)}</button>`:`<button class="btn orange" type="button" id="save">Guardar estudio</button>`;
  return `${stepper()}<section class="glass panel view">${body}<div class="row" style="margin-top:22px">${prev}${next}</div></section>`;
}
