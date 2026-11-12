// ===== EFICIENCIA COMPUESTA · pantalla (vista general de planta dentro de Actual Time) =====
const EC={fy:null,mode:'con'};
const EC_COL=['#1D5FA8','#C2410C','#15803D','#7C3AED','#B45309','#0E7490','#BE185D','#4D7C0F'];
const ecLbl=st=>(st.nombre||'Sin nombre')+(st.tipo==='ENSAMBLE'&&st.mh?' + MH':'');
const ecFys=()=>[...new Set(AT.studies.map(s=>s.fy))].sort((a,b)=>b-a);
function ecData(fy){const list=AT.studies.filter(s=>s.fy===fy).map(st=>{const prev=AT.studies.find(p=>p.fy===fy-1&&p.tipo===st.tipo&&String(p.nombre).trim()===String(st.nombre).trim());
    return Object.assign({st,lbl:ecLbl(st)},ecSeries(st,prev));}).filter(L=>L.months.some(Boolean));
  list.forEach((L,i)=>L.col=EC_COL[i%EC_COL.length]);return {list,plant:ecPlant(list)};}
function ecExample(){const a={id:nid(),nombre:'ENSAMBLE PLANTA 1',tipo:'ENSAMBLE',tipoOtro:'',mh:true,fy:pcFY(),months:Array(12).fill(null)};atExample(a);
  const b={id:nid(),nombre:'MAQUINADO PLANTA 1',tipo:'MAQUINADO',tipoOtro:'',mh:false,fy:pcFY(),months:Array(12).fill(null)};atExample(b);
  AT.studies.unshift(b);AT.studies.unshift(a);EC.fy=pcFY();}
