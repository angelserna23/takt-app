function cloneActs(acts){return acts.map(a=>({id:a.id,name:a.name,nec:a.nec}));}
function curOp(){return S.draft&&S.draft.ops.find(o=>o.id===S.opId);}
function addOp(from){const d=S.draft;const op={id:nid(),name:'Operador '+(d.ops.length+1),acts:cloneActs(from?from.acts:defaultActs()),counts:{},log:[],status:'nuevo'};d.ops.push(op);return op;}
const STATUS={nuevo:['PENDIENTE',''],conteo:['EN CONTEO','cnt'],listo:['TERMINADO','ok']};

function vWS(){
  setHead('Work Sampling',[['Estudios','estudios'],['Work Sampling','ws']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Muestreos</h2><p class="sub">Estudios de Work Sampling</p></div>
    <button class="btn orange" type="button" data-go="ws-nuevo">${svg('plus',18,2.2)} Nuevo estudio</button></div>
    <div class="grid" style="margin-top:18px">
    ${S.studies.map(st=>{const L=calcLine(st.ops);return `<button type="button" class="study" data-open="${st.id}">
      <div class="logo" style="background:rgba(29,95,168,.12);color:var(--blue)" aria-hidden="true">WS</div>
      <div class="meta"><b>${esc(st.titulo)} <span class="tag ${st.estado==='Cerrado'?'':'on'}" style="vertical-align:2px;margin-left:6px">${st.estado==='Cerrado'?'FINALIZADO':'EN PROCESO'}</span></b><span>${esc(st.area||'—')} · No. parte ${esc(st.parte||'—')} · ${esc(st.fecha)} · ${esc(st.analista||'—')} · ${st.ops.length} operador${st.ops.length!==1?'es':''}</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:var(--orange)">${L.total.sum?pc(L.total.innec):'—'}</span><br><span style="font-size:12px;color:var(--muted)">innecesario línea · ${L.total.sum} obs.</span></div>
      ${svg('next',20,2)}</button>`}).join('')}
    ${S.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${svg('list',30)}</div><b style="font-size:17px">Aún no hay estudios</b><p>Toca <b>Nuevo estudio</b> para crear el primero.</p></div>`}
    </div></section>`;
}

function newDraft(){S.draft={id:nid(),titulo:'',area:'',parte:'',analista:'',fecha:new Date().toISOString().slice(0,10),ops:[],estado:'Abierto'};S.view='hdr';S.opId=null;}

function opSteps(op){
  const L=[['acts','Actividades'],['count','Conteo'],['res','Resultados']];const idx=L.findIndex(x=>x[0]===S.view);const has=calcOp(op).sum>0;
  return `<nav class="steps" style="grid-template-columns:repeat(3,minmax(0,1fr))" aria-label="Pasos del operador">${L.map(([v,l],i)=>`<button type="button" class="step ${i<idx?'done':''}" data-wsv="${v}" ${v==='res'&&!has?'disabled':''} ${i===idx?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;
}
const foot=(l,r)=>`<div class="row" style="margin-top:22px">${l||'<span></span>'}<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end">${r||''}</div></div>`;

function opResults(op){
  const x=calcOp(op);const pal=palette(op.acts);
  const rank=[...op.acts].filter(a=>x.pct[a.id]>0).sort((a,b)=>x.pct[b.id]-x.pct[a.id]);const opp=rank.filter(a=>!a.nec);
  return `<div class="kpis" style="margin-top:16px">
    <div class="kpi"><span>Necesario</span><span class="v" style="color:var(--blue)">${pc(x.nec,1)}</span></div>
    <div class="kpi"><span>Innecesario</span><span class="v" style="color:var(--orange)">${pc(x.innec,1)}</span></div>
    <div class="kpi"><span>Observaciones</span><span class="v">${x.sum}</span></div></div>
  <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px">
    <b style="font-size:16px">¿A qué dedica su tiempo ${esc(op.name)}?</b>
    <div class="band inn" style="margin-top:16px"><span>INNECESARIO</span><span class="mono">${pc(x.innec)}</span></div>
    <div class="stack big" role="img" aria-label="Distribución de actividades de ${esc(op.name)}">${op.acts.filter(a=>x.pct[a.id]>0).map(a=>`<div class="fill sg" data-w="${x.pct[a.id]*100}" title="${esc(a.name)}: ${pc(x.pct[a.id],1)}" style="background:${pal[a.id]};color:${LIGHT.has(pal[a.id])?'#1B2430':'#fff'}">${x.pct[a.id]>=0.035?pc(x.pct[a.id]):''}</div>`).join('')}</div>
    <div class="band nec"><span>NECESARIO</span><span class="mono">${pc(x.nec)}</span></div>
    <div class="axis" aria-hidden="true">${[0,10,20,30,40,50,60,70,80,90,100].map(v=>`<span>${v}%</span>`).join('')}</div>
    <div class="legend" style="margin-top:14px">${op.acts.filter(a=>x.pct[a.id]>0).map(a=>`<span><i style="background:${pal[a.id]}"></i>${esc(a.name)}</span>`).join('')}</div>
  </div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));margin-top:16px">
    <div class="glass" style="padding:20px;border-radius:18px"><b style="font-size:16px">Área de oportunidad</b><p class="sub">Actividades innecesarias, de mayor a menor</p>
      <div class="bars" style="margin-top:14px">${opp.length?opp.map(a=>`<div class="bar"><span>${esc(a.name)}</span><div class="track"><div class="fill" data-w="${x.pct[a.id]*100/x.pct[opp[0].id]}" style="background:var(--orange)"></div></div><span class="mono" style="text-align:right;font-weight:600;color:var(--orange)">${pc(x.pct[a.id],1)}</span></div>`).join(''):'<p class="sub">Sin actividades innecesarias registradas.</p>'}</div></div>
    <div class="glass" style="padding:20px;border-radius:18px"><b style="font-size:16px">Todas sus actividades</b><p class="sub">Ordenadas de mayor a menor</p>
      <div class="bars" style="margin-top:14px">${rank.map(a=>`<div class="bar"><span>${esc(a.name)}</span><div class="track"><div class="fill" data-w="${x.pct[a.id]*100/x.pct[rank[0].id]}" style="background:${a.nec?'var(--blue)':'var(--orange)'}"></div></div><span class="mono" style="text-align:right;font-weight:600">${pc(x.pct[a.id],1)}</span></div>`).join('')}</div></div>
  </div>`;
}

function vNuevo(){
  if(!S.draft)newDraft();
  const d=S.draft;const op=curOp();
  if(['acts','count','res'].includes(S.view)&&!op)S.view='hub';
  const base=[['Estudios','estudios'],['Work Sampling','ws']];
  const tit=d.titulo||'Nuevo estudio';
  if(S.view==='hdr'){
    setHead(tit,[...base,[d.ops.length?'Información del estudio':'Nuevo estudio','ws-nuevo']]);
    return `<section class="glass panel view"><div><h2>Información del estudio</h2><p class="sub">Lo que va arriba de tu hoja</p></div>
    <form class="form" id="hdr" style="margin-top:18px" onsubmit="return false">
      <label style="grid-column:1/-1">Título<input name="titulo" value="${esc(d.titulo)}" placeholder="Ej. Análisis de línea de poleas"></label>
      <label>Área<input name="area" value="${esc(d.area)}" placeholder="Ej. Ensamble 1"></label>
      <label>No. de parte<input name="parte" value="${esc(d.parte)}" placeholder="Ej. 00000-XXXX"></label>
      <label>Analista<input name="analista" value="${esc(d.analista)}" placeholder="Nombre"></label>
      <label>Fecha<input type="date" name="fecha" value="${esc(d.fecha)}"></label>
    </form>
    ${foot(`<button class="btn ghost" type="button" data-go="ws">${svg('back',18,2.2)} ${d.ops.length?'Volver a la lista':'Cancelar'}</button>`,`<button class="btn" type="button" data-wsv="hub">Continuar a operadores ${svg('next',18,2.2)}</button>`)}</section>`;
  }
  if(S.view==='hub'){
    setHead(tit,[...base,[tit,'ws-nuevo']]);
    const L=calcLine(d.ops);const withObs=d.ops.filter(o=>calcOp(o).sum>0).length;
    return `<section class="glass panel view">
      <div class="row"><div><h2>${esc(tit)}</h2><p class="sub">${esc(d.area||'—')} · No. parte ${esc(d.parte||'—')} · ${esc(d.fecha)} · ${esc(d.analista||'—')}</p></div>
      <button class="btn ghost" type="button" data-wsv="hdr">Editar información</button></div>
      <div style="margin-top:22px"><b style="font-size:17px">Operadores</b><p class="sub">Toca un operador para validar sus actividades y empezar a contar</p></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr));margin-top:12px">
      ${d.ops.map((o,i)=>{const x=calcOp(o);const s=STATUS[o.status];return `<button type="button" class="opcard" data-enter="${o.id}">
        <span class="row" style="width:100%"><span class="mono opn">${i+1}</span><span class="stag ${s[1]}">${s[0]}</span></span>
        <b>${esc(o.name)}</b>
        <span class="row" style="width:100%;align-items:flex-end"><span class="sub" style="margin:0">${x.sum} obs.</span><span class="mono" style="font-size:22px;font-weight:600;color:var(--orange)">${x.sum?pc(x.innec):'—'}</span></span></button>`}).join('')}
        <button type="button" class="opcard add" data-addop="1">${svg('plus',26,2)}<b>Agregar operador</b><span class="sub" style="margin:0">Se copian las actividades del anterior</span></button>
      </div>
      ${foot(`<button class="btn ghost" type="button" data-go="ws">${svg('back',18,2.2)} Lista de estudios</button>`,
        `<button class="btn ghost" type="button" data-wsv="line" ${withObs?'':'disabled'}>General de línea${L.total.sum?' · '+pc(L.total.innec)+' innec.':''}</button><button class="btn orange" type="button" data-finish="1">Finalizar estudio</button>`)}
    </section>`;
  }
  if(S.view==='acts'){
    setHead(op.name,[...base,[tit,'ws-nuevo'],[op.name,'ws-nuevo']]);
    return `${opSteps(op)}<section class="glass panel view"><div><h2>Actividades de ${esc(op.name)}</h2><p class="sub">Valida qué vas a contar y si es necesaria o innecesaria</p></div>
    <label class="form" style="margin-top:16px;display:block"><span style="display:block;font-size:13px;font-weight:600;color:var(--ink2);margin-bottom:6px">Nombre del operador o puesto</span><input data-oname="${op.id}" value="${esc(op.name)}" style="width:100%;max-width:420px"></label>
    <div class="grid" style="margin-top:16px;gap:10px">${op.acts.map(a=>`<div class="cat ${a.nec?'':'inn'}">
      <label class="sr" for="a${a.id}">Nombre de la actividad</label><input id="a${a.id}" data-aname="${a.id}" value="${esc(a.name)}">
      <div class="seg2" role="group" aria-label="Clasificación de ${esc(a.name)}">
        <button type="button" data-anec="${a.id}" data-v="1" aria-pressed="${a.nec}">Necesaria</button>
        <button type="button" data-anec="${a.id}" data-v="0" aria-pressed="${!a.nec}">Innecesaria</button></div>
      <button type="button" class="iconbtn" data-adel="${a.id}" aria-label="Quitar actividad">${svg('trash',18)}</button></div>`).join('')}</div>
    <button class="btn ghost" type="button" id="addact" style="margin-top:12px">${svg('plus',18,2.2)} Agregar actividad</button>
    ${foot(`<button class="btn ghost" type="button" data-wsv="hub">${svg('back',18,2.2)} Operadores</button>`,`<button class="btn" type="button" data-wsv="count" ${op.acts.length?'':'disabled'}>Validar y empezar conteo ${svg('next',18,2.2)}</button>`)}</section>`;
  }
  if(S.view==='count'){
    setHead(op.name,[...base,[tit,'ws-nuevo'],[op.name,'ws-nuevo']]);
    const x=calcOp(op);
    return `${opSteps(op)}<section class="glass panel ${S.keep?'':'view'}"><div><h2>Conteo · ${esc(op.name)}</h2><p class="sub">Toca lo que está haciendo en cada ciclo</p></div>
    <div class="row" style="margin-top:16px"><div class="total"><span class="big">${x.sum}</span><span class="sub">observaciones</span></div>
      <button class="btn ghost" type="button" id="undo" ${op.log.length?'':'disabled'}>${svg('undo',18,2)} Deshacer</button></div>
    <div class="cap" style="margin-top:14px">${op.acts.map(a=>`<button type="button" class="tap ${a.nec?'':'tinn'}" data-tap="${a.id}">
      <span>${esc(a.name)}</span><span style="display:flex;justify-content:space-between;align-items:flex-end"><span class="c">${op.counts[a.id]||0}</span><span class="k">${a.nec?'NEC':'INNEC'}</span></span></button>`).join('')}</div>
    ${foot(`<button class="btn ghost" type="button" data-wsv="acts">${svg('back',18,2.2)} Actividades</button>`,`<button class="btn orange" type="button" data-wsv="res" ${x.sum?'':'disabled'}>Terminar conteo ${svg('next',18,2.2)}</button>`)}</section>`;
  }
  if(S.view==='res'){
    setHead(op.name,[...base,[tit,'ws-nuevo'],[op.name,'ws-nuevo']]);
    const i=d.ops.indexOf(op);const nxt=d.ops.slice(i+1).concat(d.ops.slice(0,i)).find(o=>o.status!=='listo');
    const withObs=d.ops.filter(o=>calcOp(o).sum>0).length;
    return `${opSteps(op)}<section class="glass panel view"><div><h2>Resultados · ${esc(op.name)}</h2><p class="sub">Qué aporta y qué no aporta valor</p></div>${opResults(op)}
    <div class="nextbox"><b style="font-size:16px">¿Qué sigue?</b>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:12px">
        ${nxt?`<button class="btn" type="button" data-enter="${nxt.id}">Siguiente: ${esc(nxt.name)} ${svg('next',18,2.2)}</button>`:''}
        <button class="btn ghost" type="button" data-addop="1">${svg('plus',18,2.2)} Agregar otro operador</button>
        ${withObs>1?`<button class="btn ghost" type="button" data-wsv="line">Ver general de línea</button>`:''}
        <button class="btn orange" type="button" data-finish="1">Finalizar estudio</button>
      </div>
      <button class="btn ghost" type="button" data-wsv="count" style="margin-top:12px;min-height:44px;font-size:14px">${svg('back',16,2.2)} Seguir contando a ${esc(op.name)}</button>
    </div></section>`;
  }
  if(S.view==='line'){
    setHead('General de línea',[...base,[tit,'ws-nuevo'],['General de línea','ws-nuevo']]);
    const L=calcLine(d.ops.filter(o=>calcOp(o).sum>0));const pal=palette(L.acts);
    const cmp=[...L.rows].sort((a,b)=>b.innec-a.innec);const mx=Math.max(...cmp.map(o=>o.innec),0.0001);
    return `<section class="glass panel view"><div><h2>General de línea</h2><p class="sub">Resumen de ${L.rows.length} operador${L.rows.length!==1?'es':''} · se suman los conteos de todos</p></div>
      <div class="kpis" style="margin-top:16px">
        <div class="kpi"><span>Necesario · línea</span><span class="v" style="color:var(--blue)">${pc(L.total.nec,1)}</span></div>
        <div class="kpi"><span>Innecesario · línea</span><span class="v" style="color:var(--orange)">${pc(L.total.innec,1)}</span></div>
        <div class="kpi"><span>Observaciones</span><span class="v">${L.total.sum}</span></div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">¿Quién pesa más en lo innecesario?</b><p class="sub">De mayor a menor % innecesario</p>
        <div class="bars" style="margin-top:14px">${cmp.map(o=>`<div class="bar"><span>${esc(o.name)}</span><div class="track"><div class="fill" data-w="${o.innec*100/mx}" style="background:var(--orange)"></div></div><span class="mono" style="text-align:right;font-weight:600;color:var(--orange)">${pc(o.innec,1)}</span></div>`).join('')}</div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Distribución por operador y línea</b>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">${L.rows.map(x=>stackRow(x,L.acts,pal,false)).join('')}${stackRow(L.total,L.acts,pal,true)}</div>
        <div class="legend" style="margin-top:16px">${L.acts.map(a=>`<span><i style="background:${pal[a.id]}"></i>${esc(a.name)}</span>`).join('')}</div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Resultado %</b>
        <div class="tbl"><table><thead><tr><th>Operador</th>${L.acts.map(a=>`<th class="${a.nec?'':'hinn'}">${esc(a.name)}</th>`).join('')}<th>Innec.</th><th>Nec.</th><th>Obs.</th></tr></thead>
        <tbody>${[...L.rows,L.total].map(x=>`<tr class="${x.id==='total'?'trow':''}"><th>${esc(x.name)}</th>${L.acts.map(a=>`<td class="${a.nec?'':'hinn'}">${x.sum?pc(x.pct[a.id]):'—'}</td>`).join('')}<td style="color:var(--orange);font-weight:600">${pc(x.innec)}</td><td style="color:var(--blue);font-weight:600">${pc(x.nec)}</td><td>${x.sum}</td></tr>`).join('')}</tbody></table></div></div>
      ${foot(`<button class="btn ghost" type="button" data-wsv="hub">${svg('back',18,2.2)} Operadores</button>`,`<button class="btn orange" type="button" data-finish="1">Finalizar estudio</button>`)}</section>`;
  }
  S.view='hub';return vNuevo();
}
