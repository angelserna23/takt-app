// ===== DIAGRAMA DE FLUJO DE PROCESO · pantallas =====
const DF={studies:[],d:null,view:'info',sel:null,addAt:null,addFrom:null,focus:false,miss:[]};
const DF_REQ=[['titulo','Título'],['analista','Analista']];
const dfName=d=>d.titulo||'Nuevo diagrama';
function dfNewStudy(){DF.d={id:nid(),titulo:'',proceso:'',area:'',analista:'',fecha:new Date().toISOString().slice(0,10),metodo:'ACTUAL',nodes:[],lay:{rows:5,cols:4,pos:{}}};DF.view='info';DF.sel=null;DF.addAt=null;DF.addFrom=null;DF.miss=[];}
// Símbolo ASME dibujado en (x, y) = centro
function dfShape(t,x,y,k){k=k||1;const s=v=>(v*k).toFixed(1);const X=v=>(x+v*k).toFixed(1),Y=v=>(y+v*k).toFixed(1);
  if(t==='op')return `<circle cx="${x}" cy="${y}" r="${s(19)}" class="dfs op"/>`;
  if(t==='insp')return `<rect x="${X(-17)}" y="${Y(-17)}" width="${s(34)}" height="${s(34)}" class="dfs insp"/>`;
  if(t==='tra')return `<path d="M${X(-22)},${Y(-9)} H${X(4)} V${Y(-18)} L${X(22)},${Y(0)} L${X(4)},${Y(18)} V${Y(9)} H${X(-22)} Z" class="dfs tra"/>`;
  if(t==='dem')return `<path d="M${X(-17)},${Y(-17)} H${X(0)} A${s(17)},${s(17)} 0 0 1 ${X(0)},${Y(17)} H${X(-17)} Z" class="dfs dem"/>`;
  if(t==='alm')return `<path d="M${X(-20)},${Y(-16)} H${X(20)} L${X(0)},${Y(18)} Z" class="dfs alm"/>`;
  if(t==='dec')return `<path d="M${X(0)},${Y(-21)} L${X(24)},${Y(0)} L${X(0)},${Y(21)} L${X(-24)},${Y(0)} Z" class="dfs dec"/>`;
  return `<rect x="${X(-30)}" y="${Y(-14)}" width="${s(60)}" height="${s(28)}" rx="${s(14)}" class="dfs ini"/>`;}
const dfIcon=(t,sz)=>`<svg viewBox="0 0 56 48" width="${sz||28}" height="${(sz||28)*48/56}" aria-hidden="true" style="vertical-align:middle">${dfShape(t,28,24,0.95)}</svg>`;
function dfWrap(s,n){const w=String(s||'').split(/\s+/);const L=[''];w.forEach(x=>{if((L[L.length-1]+' '+x).trim().length>n&&L[L.length-1])L.push(x);else L[L.length-1]=(L[L.length-1]+' '+x).trim();});
  if(L.length>2){L.length=2;L[1]=L[1].slice(0,n-1)+'…';}return L;}
