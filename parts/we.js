// ================= WORK ELEMENT (usa el motor del Delay Study) =================
const WE_BASES=[['hora','Por hora (JPH)',60],['ciclo','Por tiempo ciclo de la línea',null]];
const WE_VERBS=['Tomar','Colocar','Ajustar','Mover','Girar','Inspeccionar','Atornillar','Soltar'];
const isWE=d=>d&&d.kind==='we';
function weN(d){return Math.max(1,Math.round(num(d.ciclos))||10);}
function weSync(a){a.secs=weAvg(a.times)*60;}
function wePtr(els,n){for(let c=0;c<n;c++)for(let e=0;e<els.length;e++){const t=(els[e].times||[])[c];if(t===''||t==null)return {c,e};}return null;}
function weLast(els,n){for(let c=n-1;c>=0;c--)for(let e=els.length-1;e>=0;e--){const t=(els[e].times||[])[c];if(t!==''&&t!=null)return {c,e};}return null;}

function weInfo(d,del){
  const ciclo=d.periodo==='ciclo';
  return `<div class="row"><div><h2>Información del estudio</h2><p class="sub">Lo que va arriba de tu hoja</p></div>${del}</div>
    <form class="form" id="dsh" style="margin-top:18px" onsubmit="return false">
      <label style="grid-column:1/-1">Título<input name="titulo" value="${esc(d.titulo)}" placeholder="Ej. Análisis de ensamble"></label>
      <label>No. de parte<input name="parte" value="${esc(d.parte||'')}" placeholder="Ej. 00000-XXX"></label>
      <label>Analista<input name="observador" value="${esc(d.observador)}" placeholder="Nombre"></label>
      <label>Área<input name="area" value="${esc(d.area)}" placeholder="Ej. Ensamble de válvula"></label>
      <label>Fecha<input type="date" name="fecha" value="${esc(d.fecha)}"></label>
    </form>
    <div style="margin-top:22px"><b style="font-size:17px">¿Cómo se mide la ocupación?</b><p class="sub">Por hora con el JPH, o contra el tiempo ciclo de la línea con 1 pieza</p></div>
    <div class="chips" style="margin-top:12px" role="group" aria-label="Base de medición">${WE_BASES.map(([k,l,m])=>`<button type="button" class="chip" data-dsper="${k}" aria-pressed="${d.periodo===k}"><span>${l}</span>${m?`<span class="mono">${m} min</span>`:''}</button>`).join('')}</div>
    <div class="form" style="margin-top:14px">
      ${ciclo?`<label>Tiempo ciclo de la línea (min)<input type="text" inputmode="decimal" data-dsg="disp" value="${esc(d.disp)}" placeholder="Ej. 1.20"></label>
        <label>Objetivo<input type="text" value="1 pieza por ciclo" disabled></label>`
      :`<label>Tiempo disponible (min por hora)<input type="text" inputmode="decimal" data-dsg="disp" value="${esc(d.disp)}"></label>
        <label>JPH estándar (piezas por hora) · cada operador puede tener el suyo<input type="text" inputmode="decimal" data-dsg="obj" value="${esc(d.obj)}" placeholder="Ej. 10"></label>`}
      <label>Ciclos a cronometrar por operador<input type="text" inputmode="numeric" data-dsg="ciclos" value="${esc(d.ciclos)}" placeholder="10"></label>
    </div>
    ${dsFoot(`<button class="btn ghost" type="button" data-go="we">${svg('back',18,2.2)} ${DS.studies.includes(d)?'Lista de estudios':'Cancelar'}</button>`,`<button class="btn" type="button" data-dsv="elem" data-need="info">Continuar a elementos ${svg('next',18,2.2)}</button>`)}`;
}

function weOpFields(d,op){
  return `<div class="form" style="margin-top:14px">
      <label>Operador ${d.ops.indexOf(op)+1} · nombre o puesto<input data-dsopname="${op.id}" value="${esc(op.name)}"></label>
      ${d.periodo==='ciclo'?'':`<label>JPH de este operador (piezas por hora)<input type="text" inputmode="decimal" data-dsopobj="${op.id}" value="${esc(op.obj??'')}" placeholder="Vacío = estándar (${esc(d.obj||0)})"></label>`}
    </div>`;
}