const ecPts=v=>v==null?'':`<small class="ecd" style="color:${v>0.0005?'#15803D':v<-0.0005?'#B42318':'var(--muted)'}">${v>0?'+':v<0?'−':''}${f1(Math.abs(v*100))} pts</small>`;
const ecPct=v=>v==null?'':`<small class="ecd" style="color:${v>0.0005?'#15803D':v<-0.0005?'#B42318':'var(--muted)'}">${v>0?'+':v<0?'−':''}${f1(Math.abs(v*100))} %</small>`;
// trayectoria: una línea por área + planta resaltada
function ecLines(D,key){const W=window.innerWidth<1100?720:1000,H=300,L=52,R=16,T=20,B=34,n=12;const slot=(W-L-R)/n;
  const vals=[];D.list.forEach(A=>A.months.forEach(x=>x&&vals.push(x[key])));D.plant.forEach(x=>x&&vals.push(x[key]));if(!vals.length)return '';
  const lo0=Math.min(...vals),hi0=Math.max(...vals);const st=atNice(Math.max(0.02,(hi0-lo0))/4);const lo=Math.max(0,st*Math.floor((lo0-st*0.3)/st)),hi=st*Math.ceil((hi0+st*0.3)/st);
  const X=i=>L+slot*i+slot/2,Y=v=>T+(1-(v-lo)/(hi-lo))*(H-T-B);const tk=[];for(let v=lo;v<=hi+1e-9;v+=st)tk.push(v);
  const path=(arr,c,w,dash,lbl)=>{const segs=[];let cur=[];arr.forEach((x,i)=>{if(x)cur.push([X(i),Y(x[key]),i,x[key]]);else{if(cur.length)segs.push(cur);cur=[];}});if(cur.length)segs.push(cur);
    return segs.map(s=>`${s.length>1?`<polyline points="${s.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" ${dash?'stroke-dasharray="6 5"':''} stroke-linejoin="round"/>`:''}${s.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${w>3?5:3.6}" fill="${c}"><title>${esc(lbl)} · ${PC_MONTHS[p[2]]}: ${pc(p[3],1)}</title></circle>`).join('')}`).join('');};
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trayectoria de eficiencia por área">${tk.map(v=>`<line x1="${L}" x2="${W-R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="gl"/><text x="${L-8}" y="${(Y(v)+4).toFixed(1)}" text-anchor="end" class="ax">${+(v*100).toFixed(1)}%</text>`).join('')}
    ${PC_MONTHS.map((m,i)=>`<text x="${X(i).toFixed(1)}" y="${H-B+18}" text-anchor="middle" class="ax" style="font-weight:700">${m.slice(0,3).toUpperCase()}</text>`).join('')}
    ${D.list.map(A=>path(A.months,A.col,2.2,false,A.lbl)).join('')}${path(D.plant,'#1B2430',4,false,'Planta')}
    ${(()=>{const li=D.plant.map((x,i)=>x?i:-1).filter(i=>i>=0).pop();if(li==null)return '';const v=D.plant[li][key];return `<text x="${Math.min(W-R-4,X(li)+10).toFixed(1)}" y="${(Y(v)-10).toFixed(1)}" text-anchor="${X(li)+60>W?'end':'start'}" class="lbl" style="font-size:12px">PLANTA ${pc(v,1)}</text>`;})()}</svg>`;}
// mini tendencia de piezas por hora-hombre
function ecMini(A){const W=320,H=120,L=8,R=8,T=18,B=22,n=12,slot=(W-L-R)/n;const xs=A.months.map(x=>x?x.vol:0);const hi=Math.max(...xs)*1.18||1;const Y=v=>T+(1-v/hi)*(H-T-B);
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Piezas por hora-hombre de ${esc(A.lbl)}">${A.months.map((x,i)=>{const cx=L+slot*i+slot/2;return `<text x="${cx.toFixed(1)}" y="${H-6}" text-anchor="middle" class="ax" style="font-size:9px">${PC_MONTHS[i].slice(0,1)}</text>${x?`<rect x="${(cx-slot*0.32).toFixed(1)}" y="${Y(x.vol).toFixed(1)}" width="${(slot*0.64).toFixed(1)}" height="${(H-B-Y(x.vol)).toFixed(1)}" rx="2" fill="${x.dVol==null?'#A7B0BA':x.dVol>=0?'#15803D':'#B42318'}" opacity=".85"><title>${PC_MONTHS[i]}: ${x.vol.toFixed(3)} piezas por hora-hombre${x.dVol==null?'':' · '+(x.dVol>=0?'+':'')+(x.dVol*100).toFixed(1)+' % vs mes anterior'}</title></rect>`:''}`;}).join('')}</svg>`;}
function vEC(){
  const fys=ecFys();if(EC.fy==null||!fys.includes(EC.fy))EC.fy=fys[0]??pcFY();const fy=EC.fy;
  setHead('Eficiencia compuesta',[['Actual Time','at'],['Eficiencia compuesta','at-planta']]);
  const D=ecData(fy);const key=EC.mode==='sin'?'eficSA':'efic',dk=EC.mode==='sin'?'dEficSA':'dEfic';
  const head=`<div class="row"><div><button type="button" class="btn ghost sm atback" data-go="at">${svg('back',16,2.2)} Actual Time</button><h2 style="margin-top:10px">Eficiencia compuesta · FY${String(fy).padStart(2,'0')}</h2><p class="sub">Vista general de planta: junta los Actual Time del año. Ensamble + manejo de materiales cuentan como una sola área. No se captura nada aquí.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${fys.length>1?`<div class="chips">${fys.map(f=>`<button type="button" class="chip sm" data-ecfy="${f}" aria-pressed="${f===fy}">FY${String(f).padStart(2,'0')}</button>`).join('')}</div>`:''}
    <div class="seg" role="group" aria-label="Eficiencia">${[['con','CON AFECTACIÓN'],['sin','SIN AFECTACIÓN']].map(([k,l])=>`<button type="button" data-ecmode="${k}" aria-pressed="${EC.mode===k}">${l}</button>`).join('')}</div></div></div>`;
  if(!D.list.length)return `<section class="glass panel ${S.keep?'':'view'}">${head}<div class="slot empty" style="min-height:240px;margin-top:16px"><b style="font-size:17px">Aún no hay Actual Time con meses capturados en FY${String(fy).padStart(2,'0')}</b><p>La eficiencia compuesta se arma sola con los Actual Time de cada área.</p><button class="btn ghost" type="button" data-ecexample="1">Cargar ejemplo de planta (ensamble + MH y maquinado)</button></div></section>`;
  const Y=ecYear(D.plant);const li=D.plant.map((x,i)=>x?i:-1).filter(i=>i>=0).pop();const last=D.plant[li];let prv=null;for(let i=li-1;i>=0;i--)if(D.plant[i]){prv=D.plant[i];break;}
  const used=PC_MONTHS.map((_,i)=>i).filter(i=>D.plant[i]);
  const best=D.list.filter(A=>A.months[li]).sort((a,b)=>b.months[li][key]-a.months[li][key]);
  return `<section class="glass panel ${S.keep?'':'view'}">${head}
    <div class="kpis pck8" style="margin-top:16px">
      <div class="kpi"><span>Planta · año</span><span class="v" style="color:var(--blue)">${pc(Y.efic,1)}</span><span class="sub">con afectación · Σ requeridas ÷ Σ trabajadas</span></div>
      <div class="kpi"><span>Planta · año sin afectación</span><span class="v" style="color:var(--blue)">${pc(Y.eficSA,1)}</span><span class="sub">quitando técnico, evento, TPM, PIC y otros</span></div>
      <div class="kpi"><span>Planta · ${PC_MONTHS[li]}</span><span class="v">${pc(last[key],1)}</span><span class="sub">${prv?ecPts(last[key]-prv[key])+' vs mes anterior':'primer mes del año'} · ${EC.mode==='sin'?'sin':'con'} afectación</span></div>
      <div class="kpi"><span>Áreas · ${PC_MONTHS[li]}</span><span class="v">${best.length}</span><span class="sub">${best.length?'mejor: <b>'+esc(best[0].lbl)+'</b> '+pc(best[0].months[li][key],1)+(best.length>1?' · menor: <b>'+esc(best[best.length-1].lbl)+'</b> '+pc(best[best.length-1].months[li][key],1):''):''}</span></div>
    </div>
    <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Trayectoria de eficiencia ${EC.mode==='sin'?'sin':'con'} afectación</b><p class="sub" style="margin:2px 0 0">Una línea por área; la línea gruesa es la planta (ponderada por horas)</p>
      <div class="stchart parchart">${ecLines(D,key)}</div>
      <div class="legend" style="margin-top:6px">${D.list.map(A=>`<span><i style="background:${A.col}"></i>${esc(A.lbl)}</span>`).join('')}<span><i style="background:#1B2430;height:4px;vertical-align:3px"></i><b>Planta</b></span></div></div>
    <div class="tbl smtbl ectbl"><table><thead><tr><th style="text-align:left">Área</th>${used.map(i=>`<th>${PC_MONTHS[i].slice(0,3).toUpperCase()}</th>`).join('')}<th>Año</th></tr></thead><tbody>
      ${D.list.map(A=>{const y=ecYear(A.months);return `<tr><th><i class="ecdot" style="background:${A.col}"></i>${esc(A.lbl)}</th>${used.map(i=>{const x=A.months[i];return `<td>${x?`<b>${pc(x[key],1)}</b>${ecPts(x[dk])}`:'—'}</td>`;}).join('')}<td><b>${y?pc(y[key],1):'—'}</b></td></tr>`;}).join('')}
      <tr class="trow"><th>PLANTA</th>${used.map((i,k)=>{const x=D.plant[i];const p=k?D.plant[used[k-1]]:null;return `<td><b>${pc(x[key],1)}</b>${p?ecPts(x[key]-p[key]):''}</td>`;}).join('')}<td><b>${pc(Y[key],1)}</b></td></tr>
    </tbody></table></div>
    <div style="margin-top:18px"><b style="font-size:16px">Tendencia de piezas por hora-hombre</b><p class="sub" style="margin:2px 0 0">Cada área contra su mes anterior (verde sube, rojo baja). No se comparan áreas entre sí: cada una tiene su propia escala.</p>
      <div class="ecmini">${D.list.map(A=>{const lm=A.months.map((x,i)=>[x,i]).filter(([x])=>x).pop();return `<div class="glass" style="padding:16px;border-radius:16px"><b style="display:block"><i class="ecdot" style="background:${A.col}"></i>${esc(A.lbl)}</b><div class="ecmv"><span class="mono" style="font-size:22px;font-weight:600">${lm[0].vol.toFixed(3)}</span><span>${lm[0].dVol==null?'<small class="ecd" style="color:var(--muted)">sin mes anterior</small>':ecPct(lm[0].dVol)}<small style="color:var(--muted)">${PC_MONTHS[lm[1]]} · piezas por hora-hombre</small></span></div>${ecMini(A)}</div>`;}).join('')}</div></div>
  </section>`;}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('button');if(!t||t.disabled)return;const D=t.dataset;
  if(D.ecopen){EC.fy=null;go('at-planta');return;}
  if(D.ecfy){EC.fy=+D.ecfy;S.keep=true;render(true);S.keep=false;return;}
  if(D.ecmode){EC.mode=D.ecmode;S.keep=true;render(true);S.keep=false;return;}
  if(D.ecexample){ecExample();render();return;}
});
