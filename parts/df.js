// ===== DIAGRAMA DE FLUJO DE PROCESO · pantallas =====
const DF={studies:[],d:null,view:'info',sel:null,last:null,focus:false,miss:[]};
const DF_REQ=[['titulo','Título'],['analista','Analista']];
const dfName=d=>d.titulo||'Nuevo diagrama';
function dfNewStudy(){DF.d={id:nid(),titulo:'',proceso:'',area:'',analista:'',fecha:new Date().toISOString().slice(0,10),metodo:'ACTUAL',nodes:[],lay:{rows:5,cols:4,pos:{}}};DF.view='info';DF.sel=null;DF.last=null;DF.miss=[];}
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
// Hoja en blanco: cuadrícula invisible (los símbolos se acomodan solos), flechas en escuadra y símbolos
const DFG={CW:150,CH:112,G:58,P:24};
function dfFit(d){const ps=Object.values(d.lay.pos);const mr=ps.length?Math.max(...ps.map(p=>p[0])):-1,mc=ps.length?Math.max(...ps.map(p=>p[1])):-1;
  d.lay.rows=Math.max(window.innerWidth<=700?5:4,mr+2);d.lay.cols=Math.max(window.innerWidth<=700?2:4,mc+2);}
function dfSvg(d,o){o=o||{};const ro=!!o.ro;const L=d.lay;const{CW,CH,G,P}=DFG;
  if(!ro)dfFit(d);const ps=Object.values(L.pos);const rows=ro?Math.max(1,...ps.map(p=>p[0]+1)):L.rows,cols=ro?Math.max(1,...ps.map(p=>p[1]+1)):L.cols;
  const back=dfEdges(d).some(e=>{const A=L.pos[e.from],B=L.pos[e.to];return A&&B&&B[0]<A[0];});
  const W=P*2+cols*CW+(cols-1)*G+(back?G:0),H=P*2+rows*CH+(rows-1)*G;const cx=c=>P+c*(CW+G),cy=r=>P+r*(CH+G);const g={cx,cy,W:CW,H:CH,G};
  const ord=dfOrder(d);const no={};ord.forEach((n,i)=>no[n.id]=i+1);
  const arrows=dfEdges(d).map(e=>{const a=L.pos[e.from],b=L.pos[e.to];if(!a||!b)return '';const P_=dfPath(a,b,e.out,g);const p0=P_[0],p1=P_[1];
    const lx=p0[0]+(p1[0]===p0[0]?10:(p1[0]>p0[0]?8:-8)),ly=p0[1]+(p1[1]===p0[1]?-8:16);
    return `<polyline points="${P_.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" class="dfarrow ${e.out}" marker-end="url(#dfah)"/>${e.label?`<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${p1[0]<p0[0]?'end':'start'}" class="dfel ${e.out}">${e.label}</text>`:''}`;}).join('');
  const boxes=d.nodes.map(n=>{const p=L.pos[n.id];if(!p)return '';const x=cx(p[1]),y=cy(p[0]);const on=!ro&&DF.sel===n.id;const lines=dfWrap(n.desc||'',17);const empty=!String(n.desc).trim();
    const meta=[num(n.tiempo)?fT(num(n.tiempo))+' min':'',n.t==='tra'&&num(n.dist)?fT(num(n.dist))+' m':''].filter(Boolean).join(' · ');
    return `<g class="dfbox ${on?'on':''} ${empty?'empty':''}" ${ro?'':`data-dfbox="${n.id}" tabindex="0" role="button"`} aria-label="${esc(DF_SYM[n.t].n)} ${no[n.id]||''}: ${esc(n.desc||'sin acción')}">
      <rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="14"/><text x="${x+10}" y="${y+17}" class="dfnum">${no[n.id]||''}</text>
      ${dfShape(n.t,x+CW/2,y+30)}
      ${(empty?[ro?'—':'ESCRIBE LA ACCIÓN']:lines).map((l,i)=>`<text x="${x+CW/2}" y="${y+68+i*14}" text-anchor="middle" class="dfdesc ${empty?'ph':''}">${esc(l)}</text>`).join('')}
      ${meta?`<text x="${x+CW/2}" y="${y+CH-8}" text-anchor="middle" class="dfmeta">${meta}</text>`:''}</g>`;}).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="min-width:${ro?Math.round(W*0.7):Math.min(W,window.innerWidth<=700?W*0.62:720)}px" ${ro?'':'data-dfsvg="1"'} role="img" aria-label="Diagrama de flujo del proceso">
    <defs><marker id="dfah${ro?'r':''}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1B2430"/></marker>
    ${ro?'':'<pattern id="dfdots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" fill="#C9D1DA"/></pattern>'}</defs>
    ${ro?'':`<rect x="0" y="0" width="${W}" height="${H}" fill="url(#dfdots)" data-dfsheet="1"/>`}${(ro?arrows.replace(/url\(#dfah\)/g,'url(#dfahr)'):arrows)}${boxes}</svg>`;}
// Convierte un punto de la pantalla a la casilla más cercana de la hoja
function dfCellAt(svg,x,y){const pt=svg.createSVGPoint();pt.x=x;pt.y=y;const q=pt.matrixTransform(svg.getScreenCTM().inverse());const{CW,CH,G,P}=DFG;
  return [Math.max(0,Math.round((q.y-P-CH/2)/(CH+G))),Math.max(0,Math.round((q.x-P-CW/2)/(CW+G)))];}
function dfNearFree(L,cell,skip){const free=(r,c)=>r>=0&&c>=0&&!Object.entries(L.pos).some(([id,p])=>id!=skip&&p[0]===r&&p[1]===c);if(free(cell[0],cell[1]))return cell;
  for(let k=1;k<12;k++)for(const[a,b]of[[k,0],[0,k],[0,-k],[-k,0],[k,k],[k,-k],[-k,k],[-k,-k]])if(free(cell[0]+a,cell[1]+b))return [cell[0]+a,cell[1]+b];return [cell[0]+12,cell[1]];}
// Antecesor por defecto: el último símbolo que se puso, si todavía tiene una salida libre
function dfDefPrev(d){const n=DF.last&&dfGet(d,DF.last);if(!n)return null;const o=dfOpen(d,n);return o.length?[n.id,o[0]]:null;}
function dfPlace(d,t,cell){const prev=dfDefPrev(d);const n=dfAdd(d,t,dfNearFree(d.lay,cell),prev?prev[0]:null,prev?prev[1]:null);DF.last=n.id;DF.sel=n.id;DF.focus=true;return n;}
function dfAutoCell(d){const prev=dfDefPrev(d);if(prev){const c=dfSlot(d,prev[0],prev[1]);if(c)return c;}
  if(!d.nodes.length)return [0,0];const ps=Object.values(d.lay.pos);return [Math.max(...ps.map(p=>p[0]))+1,0];}
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
// ---- nube junto al símbolo: pide la información ----
function dfPop(d){const n=DF.sel&&dfGet(d,DF.sel);if(!n)return '';const ord=dfOrder(d);const no={};ord.forEach((x,i)=>no[x.id]=i+1);
  const inc=dfIncoming(d,n.id)[0];const cur=inc?inc[0]+'|'+inc[1]:'';
  const prevOpts=ord.filter(x=>x.id!==n.id&&!(x.t==='ini'&&dfIncoming(d,x.id).length)).map(x=>dfOuts(x).map(([k,l])=>{const v=x.id+'|'+k;const busy=x[k]!=null&&x[k]!==n.id;
    return `<option value="${v}" ${v===cur?'selected':''}>${no[x.id]}. ${esc(String(x.desc||DF_SYM[x.t].n).slice(0,26))}${l?' · '+l:''}${busy?' (ya conectado)':''}</option>`;}).join('')).join('');
  const nextOpts=c=>`<option value="">— nada —</option>${ord.filter(x=>x.id!==n.id).map(x=>`<option value="${x.id}" ${c==x.id?'selected':''}>${no[x.id]}. ${esc(String(x.desc||DF_SYM[x.t].n).slice(0,26))}</option>`).join('')}`;
  return `<div class="dfpop" id="dfpop" role="dialog" aria-label="Paso ${no[n.id]} · ${DF_SYM[n.t].n}">
    <div class="dfpoph"><b>${dfIcon(n.t,26)} Paso ${no[n.id]}</b><button type="button" class="iconbtn" data-dfdesel="1" aria-label="Cerrar">✕</button></div>
    <div class="dftypes" role="group" aria-label="Tipo de símbolo">${Object.keys(DF_SYM).map(t=>`<button type="button" class="dft" data-dftype="${t}" aria-pressed="${n.t===t}" title="${DF_SYM[t].n}" aria-label="${DF_SYM[t].n}">${dfIcon(t,26)}</button>`).join('')}<span class="hint">${DF_SYM[n.t].n}</span></div>
    <label class="${!String(n.desc).trim()?'miss':''}">${dfIsDec(n)?'Pregunta':'Acción'} <span class="req" aria-hidden="true">*</span><input data-dff="desc" value="${esc(n.desc)}" placeholder="${dfIsDec(n)?'Ej. ¿CUMPLE?':n.t==='ini'?'Ej. INICIO / FIN':'Ej. DESCARGAR MATERIAL'}" autocomplete="off" enterkeyhint="done"></label>
    ${n.t!=='ini'&&!dfIsDec(n)?`<label>Responsable<input data-dff="resp" value="${esc(n.resp)}" autocomplete="off"></label>
      <div class="dfpop2"><label>Tiempo (min)<input data-dff="tiempo" value="${esc(n.tiempo)}" inputmode="decimal" autocomplete="off"></label>${n.t==='tra'?`<label>Distancia (m)<input data-dff="dist" value="${esc(n.dist)}" inputmode="decimal" autocomplete="off"></label>`:''}</div>`:''}
    <label>Viene de<select data-dfprev="1"><option value="">— es el inicio / sin antecesor —</option>${prevOpts}</select></label>
    ${dfOuts(n).map(([k,l])=>`<label>${l?'Camino '+l+' va a':'Va a'}<select data-dfc="${k}">${nextOpts(n[k])}</select></label>`).join('')}
    <div class="row" style="margin-top:6px;gap:8px"><button type="button" class="btn danger sm" data-dfrm="${n.id}">${svg('trash',16,2)} Quitar</button><button type="button" class="btn sm" data-dfdesel="1">Listo</button></div>
  </div>`;}
function dfPopClean(keep){document.querySelectorAll('body > .dfpop').forEach(x=>{if(x!==keep)x.remove();});}
function dfPlacePop(){const pop=document.querySelector('.dflay #dfpop');dfPopClean(null);if(!pop)return;const wrap=pop.parentElement;const g=document.querySelector(`[data-dfbox="${DF.sel}"]`);
  if(window.innerWidth<=700){pop.classList.add('sheet');document.body.appendChild(pop);if(g){const r=g.getBoundingClientRect();const room=window.innerHeight-pop.offsetHeight-16;if(r.bottom>room||r.top<70)scrollBy({top:r.top-Math.max(70,room-r.height-10),behavior:'smooth'});}return;}
  if(!g)return;const r=g.getBoundingClientRect(),w=wrap.getBoundingClientRect();let left=r.right-w.left+wrap.scrollLeft+14;
  if(left+pop.offsetWidth>wrap.scrollWidth-6)left=r.left-w.left+wrap.scrollLeft-pop.offsetWidth-14;
  let top=r.top-w.top+wrap.scrollTop-8;top=Math.max(6,Math.min(top,wrap.scrollHeight-pop.offsetHeight-6));pop.style.left=Math.max(6,left)+'px';pop.style.top=top+'px';}
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
  if(DF.view==='diag'){const W_=dfWarn(d);
    body=`<div class="row"><div><h2>Diagrama</h2><p class="sub">Arrastra un símbolo de la barra a la hoja (o tócalo para ponerlo debajo del último). Se abre una nube para escribir la acción y de qué paso viene. Toca un símbolo para editarlo; arrástralo para moverlo.</p></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${del}<button class="btn ghost" type="button" data-dfv="info">${svg('back',18,2.2)} Información</button><button class="btn" type="button" data-dfv="res">Ver resumen ${svg('next',18,2.2)}</button></div></div>
    <div class="dfpal" role="toolbar" aria-label="Símbolos: arrastra a la hoja">${Object.keys(DF_SYM).map(t=>`<button type="button" class="dfpb" data-dfpal="${t}">${dfIcon(t,30)}<span>${DF_SYM[t].n}</span></button>`).join('')}</div>
    <div class="chips" style="margin-top:10px">${d.nodes.length?'':`<button type="button" class="chip" data-dfexample="1">Cargar ejemplo</button>`}
      ${W_.length?`<span class="chip dfwarnchip" style="cursor:default">${W_.length} aviso${W_.length>1?'s':''} · ver en Resumen</span>`:d.nodes.length?'<span class="chip" style="cursor:default;color:#15803D">Flujo completo</span>':''}</div>
    <div class="mmlay dflay">${dfSvg(d)}${dfPop(d)}</div>`;}
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
const dfRe=()=>{S.keep=true;render(true);S.keep=false;dfPlacePop();};
function dfSync(){const f=document.getElementById('dfh');if(f&&DF.d)new FormData(f).forEach((v,k)=>DF.d[k]=v);}
function dfFocus(){if(!DF.focus)return;DF.focus=false;const i=document.querySelector('[data-dff="desc"]');if(i)i.focus({preventScroll:true});}
document.addEventListener('click',e=>{
  const b0=e.target.closest&&e.target.closest('button');
  if(b0&&b0.dataset.dfnew){dfNewStudy();go('df-nuevo');return;}
  if(b0&&b0.dataset.dfopen){DF.d=DF.studies.find(x=>x.id==b0.dataset.dfopen);DF.view=DF.d.nodes.length?'res':'info';DF.sel=null;DF.last=null;DF.miss=[];go('df-nuevo');return;}
  if(!DF.d)return;const d=DF.d;
  const bx=e.target.closest&&e.target.closest('[data-dfbox]');if(bx&&DF.view==='diag'){const id=+bx.dataset.dfbox;DF.sel=DF.sel===id?null:id;dfRe();return;}
  if(e.target.closest&&e.target.closest('[data-dfsheet]')&&DF.sel){DF.sel=null;dfRe();return;}
  if(!b0||b0.disabled)return;const D=b0.dataset;if(!Object.keys(D).some(k=>k.startsWith('df')))return;
  if(D.dfpal){dfPlace(d,D.dfpal,dfAutoCell(d));dfRe();dfFocus();return;}
  if(D.dfv){dfSync();if(D.dfneed){DF.miss=DF_REQ.map(x=>x[0]).filter(k=>!String(d[k]||'').trim());if(DF.miss.length){dfRe();return;}if(!DF.studies.includes(d))DF.studies.unshift(d);}
    DF.sel=null;dfPopClean();DF.view=D.dfv;render();scrollTo({top:0});return;}
  if(D.dfmet){dfSync();d.metodo=D.dfmet;dfRe();return;}
  if(D.dfexample){dfExample(d);DF.sel=null;DF.last=null;dfRe();return;}
  if(D.dfdesel){DF.sel=null;dfRe();return;}
  if(D.dftype){const n=dfGet(d,DF.sel);const was=dfIsDec(n);n.t=D.dftype;if(was&&!dfIsDec(n)){n.next=n.next??n.yes;n.yes=null;n.no=null;}else if(!was&&dfIsDec(n)){n.yes=n.next;n.next=null;}dfRe();return;}
  if(D.dfrm){const n=dfGet(d,+D.dfrm);ask('¿Quitar este símbolo?','Se quita «'+(n.desc||DF_SYM[n.t].n)+'» y las flechas que llegaban a él.','Quitar',()=>{dfRemove(d,n.id);if(DF.last===n.id)DF.last=null;DF.sel=null;closeAsk();dfRe();});return;}
  if(D.dfdel){ask('¿Eliminar este diagrama?','Se borra «'+dfName(d)+'» con sus '+d.nodes.length+' símbolos. No se puede deshacer.','Eliminar diagrama',()=>{DF.studies=DF.studies.filter(x=>x!==d);DF.d=null;closeAsk();go('df');});return;}
  if(D.dffinish){if(!DF.studies.includes(d))DF.studies.unshift(d);DF.d=null;go('df');return;}
});
document.addEventListener('input',e=>{const el=e.target;const d=DF.d;if(!d||!el.dataset)return;
  if(el.closest&&el.closest('#dfh')){dfSync();if(DF.miss.length)DF.miss=DF.miss.filter(k=>!String(d[k]||'').trim());return;}
  if(el.dataset.dff){const n=dfGet(d,DF.sel);if(!n)return;n[el.dataset.dff]=el.value;const g=document.querySelector(`[data-dfbox="${n.id}"]`);
    if(el.dataset.dff==='desc'){el.closest('label').classList.toggle('miss',!el.value.trim());if(g){const tx=[...g.querySelectorAll('.dfdesc')];const L=dfWrap(el.value,17);tx.forEach((t,i)=>{t.textContent=L[i]||(i===0&&!el.value.trim()?'ESCRIBE LA ACCIÓN':'');t.classList.toggle('ph',!el.value.trim());});}}}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset&&e.target.dataset.dff&&DF.sel){e.preventDefault();DF.sel=null;dfRe();}});
document.addEventListener('change',e=>{const el=e.target;const d=DF.d;if(!d||!el.dataset)return;const n=DF.sel&&dfGet(d,DF.sel);if(!n)return;
  if(el.dataset.dfc){n[el.dataset.dfc]=el.value===''?null:+el.value;dfRe();return;}
  if(el.dataset.dfprev){const inc=dfIncoming(d,n.id)[0];if(inc)dfGet(d,inc[0])[inc[1]]=null;if(el.value){const[id,k]=el.value.split('|');dfGet(d,+id)[k]=n.id;
    if(DF.last===n.id){const old=d.lay.pos[n.id];delete d.lay.pos[n.id];const c=dfSlot(d,+id,k);d.lay.pos[n.id]=c||old;}}   // el recién puesto se reacomoda junto a su antecesor
    dfRe();}});
// ---- arrastrar: de la barra a la hoja (poner) y símbolos dentro de la hoja (mover / intercambiar) ----
let DFD=null;
function dfdStart(){const D=DFD;D.active=true;document.body.classList.add('dragging');if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){}
  if(D.kind==='pal'){const g=document.createElement('div');g.className='dfghostpal';g.innerHTML=dfIcon(D.t,44);document.body.appendChild(g);D.ghost=g;}else D.el.classList.add('mmdrag');}
function dfdMove(x,y){const D=DFD;if(D.kind==='pal'){D.ghost.style.left=(x-28)+'px';D.ghost.style.top=(y-28)+'px';}
  else{const sv=D.el.ownerSVGElement;const k=sv.viewBox.baseVal.width/sv.getBoundingClientRect().width;D.el.setAttribute('transform',`translate(${(x-D.x)*k},${(y-D.y)*k})`);}D.lx=x;D.ly=y;}
document.addEventListener('pointerdown',e=>{if(!DF.d||DF.view!=='diag'||e.button>0||DFD)return;
  const pb=e.target.closest&&e.target.closest('[data-dfpal]'),bx=e.target.closest&&e.target.closest('[data-dfbox]');if(!pb&&!bx)return;
  DFD=pb?{kind:'pal',t:pb.dataset.dfpal,x:e.clientX,y:e.clientY,touch:e.pointerType!=='mouse'}:{kind:'box',el:bx,id:+bx.dataset.dfbox,x:e.clientX,y:e.clientY,touch:e.pointerType!=='mouse'};
  if(DFD.kind==='box'&&DFD.touch)DFD.timer=setTimeout(()=>{if(DFD&&!DFD.active){dfdStart();dfdMove(DFD.x,DFD.y);}},280);});
document.addEventListener('pointermove',e=>{const D=DFD;if(!D)return;
  if(!D.active){const dx=e.clientX-D.x,dy=e.clientY-D.y;if(Math.hypot(dx,dy)<=7)return;
    if(D.touch){if(D.kind==='box'){clearTimeout(D.timer);DFD=null;return;}if(Math.abs(dx)>Math.abs(dy)){DFD=null;return;}}   // en la barra: de lado = deslizar la barra; hacia abajo = arrastrar
    dfdStart();}
  e.preventDefault();dfdMove(e.clientX,e.clientY);});
document.addEventListener('pointerup',e=>{const D=DFD;if(!D)return;DFD=null;clearTimeout(D.timer);if(!D.active)return;DRAG_SUPPRESS=true;setTimeout(()=>DRAG_SUPPRESS=false,0);document.body.classList.remove('dragging');
  const d=DF.d;const sv=document.querySelector('[data-dfsvg]');if(D.ghost)D.ghost.remove();
  const over=sv&&(()=>{const r=sv.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom;})();
  if(D.kind==='pal'){if(over){dfPlace(d,D.t,dfCellAt(sv,e.clientX,e.clientY));dfRe();dfFocus();}return;}
  if(over){const cell=dfCellAt(sv,e.clientX,e.clientY);const other=Object.entries(d.lay.pos).find(([id,p])=>id!=D.id&&p[0]===cell[0]&&p[1]===cell[1]);
    if(other)dfSwap(d.lay,D.id,+other[0]);else dfMoveTo(d.lay,D.id,cell);}
  dfRe();});
document.addEventListener('pointercancel',()=>{if(DFD){clearTimeout(DFD.timer);if(DFD.ghost)DFD.ghost.remove();const k=DFD.active;DFD=null;document.body.classList.remove('dragging');if(k)dfRe();}});
document.addEventListener('touchmove',e=>{if(DFD&&DFD.active)e.preventDefault();},{passive:false});
document.addEventListener('keydown',e=>{const g=e.target.closest&&e.target.closest('[data-dfbox]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();g.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
window.addEventListener('resize',()=>{if(DF.sel)dfPlacePop();});
window.addEventListener('hashchange',()=>dfPopClean());