function weElem(d,op,del){
  const els=dsSeq(d,op.id);const hasT=els.some(e=>(e.times||[]).some(t=>t!==''&&t!=null));
  return `<div class="row"><div><h2>Elementos · ${esc(op.name)}</h2><p class="sub">Primero observa la operación y registra los elementos en orden. Después cronometras los ciclos.</p></div>
      <button class="btn" type="button" data-dsv="crono" data-need="elem" ${els.length?'':'disabled'}>Validar y cronometrar ${svg('next',18,2.2)}</button></div>
    ${weOpFields(d,op)}
    <div style="margin-top:18px"><b>Agregar elemento</b></div>
    <div class="chips" style="margin-top:8px">${WE_VERBS.map(v=>`<button type="button" class="chip" data-weq="${v}">+ ${v}</button>`).join('')}</div>
    <div class="row" style="margin-top:10px;justify-content:flex-start;flex-wrap:nowrap"><input id="weadd" class="weadd" list="dlEls" placeholder="Escribe un elemento y presiona Enter"><button class="btn" type="button" data-weadd="1">${svg('plus',18,2.2)} Agregar</button></div>
    <datalist id="dlEls">${[...new Set(DS.studies.filter(isWE).flatMap(s=>s.acts).concat(d.acts).map(a=>a.name).filter(Boolean))].map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
    ${hasT?'<p class="sub" style="color:#9A3412;margin-top:10px">Este operador ya tiene tiempos. Si cambias el orden o quitas elementos, revisa sus ciclos.</p>':''}
    <div class="grid" style="margin-top:14px;gap:8px">${els.map((e,i)=>`<div class="cat"><span class="mono opn">${i+1}</span>
      <label class="sr" for="we${e.id}">Elemento ${i+1}</label><input id="we${e.id}" data-wename="${e.id}" value="${esc(e.name)}">
      <button type="button" class="iconbtn" data-wemove="${e.id}" data-dir="-1" aria-label="Subir" ${i?'':'disabled'}>${svg('back',16,2.2).replace('<svg','<svg style="transform:rotate(90deg)"')}</button>
      <button type="button" class="iconbtn" data-wemove="${e.id}" data-dir="1" aria-label="Bajar" ${i<els.length-1?'':'disabled'}>${svg('next',16,2.2).replace('<svg','<svg style="transform:rotate(90deg)"')}</button>
      <button type="button" class="iconbtn" data-wedel="${e.id}" aria-label="Quitar elemento">${svg('trash',18)}</button></div>`).join('')||'<div class="slot empty" style="min-height:120px"><p>Aún no hay elementos. Usa los botones de arriba o escribe uno.</p></div>'}</div>
    ${dsFoot(`<button class="btn ghost" type="button" data-dsv="info">${svg('back',18,2.2)} Información</button>`,del)}`;
}

function weCrono(d,op,del){
  const els=dsSeq(d,op.id);const n=weN(d);const ptr=wePtr(els,n);const done=weComplete(els,n);
  const cur=ptr?els[ptr.e]:null;const nxt=ptr?(ptr.e+1<els.length?els[ptr.e+1]:null):null;
  const tbl=`<div class="tbl wet"><table><thead><tr><th>#</th><th style="text-align:left">Elemento</th>${Array.from({length:n},(_,c)=>`<th class="${ptr&&ptr.c===c?'curc':''}">N${c+1}</th>`).join('')}<th>Promedio</th></tr></thead><tbody>
    ${els.map((e,i)=>`<tr><td class="mono">${i+1}</td><th>${esc(e.name)}</th>${Array.from({length:n},(_,c)=>{const t=(e.times||[])[c];const on=ptr&&ptr.c===c&&ptr.e===i;return `<td class="${on?'curcell':''}"><input aria-label="${esc(e.name)} ciclo ${c+1}" type="text" inputmode="decimal" data-wet="${e.id}:${c}" value="${t===''||t==null?'':f2(num(t))}"></td>`;}).join('')}<td class="avg" id="wa${e.id}">${f2(weAvg(e.times))}</td></tr>`).join('')}
    <tr class="trow"><td></td><th>Total del ciclo</th>${Array.from({length:n},(_,c)=>{const ok=els.every(e=>{const t=(e.times||[])[c];return t!==''&&t!=null;});return `<td>${ok?f2(els.reduce((s,e)=>s+num(e.times[c]),0)):'—'}</td>`;}).join('')}<td class="avg" id="wtot">${f2(els.reduce((s,e)=>s+weAvg(e.times),0))}</td></tr>
    </tbody></table></div>`;
  return `<div class="row"><div><h2>Cronometraje · ${esc(op.name)}</h2><p class="sub">Cada toque cierra el elemento en curso y arranca el siguiente. Al terminar el último, empieza solo el siguiente ciclo.</p></div>
      <button class="btn" type="button" data-dsv="asig" data-need="crono" ${done&&!DS.run?'':'disabled'} title="${DS.run?'Pausa el cronómetro primero':(done?'':'Completa al menos un ciclo')}">Terminar ${esc(op.name)} y ver asignación ${svg('next',18,2.2)}</button></div>
    <div class="clock ${DS.run?'on':''}"><div class="clockrow">
      <div><span class="sub" style="margin:0">${ptr?`Ciclo <b>${ptr.c+1}</b> de ${n} · elemento ${ptr.e+1} de ${els.length}`:`<b style="color:var(--blue)">✓ ${n} ciclos completos</b>`}</span>
        <div class="wecur">${cur?esc(cur.name):'Ciclos terminados'}</div>
        <div class="big" style="font-size:40px"><span class="mono" id="dsclock">${DS.run?((Date.now()-DS.run)/60000).toFixed(2):'0.00'}</span><span class="mono" style="font-size:18px;margin-left:8px;color:var(--ink2)">min</span></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${DS.run?`<button class="btn ghost" type="button" data-wepause="1">Pausar</button>`:''}
        <button class="btn ghost" type="button" data-weundo="1" ${weLast(els,n)?'':'disabled'}>${svg('undo',18,2)} Deshacer</button>
        ${!ptr?'':DS.run?`<button class="btn lapbtn wetap" type="button" data-wetap="1">${nxt?`Siguiente: ${esc(nxt.name)}`:`Cerrar ciclo ${ptr.c+1}`} ${svg('next',20,2.4)}</button>`
          :`<button class="btn orange lapbtn" type="button" data-westart="1">${svg('estudios',20,2.2)} ${ptr.c===0&&ptr.e===0?'Iniciar ciclo 1':'Reanudar en ciclo '+(ptr.c+1)}</button>`}
      </div></div>
      <div class="wemeter" aria-hidden="true">${Array.from({length:n},(_,c)=>`<span class="${c<done?'ok':ptr&&ptr.c===c?'now':''}"></span>`).join('')}</div>
      <p class="sub" style="margin:8px 0 0">${done} de ${n} ciclos completos · tiempo de cada elemento = promedio de sus ciclos</p>
    </div>
    <div style="margin-top:20px"><b style="font-size:17px">Tiempos por ciclo (min)</b><p class="sub">Puedes corregir cualquier celda; el promedio se recalcula solo</p></div>
    ${tbl}
    ${dsFoot(`<button class="btn ghost" type="button" data-dsv="elem">${svg('back',18,2.2)} Elementos</button>`,del)}`;
}