// Cuadrícula: casillas libres (+), «+» de la siguiente salida, flechas en escuadra y símbolos
function dfSvg(d,o){o=o||{};const L=d.lay;const ro=!!o.ro;const CW=150,CH=112,G=58,P=24;
  const W=P*2+L.cols*CW+(L.cols-1)*G,H=P*2+L.rows*CH+(L.rows-1)*G;const cx=c=>P+c*(CW+G),cy=r=>P+r*(CH+G);const g={cx,cy,W:CW,H:CH,G};
  const ord=dfOrder(d);const num_={};ord.forEach((n,i)=>num_[n.id]=i+1);
  const sel=!ro&&DF.sel?dfGet(d,DF.sel):null;const ghosts={};
  if(sel)dfOpen(d,sel).forEach(out=>{const c=dfSlot(d,sel.id,out);if(c&&!ghosts[c+''])ghosts[c+'']={c,out};});
  const rows=Math.max(L.rows,...Object.values(ghosts).map(x=>x.c[0]+1)),cols=Math.max(L.cols,...Object.values(ghosts).map(x=>x.c[1]+1));
  const back=dfEdges(d).some(e=>{const A=L.pos[e.from],B=L.pos[e.to];return A&&B&&B[0]<A[0];});
  const W2=P*2+cols*CW+(cols-1)*G+(back?G:0),H2=P*2+rows*CH+(rows-1)*G;
  let cells='';if(!ro)for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(dfUsed(L,r,c))continue;const gh=ghosts[[r,c]+''];const on=DF.addAt&&DF.addAt[0]===r&&DF.addAt[1]===c;
    if(gh)cells+=`<g data-dfghost="${r},${c},${sel.id},${gh.out}" class="dfghost ${on?'pick':''}" role="button" aria-label="Agregar ${gh.out==='yes'?'camino SÍ':gh.out==='no'?'camino NO':'siguiente paso'}"><rect x="${cx(c)}" y="${cy(r)}" width="${CW}" height="${CH}" rx="14"/><text x="${cx(c)+CW/2}" y="${cy(r)+CH/2+2}" text-anchor="middle" class="dfgp">+</text><text x="${cx(c)+CW/2}" y="${cy(r)+CH/2+26}" text-anchor="middle" class="dfgl">${gh.out==='yes'?'SÍ':gh.out==='no'?'NO':'SIGUIENTE'}</text></g>`;
    else if(r<L.rows&&c<L.cols)cells+=`<g><rect x="${cx(c)}" y="${cy(r)}" width="${CW}" height="${CH}" rx="14" class="mmcell dfcell ${on?'pick':''}" data-dfcell="${r},${c}"/><text x="${cx(c)+CW/2}" y="${cy(r)+CH/2+10}" text-anchor="middle" class="mmplus" pointer-events="none">${on?'?':'+'}</text></g>`;}
  const ghostArrows=sel?Object.values(ghosts).map(x=>{const P_=dfPath(L.pos[sel.id],x.c,x.out,g);return `<polyline points="${P_.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" class="dfarrow ghost" marker-end="url(#dfahg)"/>`;}).join(''):'';
  const arrows=dfEdges(d).map(e=>{const a=L.pos[e.from],b=L.pos[e.to];if(!a||!b)return '';const P_=dfPath(a,b,e.out,g);const p0=P_[0],p1=P_[1];
    const lx=p0[0]+(p1[0]===p0[0]?10:(p1[0]>p0[0]?8:-8)),ly=p0[1]+(p1[1]===p0[1]?-8:16);
    return `<polyline points="${P_.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" class="dfarrow ${e.out}" marker-end="url(#dfah)"/>${e.label?`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${p1[0]<p0[0]?'end':'start'}" class="dfel ${e.out}">${e.label}</text>`:''}`;}).join('');
  const boxes=d.nodes.map(n=>{const p=L.pos[n.id];if(!p)return '';const x=cx(p[1]),y=cy(p[0]);const on=sel&&sel.id===n.id;const lines=dfWrap(n.desc||'',17);const empty=!String(n.desc).trim();
    const meta=[num(n.tiempo)?fT(num(n.tiempo))+' min':'',n.t==='tra'&&num(n.dist)?fT(num(n.dist))+' m':''].filter(Boolean).join(' · ');
    return `<g class="dfbox ${on?'on':''} ${empty?'empty':''}" ${ro?'':`data-dfbox="${n.id}" tabindex="0" role="button"`} aria-label="${esc(DF_SYM[n.t].n)} ${num_[n.id]||''}: ${esc(n.desc||'sin acción')}">
      <rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="14"/><text x="${x+10}" y="${y+17}" class="dfnum">${num_[n.id]||''}</text>
      ${dfShape(n.t,x+CW/2,y+30)}
      ${(empty?[ro?'—':'ESCRIBE LA ACCIÓN']:lines).map((l,i)=>`<text x="${x+CW/2}" y="${y+68+i*14}" text-anchor="middle" class="dfdesc ${empty?'ph':''}">${esc(l)}</text>`).join('')}
      ${meta?`<text x="${x+CW/2}" y="${y+CH-8}" text-anchor="middle" class="dfmeta">${meta}</text>`:''}</g>`;}).join('');
  return `<svg viewBox="0 0 ${W2} ${H2}" style="min-width:${Math.min(W2,ro?W2*0.7:720)}px" role="img" aria-label="Diagrama de flujo del proceso">
    <defs><marker id="dfah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1B2430"/></marker>
    <marker id="dfahg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#C2410C"/></marker></defs>
    ${cells}${ghostArrows}${arrows}${boxes}</svg>`;}
// ---- lista ----
function vDFList(){
  setHead('Diagramas de flujo',[['Diagramas de flujo','df']]);
  return `<section class="glass panel">
    <div class="row"><div><h2>Diagramas de flujo de proceso</h2><p class="sub">Símbolos ASME: operación, inspección, transporte, demora, almacenamiento y decisiones</p></div>
    <button class="btn orange" type="button" data-dfnew="1">${svg('plus',18,2.2)} Nuevo diagrama</button></div>
    <div class="grid" style="margin-top:18px">
    ${DF.studies.map(st=>{const S_=dfSummary(st);return `<div class="studyrow"><button type="button" class="study" data-dfopen="${st.id}">
      <div class="logo" style="background:rgba(29,95,168,.12);color:var(--blue)" aria-hidden="true">DF</div>
      <div class="meta"><b>${esc(dfName(st))} <span class="tag ${st.metodo==='PROPUESTO'?'on':''}" style="vertical-align:2px;margin-left:6px">${st.metodo==='PROPUESTO'?'PROPUESTO':'ACTUAL'}</span></b><span>${esc(st.fecha)} · ${esc(st.analista||'—')} · ${st.nodes.length} símbolos</span></div>
      <div style="text-align:right"><span class="mono" style="font-size:22px;font-weight:600;color:var(--blue)">${S_.act?fT(S_.tiempo):'—'}</span><br><span style="font-size:12px;color:var(--muted)">min · ${fT(S_.dist)} m</span></div>
      ${svg('next',20,2)}</button><button type="button" class="iconbtn sdel" data-sdel="df|${st.id}" data-sdeln="${esc(dfName(st))}" aria-label="Eliminar ${esc(dfName(st))}" title="Eliminar">${svg('trash',18,2)}</button></div>`;}).join('')}
    ${DF.studies.length?'':`<div class="slot empty" style="min-height:260px"><div style="color:var(--ink2)">${dfIcon('op',40)}</div><b style="font-size:17px">Aún no hay diagramas</b><p>Toca <b>Nuevo diagrama</b> para crear el primero.</p></div>`}
    </div></section>`;}
function dfSteps(){const L=[['info','Información'],['diag','Diagrama'],['res','Resumen']];const idx=L.findIndex(x=>x[0]===DF.view);
  return `<nav class="steps" style="grid-template-columns:repeat(3,minmax(0,1fr))" aria-label="Pasos">${L.map(([v,l],i)=>`<button type="button" class="step ${i<idx?'done':''}" data-dfv="${v}" ${i>idx&&!DF.studies.includes(DF.d)?'disabled':''} ${i===idx?'aria-current="step"':''}><span class="n">0${i+1}</span><span class="lbl">${l}</span></button>`).join('')}</nav>`;}
// ---- editor del símbolo seleccionado ----
function dfEditor(d){const n=DF.sel&&dfGet(d,DF.sel);if(!n)return '';const ord=dfOrder(d);const no=ord.findIndex(x=>x.id===n.id)+1;
  const opts=cur=>`<option value="">— sin conectar —</option>${ord.filter(x=>x.id!==n.id).map((x,i)=>`<option value="${x.id}" ${cur==x.id?'selected':''}>${ord.indexOf(x)+1}. ${esc(DF_SYM[x.t].n)}${x.desc?' · '+esc(String(x.desc).slice(0,28)):''}</option>`).join('')}`;
  return `<div class="dfed glass" data-dfed="${n.id}">
    <div class="row" style="align-items:center"><b style="font-size:16px">${dfIcon(n.t,30)} Paso ${no} · ${DF_SYM[n.t].n}</b><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost sm" data-dfdesel="1">Listo</button><button type="button" class="btn danger sm" data-dfrm="${n.id}">${svg('trash',16,2)} Quitar</button></div></div>
    <div class="chips" style="margin-top:10px" role="group" aria-label="Tipo de símbolo">${Object.keys(DF_SYM).map(t=>`<button type="button" class="chip sm" data-dftype="${t}" aria-pressed="${n.t===t}">${dfIcon(t,22)} ${DF_SYM[t].n}</button>`).join('')}</div>
    <div class="pcgrid" style="margin-top:12px">
      <label class="w2 ${!String(n.desc).trim()?'miss':''}">${dfIsDec(n)?'Pregunta de la decisión':'Acción / descripción'} <span class="req" aria-hidden="true">*</span><input data-dff="desc" value="${esc(n.desc)}" placeholder="${dfIsDec(n)?'Ej. ¿CUMPLE ESPECIFICACIÓN?':n.t==='ini'?'Ej. INICIO / FIN':'Ej. DESCARGAR MATERIAL DEL CAMIÓN'}" autocomplete="off"></label>
      ${n.t!=='ini'&&!dfIsDec(n)?`<label>Responsable<input data-dff="resp" value="${esc(n.resp)}" placeholder="Ej. MONTACARGUISTA" autocomplete="off"></label>
      <label>Tiempo (min)<input data-dff="tiempo" value="${esc(n.tiempo)}" inputmode="decimal" autocomplete="off"></label>
      ${n.t==='tra'?`<label>Distancia (m)<input data-dff="dist" value="${esc(n.dist)}" inputmode="decimal" autocomplete="off"></label>`:''}`:''}
    </div>
    <div class="pcgrid" style="margin-top:10px">${dfOuts(n).map(([k,l])=>`<label>${l?'Camino '+l:'Siguiente paso'}<select data-dfc="${k}">${opts(n[k])}</select></label>`).join('')}</div>
    ${n.t==='ini'&&dfIncoming(d,n.id).length?'<p class="sub" style="margin:8px 0 0">Este «Inicio / fin» recibe flechas: funciona como <b>fin del proceso</b> y no necesita siguiente paso.</p>':''}
  </div>`;}
// ---- vista principal ----
function vDF(){
  if(!DF.d)dfNewStudy();const d=DF.d;const tit=dfName(d);
  setHead(tit,[['Diagramas de flujo','df'],[tit,'df-nuevo']]);
  const del=DF.studies.includes(d)?`<button class="btn danger sm" type="button" data-dfdel="1">${svg('trash',16,2)} Eliminar</button>`:'';
  let body='';
  if(DF.view==='info')body=`<div class="row"><div><h2>Información</h2><p class="sub">Datos del proceso que se va a diagramar</p></div><div style="display:flex;gap:10px;flex-wrap:wrap">${del}<button class="btn" type="button" data-dfv="diag" data-dfneed="1">Continuar al diagrama ${svg('next',18,2.2)}</button></div></div>
    <form class="form" id="dfh" style="margin-top:18px" onsubmit="return false">
      <label class="${DF.miss.includes('titulo')?'miss':''}">Título <span class="req" aria-hidden="true">*</span><input name="titulo" value="${esc(d.titulo)}" placeholder="Ej. RECEPCIÓN DE MATERIA PRIMA" autocomplete="off"></label>
      <label>Proceso<input name="proceso" value="${esc(d.proceso)}" placeholder="Ej. ALMACÉN DE MATERIALES" autocomplete="off"></label>
      <label>Área<input name="area" value="${esc(d.area)}" autocomplete="off"></label>
      <label class="${DF.miss.includes('analista')?'miss':''}">Analista <span class="req" aria-hidden="true">*</span><input name="analista" value="${esc(d.analista)}" autocomplete="off"></label>
      <label>Fecha<input name="fecha" type="date" value="${esc(d.fecha)}"></label>
    </form>
    <div style="margin-top:16px"><span class="mmlbl">Método</span><div class="chips">${['ACTUAL','PROPUESTO'].map(m=>`<button type="button" class="chip" data-dfmet="${m}" aria-pressed="${d.metodo===m}">${m==='ACTUAL'?'Actual (como se hace hoy)':'Propuesto (mejora)'}</button>`).join('')}</div></div>`;
  if(DF.view==='diag'){const W_=dfWarn(d);const sel=DF.sel&&dfGet(d,DF.sel);const from=DF.addFrom&&dfGet(d,DF.addFrom[0]);
    const openers=d.nodes.filter(n=>dfOpen(d,n).length);
    body=`<div class="row"><div><h2>Diagrama</h2><p class="sub">${sel?`Paso seleccionado: toca el <b>+</b> naranja para agregar ${dfIsDec(sel)?'el camino <b>SÍ</b> o <b>NO</b>':'el <b>siguiente paso</b>'}. Arrástralo para moverlo (en tablet: mantén presionado).`:'Toca una casilla libre (+) para poner un símbolo. Toca un símbolo para escribir su acción y agregar lo que sigue. Arrastra para mover o intercambiar.'}</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${del}<button class="btn ghost" type="button" data-dfv="info">${svg('back',18,2.2)} Información</button><button class="btn" type="button" data-dfv="res">Ver resumen ${svg('next',18,2.2)}</button></div></div>
    <div class="chips" style="margin-top:14px">${d.nodes.length?'':`<button type="button" class="chip" data-dfexample="1">Cargar ejemplo</button>`}
      <span class="chip" style="cursor:default">Columnas <button type="button" class="iconbtn" data-dflay="c-" aria-label="Menos columnas">−</button><span class="mono">${d.lay.cols}</span><button type="button" class="iconbtn" data-dflay="c+" aria-label="Más columnas">+</button></span>
      <span class="chip" style="cursor:default">Filas <button type="button" class="iconbtn" data-dflay="r-" aria-label="Menos filas">−</button><span class="mono">${d.lay.rows}</span><button type="button" class="iconbtn" data-dflay="r+" aria-label="Más filas">+</button></span>
      ${W_.length?`<span class="chip dfwarnchip" style="cursor:default">${W_.length} aviso${W_.length>1?'s':''} · ver en Resumen</span>`:d.nodes.length?'<span class="chip" style="cursor:default;color:#15803D">Flujo completo</span>':''}</div>
    ${DF.addAt?`<div class="mmaddbar"><b>${from?`Después de «${esc(from.desc||DF_SYM[from.t].n)}»${DF.addFrom[1]==='yes'?' · camino SÍ':DF.addFrom[1]==='no'?' · camino NO':''}:`:'Agregar en esta casilla:'}</b>
        ${Object.keys(DF_SYM).map(t=>`<button type="button" class="chip" data-dfaddt="${t}">${dfIcon(t,22)} ${DF_SYM[t].n}</button>`).join('')}
        ${!from&&openers.length?`<label class="dfconn">Conectar después de<select data-dfaddfrom="1"><option value="">— sin conectar —</option>${openers.map(n=>dfOpen(d,n).map(k=>`<option value="${n.id}|${k}">${dfOrder(d).indexOf(n)+1}. ${esc(n.desc||DF_SYM[n.t].n).slice(0,30)}${k==='yes'?' · SÍ':k==='no'?' · NO':''}</option>`).join('')).join('')}</select></label>`:''}
        <button type="button" class="chip" data-dfaddcancel="1">Cancelar</button></div>`:''}
    <div class="mmlay dflay">${dfSvg(d)}</div>
    ${dfEditor(d)}
    <div class="legend" style="margin-top:10px">${Object.keys(DF_SYM).map(t=>`<span>${dfIcon(t,22)}${DF_SYM[t].n}</span>`).join('')}</div>`;}
  if(DF.view==='res'){const S_=dfSummary(d);const ord=dfOrder(d);const no={};ord.forEach((n,i)=>no[n.id]=i+1);const W_=dfWarn(d);
    body=`<div class="row"><div><h2>Resumen ASME</h2><p class="sub">${esc(d.titulo)} · método ${d.metodo.toLowerCase()} · ${esc(d.fecha)}</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${del}<button class="btn ghost" type="button" data-dfv="diag">${svg('back',18,2.2)} Diagrama</button><button class="btn orange" type="button" data-dffinish="1">Guardar</button></div></div>
    ${W_.length?`<div class="mmaddbar" style="margin-top:14px"><span><b>${W_.length} aviso${W_.length>1?'s':''}:</b> ${W_.map(([id,t])=>`paso ${no[id]} (${esc(DF_SYM[dfGet(d,id).t].n.toLowerCase())}) ${t}`).join(' · ')}</span><button class="btn sm" type="button" data-dfv="diag">Corregir</button></div>`:''}
    <div class="kpis" style="margin-top:16px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
      <div class="kpi"><span>Actividades</span><span class="v">${S_.act}</span><span class="sub">${S_.dec} decisi${S_.dec===1?'ón':'ones'} · sin contar inicio/fin</span></div>
      <div class="kpi"><span>Tiempo total</span><span class="v">${fT(S_.tiempo)}</span><span class="sub">minutos</span></div>
      <div class="kpi"><span>Distancia recorrida</span><span class="v">${fT(S_.dist)}</span><span class="sub">metros en transportes</span></div>
      <div class="kpi"><span>Operaciones</span><span class="v" style="color:var(--blue)">${pc(S_.pctOp,0)}</span><span class="sub">de las actividades · ${pc(S_.pctOpT,0)} del tiempo (lo que transforma el producto)</span></div>
    </div>
    <div class="tbl smtbl"><table><thead><tr><th style="text-align:left">Símbolo</th><th>Cantidad</th><th>Tiempo (min)</th><th>Distancia (m)</th><th>% del tiempo</th></tr></thead><tbody>
      ${S_.rows.map(r=>`<tr><th>${dfIcon(r.t,26)} ${DF_SYM[r.t].n}</th><td>${r.n}</td><td>${fT(r.tiempo)}</td><td>${r.t==='tra'?fT(r.dist):'—'}</td><td>${S_.tiempo?pc(r.tiempo/S_.tiempo,0):'—'}</td></tr>`).join('')}
      <tr class="trow"><th>Total</th><td>${S_.act}</td><td>${fT(S_.tiempo)}</td><td>${fT(S_.dist)}</td><td>100%</td></tr></tbody></table></div>
    <h3 style="margin:22px 0 4px">Tabla del proceso</h3><p class="sub" style="margin:0">En el orden del flujo, desde el inicio</p>
    <div class="tbl smtbl"><table><thead><tr><th>#</th><th style="text-align:left">Símbolo</th><th style="text-align:left">Acción</th><th style="text-align:left">Responsable</th><th>Tiempo (min)</th><th>Distancia (m)</th><th>Sigue</th></tr></thead><tbody>
      ${ord.map(n=>`<tr><td>${no[n.id]}</td><td style="text-align:left">${dfIcon(n.t,26)}</td><td style="text-align:left">${esc(n.desc)||'<span class="sub">—</span>'}</td><td style="text-align:left">${esc(n.resp)||''}</td><td>${num(n.tiempo)?fT(num(n.tiempo)):''}</td><td>${n.t==='tra'&&num(n.dist)?fT(num(n.dist)):''}</td>
        <td>${dfIsDec(n)?`SÍ → ${n.yes!=null?no[n.yes]:'—'} · NO → ${n.no!=null?no[n.no]:'—'}`:n.next!=null?'→ '+no[n.next]:n.t==='ini'&&dfIncoming(d,n.id).length?'fin':'—'}</td></tr>`).join('')}
    </tbody></table></div>
    <h3 style="margin:22px 0 8px">Diagrama</h3><div class="mmlay dflay">${dfSvg(d,{ro:true})}</div>`;}
  return `${dfSteps()}<section class="glass panel ${S.keep?'':'view'}">${body}</section>`;}
// ---- ejemplo: recepción de materia prima (ficticio) ----
function dfExample(d){d.nodes=[];d.lay={rows:7,cols:3,pos:{}};const A=(t,cell,from,out,desc,o)=>{const n=dfAdd(d,t,cell,from,out);n.desc=desc;Object.assign(n,o||{});return n;};
  const a=A('ini',[0,0],null,null,'LLEGA EL CAMIÓN');const b=A('op',[1,0],a.id,'next','DESCARGAR MATERIAL',{resp:'MONTACARGUISTA',tiempo:'12'});
  const c=A('tra',[2,0],b.id,'next','LLEVAR A ÁREA DE RECIBO',{resp:'MONTACARGUISTA',tiempo:'3',dist:'25'});const e=A('insp',[3,0],c.id,'next','INSPECCIÓN DE RECIBO',{resp:'CALIDAD',tiempo:'15'});
  const f=A('dec',[4,0],e.id,'next','¿CUMPLE ESPECIFICACIÓN?');const g=A('tra',[5,0],f.id,'yes','LLEVAR A ALMACÉN',{resp:'MONTACARGUISTA',tiempo:'4',dist:'40'});
  const h=A('alm',[6,0],g.id,'next','ALMACENAR EN RACK',{resp:'ALMACENISTA',tiempo:'5'});const i=A('ini',[6,1],h.id,'next','FIN');
  const j=A('dem',[4,1],f.id,'no','ESPERA DE DISPOSICIÓN',{resp:'CALIDAD',tiempo:'30'});const k=A('op',[4,2],j.id,'next','RETRABAJO / SELECCIÓN',{resp:'CALIDAD',tiempo:'20'});k.next=e.id;}
// ---- eventos ----
const dfRe=()=>{S.keep=true;render(true);S.keep=false;};
function dfSync(){const f=document.getElementById('dfh');if(f&&DF.d)new FormData(f).forEach((v,k)=>DF.d[k]=v);}
function dfFocus(){if(!DF.focus)return;DF.focus=false;const i=document.querySelector('[data-dff="desc"]');if(i){i.focus({preventScroll:true});i.scrollIntoView({block:'center',behavior:'smooth'});}}
document.addEventListener('click',e=>{
  const b0=e.target.closest&&e.target.closest('button');
  if(b0&&b0.dataset.dfnew){dfNewStudy();go('df-nuevo');return;}
  if(b0&&b0.dataset.dfopen){DF.d=DF.studies.find(x=>x.id==b0.dataset.dfopen);DF.view=DF.d.nodes.length?'res':'info';DF.sel=null;DF.addAt=null;DF.miss=[];go('df-nuevo');return;}
  if(!DF.d)return;const d=DF.d;const tgt=e.target.closest&&e.target.closest('[data-dfbox],[data-dfcell],[data-dfghost]');
  if(tgt&&DF.view==='diag'){const D=tgt.dataset;
    if(D.dfbox){const id=+D.dfbox;DF.sel=DF.sel===id?null:id;DF.addAt=null;DF.addFrom=null;dfRe();return;}
    if(D.dfghost){const[r,c,from,out]=D.dfghost.split(',');DF.addAt=[+r,+c];DF.addFrom=[+from,out];dfRe();return;}
    if(D.dfcell){DF.addAt=D.dfcell.split(',').map(Number);DF.addFrom=null;dfRe();return;}}
  const t=e.target.closest&&e.target.closest('button');if(!t||t.disabled)return;const D=t.dataset;
  if(!Object.keys(D).some(k=>k.startsWith('df')))return;
  if(D.dfv){dfSync();if(D.dfneed){DF.miss=DF_REQ.map(x=>x[0]).filter(k=>!String(d[k]||'').trim());if(DF.miss.length){dfRe();return;}if(!DF.studies.includes(d))DF.studies.unshift(d);}
    DF.addAt=null;DF.view=D.dfv;render();scrollTo({top:0});return;}
  if(D.dfmet){dfSync();d.metodo=D.dfmet;dfRe();return;}
  if(D.dfexample){dfExample(d);DF.sel=null;dfRe();return;}
  if(D.dfaddt){const sel=document.querySelector('[data-dfaddfrom]');let from=DF.addFrom;if(!from&&sel&&sel.value){const[a,b]=sel.value.split('|');from=[+a,b];}
    const n=dfAdd(d,D.dfaddt,DF.addAt,from?from[0]:null,from?from[1]:null);DF.addAt=null;DF.addFrom=null;DF.sel=n.id;DF.focus=true;dfRe();dfFocus();return;}
  if(D.dfaddcancel){DF.addAt=null;DF.addFrom=null;dfRe();return;}
  if(D.dfdesel){DF.sel=null;dfRe();return;}
  if(D.dftype){const n=dfGet(d,DF.sel);const was=dfIsDec(n);n.t=D.dftype;if(was&&!dfIsDec(n)){n.next=n.next??n.yes;n.yes=null;n.no=null;}else if(!was&&dfIsDec(n)){n.yes=n.next;n.next=null;}dfRe();return;}
  if(D.dfrm){const n=dfGet(d,+D.dfrm);ask('¿Quitar este símbolo?','Se quita «'+(n.desc||DF_SYM[n.t].n)+'» y las flechas que llegaban a él.','Quitar',()=>{dfRemove(d,n.id);DF.sel=null;closeAsk();dfRe();});return;}
  if(D.dflay){const L=d.lay;const used=Object.values(L.pos);if(D.dflay==='c+')L.cols++;else if(D.dflay==='r+')L.rows++;
    else if(D.dflay==='c-'){if(L.cols>1&&!used.some(p=>p[1]===L.cols-1))L.cols--;}else if(D.dflay==='r-'){if(L.rows>1&&!used.some(p=>p[0]===L.rows-1))L.rows--;}dfRe();return;}
  if(D.dfdel){ask('¿Eliminar este diagrama?','Se borra «'+dfName(d)+'» con sus '+d.nodes.length+' símbolos. No se puede deshacer.','Eliminar diagrama',()=>{DF.studies=DF.studies.filter(x=>x!==d);DF.d=null;closeAsk();go('df');});return;}
  if(D.dffinish){if(!DF.studies.includes(d))DF.studies.unshift(d);DF.d=null;go('df');return;}
});
document.addEventListener('input',e=>{const el=e.target;const d=DF.d;if(!d||!el.dataset)return;
  if(el.closest&&el.closest('#dfh')){dfSync();if(DF.miss.length)DF.miss=DF.miss.filter(k=>!String(d[k]||'').trim());return;}
  if(el.dataset.dff){const n=dfGet(d,DF.sel);if(!n)return;n[el.dataset.dff]=el.value;
    if(el.dataset.dff==='desc'){el.closest('label').classList.toggle('miss',!el.value.trim());const g=document.querySelector(`[data-dfbox="${n.id}"]`);if(g){const tx=[...g.querySelectorAll('.dfdesc')];const L=dfWrap(el.value,17);tx.forEach((t,i)=>{t.textContent=L[i]||(i===0&&!el.value.trim()?'ESCRIBE LA ACCIÓN':'');t.classList.toggle('ph',!el.value.trim());});}}}
});
document.addEventListener('change',e=>{const el=e.target;const d=DF.d;if(!d||!el.dataset||!el.dataset.dfc)return;const n=dfGet(d,DF.sel);if(!n)return;n[el.dataset.dfc]=el.value===''?null:+el.value;dfRe();});
// ---- arrastrar símbolos: a una casilla libre = mover; sobre otro símbolo = intercambiar ----
let DFD=null;
document.addEventListener('pointerdown',e=>{if(!DF.d||DF.view!=='diag'||e.button>0||DFD)return;const bx=e.target.closest&&e.target.closest('[data-dfbox]');if(!bx)return;
  DFD={el:bx,id:+bx.dataset.dfbox,x:e.clientX,y:e.clientY,touch:e.pointerType!=='mouse'};
  if(DFD.touch)DFD.timer=setTimeout(()=>{if(DFD&&!DFD.active){DFD.active=true;document.body.classList.add('dragging');DFD.el.classList.add('mmdrag');if(navigator.vibrate)try{navigator.vibrate(20)}catch(_){}}},280);});
document.addEventListener('pointermove',e=>{if(!DFD)return;
  if(!DFD.active){if(Math.hypot(e.clientX-DFD.x,e.clientY-DFD.y)<=6)return;if(DFD.touch){clearTimeout(DFD.timer);DFD=null;return;}DFD.active=true;document.body.classList.add('dragging');DFD.el.classList.add('mmdrag');}
  e.preventDefault();const sv=DFD.el.ownerSVGElement;const k=sv.viewBox.baseVal.width/sv.getBoundingClientRect().width;DFD.el.setAttribute('transform',`translate(${(e.clientX-DFD.x)*k},${(e.clientY-DFD.y)*k})`);
  document.querySelectorAll('.dfcell.hov,.dfbox.hov,.dfghost.hov').forEach(c=>c.classList.remove('hov'));const t=document.elementFromPoint(e.clientX,e.clientY);const c=t&&t.closest('[data-dfcell],[data-dfbox],[data-dfghost]');DFD.tgt=c&&c!==DFD.el?c:null;if(DFD.tgt)DFD.tgt.classList.add('hov');});
document.addEventListener('pointerup',()=>{if(!DFD)return;const D=DFD;DFD=null;clearTimeout(D.timer);if(!D.active)return;DRAG_SUPPRESS=true;setTimeout(()=>DRAG_SUPPRESS=false,0);document.body.classList.remove('dragging');
  const d=DF.d;if(D.tgt){const T=D.tgt.dataset;if(T.dfbox)dfSwap(d.lay,D.id,+T.dfbox);else{const s=(T.dfcell||T.dfghost).split(',');dfMoveTo(d.lay,D.id,[+s[0],+s[1]]);}}dfRe();});
document.addEventListener('pointercancel',()=>{if(DFD){clearTimeout(DFD.timer);const k=DFD.active;DFD=null;document.body.classList.remove('dragging');if(k)dfRe();}});
document.addEventListener('touchmove',e=>{if(DFD&&DFD.active)e.preventDefault();},{passive:false});
document.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('[data-dfbox],[data-dfcell],[data-dfghost]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