function weTap(){const d=DS.d;const els=dsSeq(d,DS.op);const n=weN(d);const p=wePtr(els,n);if(!p||!DS.run)return;
  const now=Date.now();const e=els[p.e];e.times=e.times||[];e.times[p.c]=(now-DS.run)/60000;weSync(e);DS.run=wePtr(els,n)?now:null;}
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t||t.disabled||!DS.d||!isWE(DS.d))return;const d=DS.d;const D=t.dataset;
  const add=name=>{const id=nid();d.assign[id]=DS.op;d.acts.push({id,cap:DS.op,name,times:[],secs:0,racks:1,snp:1});};
  if(D.weq){add(D.weq);S.keep=true;render(true);S.keep=false;return;}
  if(D.weadd){const i=document.getElementById('weadd');if(i&&i.value.trim()){add(i.value.trim());S.keep=true;render(true);S.keep=false;const ni=document.getElementById('weadd');if(ni)ni.focus({preventScroll:true});}return;}
  if(D.wedel){const id=+D.wedel;const a=d.acts.find(x=>x.id===id);const go=()=>{d.acts=d.acts.filter(x=>x.id!==id);delete d.assign[id];S.keep=true;render(true);S.keep=false;};
    if((a.times||[]).some(x=>x!==''&&x!=null))ask('¿Quitar «'+a.name+'»?','Este elemento ya tiene tiempos cronometrados y se borran.','Quitar elemento',go);else go();return;}
  if(D.wemove){const id=+D.wemove;const seq=dsSeq(d,DS.op);const i=seq.findIndex(x=>x.id===id);const j=i+(+D.dir);if(j<0||j>=seq.length)return;
    const ia=d.acts.indexOf(seq[i]),ib=d.acts.indexOf(seq[j]);[d.acts[ia],d.acts[ib]]=[d.acts[ib],d.acts[ia]];S.keep=true;render(true);S.keep=false;return;}
  if(D.westart){DS.run=Date.now();S.keep=true;render(true);S.keep=false;return;}
  if(D.wetap){weTap();if(navigator.vibrate)try{navigator.vibrate(12)}catch(_){}S.keep=true;render(true);S.keep=false;const b=document.querySelector('[data-wetap]');if(b)b.classList.add('pulse');return;}
  if(D.wepause){DS.run=null;S.keep=true;render(true);S.keep=false;return;}
  if(D.weundo){const els=dsSeq(d,DS.op);const l=weLast(els,weN(d));if(l){els[l.e].times[l.c]='';weSync(els[l.e]);if(DS.run)DS.run=Date.now();}S.keep=true;render(true);S.keep=false;return;}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='weadd'){e.preventDefault();const b=document.querySelector('[data-weadd]');if(b)b.click();}});
document.addEventListener('input',e=>{const el=e.target;const d=DS.d;if(!isWE(d))return;
  if(el.dataset.wename){const a=d.acts.find(x=>x.id==el.dataset.wename);if(a)a.name=el.value;return;}
  if(el.dataset.wet){const [id,c]=el.dataset.wet.split(':').map(Number);const a=d.acts.find(x=>x.id===id);if(!a)return;a.times=a.times||[];a.times[c]=el.value.trim()===''?'':el.value;weSync(a);
    const av=document.getElementById('wa'+a.id);if(av)av.textContent=f2(weAvg(a.times));const tt=document.getElementById('wtot');if(tt)tt.textContent=f2(dsSeq(d,a.cap).reduce((s,x)=>s+weAvg(x.times),0));}
});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.wet&&isWE(DS.d)){S.keep=true;render(true);S.keep=false;}});
