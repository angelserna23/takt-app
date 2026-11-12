  if(S.step===4){
    const r=wsCalc(d);const pal=palette(d.acts);
    if(d.rview!=='total'&&!d.ops.some(o=>o.id===d.rview))d.rview=d.ops[0].id;
    const tabs=`<div class="chips" role="tablist" aria-label="Vista de resultados" style="margin-top:16px">
      ${r.rows.map((o,i)=>`<button type="button" role="tab" class="chip" data-rview="${o.id}" aria-selected="${d.rview===o.id}" aria-pressed="${d.rview===o.id}"><span class="mono" style="background:transparent;padding:0">${i+1}</span><span>${esc(o.name)}</span><span class="mono" style="color:${o.sum?'':'inherit'}">${o.sum?pc(o.innec):'—'}</span></button>`).join('')}
      <span style="width:1px;align-self:stretch;background:var(--line);margin:0 4px"></span>
      <button type="button" role="tab" class="chip" data-rview="total" aria-selected="${d.rview==='total'}" aria-pressed="${d.rview==='total'}"><span>General de línea</span></button></div>`;
    let inner='';
    if(d.rview!=='total'){
      const x=r.rows.find(o=>o.id===d.rview);
      const rank=[...d.acts].filter(a=>x.pct[a.id]>0).sort((a,b)=>x.pct[b.id]-x.pct[a.id]);
      const opp=rank.filter(a=>!a.nec);
      inner=`<div class="kpis" style="margin-top:16px">
        <div class="kpi"><span>Necesario</span><span class="v" style="color:var(--blue)">${pc(x.nec,1)}</span></div>
        <div class="kpi"><span>Innecesario</span><span class="v" style="color:var(--orange)">${pc(x.innec,1)}</span></div>
        <div class="kpi"><span>Observaciones</span><span class="v">${x.sum}</span></div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px">
        <b style="font-size:16px">¿A qué dedica su tiempo ${esc(x.name)}?</b>
        ${x.sum?`<div class="band inn" style="margin-top:16px"><span>INNECESARIO</span><span class="mono">${pc(x.innec)}</span></div>
        <div class="stack big" role="img" aria-label="Distribución de actividades de ${esc(x.name)}">${d.acts.filter(a=>x.pct[a.id]>0).map(a=>`<div class="fill sg" data-w="${x.pct[a.id]*100}" title="${esc(a.name)}: ${pc(x.pct[a.id],1)}" style="background:${pal[a.id]};color:${LIGHT.has(pal[a.id])?'#1B2430':'#fff'}">${x.pct[a.id]>=0.035?pc(x.pct[a.id]):''}</div>`).join('')}</div>
        <div class="band nec"><span>NECESARIO</span><span class="mono">${pc(x.nec)}</span></div>
        <div class="axis" aria-hidden="true">${[0,10,20,30,40,50,60,70,80,90,100].map(v=>`<span>${v}%</span>`).join('')}</div>
        <div class="legend" style="margin-top:14px">${d.acts.filter(a=>x.pct[a.id]>0).map(a=>`<span><i style="background:${pal[a.id]}"></i>${esc(a.name)}</span>`).join('')}</div>`
        :`<div class="slot empty" style="min-height:180px;margin-top:14px"><p>Este operador aún no tiene observaciones. Regresa al paso 03.</p></div>`}
      </div>
      ${x.sum?`<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr));margin-top:16px">
        <div class="glass" style="padding:20px;border-radius:18px"><b style="font-size:16px">Área de oportunidad</b><p class="sub">Actividades innecesarias, de mayor a menor</p>
          <div class="bars" style="margin-top:14px">${opp.length?opp.map(a=>`<div class="bar"><span>${esc(a.name)}</span><div class="track"><div class="fill" data-w="${x.pct[a.id]*100/ (opp[0]?x.pct[opp[0].id]:1)}" style="background:var(--orange)"></div></div><span class="mono" style="text-align:right;font-weight:600;color:var(--orange)">${pc(x.pct[a.id],1)}</span></div>`).join(''):'<p class="sub">Sin actividades innecesarias registradas.</p>'}</div></div>
        <div class="glass" style="padding:20px;border-radius:18px"><b style="font-size:16px">Todas sus actividades</b><p class="sub">Ordenadas de mayor a menor</p>
          <div class="bars" style="margin-top:14px">${rank.map(a=>`<div class="bar"><span>${esc(a.name)}</span><div class="track"><div class="fill" data-w="${x.pct[a.id]*100/x.pct[rank[0].id]}" style="background:${a.nec?'var(--blue)':'var(--orange)'}"></div></div><span class="mono" style="text-align:right;font-weight:600">${pc(x.pct[a.id],1)}</span></div>`).join('')}</div></div>
      </div>`:''}`;
    } else {
      const cmp=[...r.rows].sort((a,b)=>b.innec-a.innec);const mx=Math.max(...cmp.map(o=>o.innec),0.0001);
      inner=`<div class="kpis" style="margin-top:16px">
        <div class="kpi"><span>Necesario · línea</span><span class="v" style="color:var(--blue)">${pc(r.total.nec,1)}</span></div>
        <div class="kpi"><span>Innecesario · línea</span><span class="v" style="color:var(--orange)">${pc(r.total.innec,1)}</span></div>
        <div class="kpi"><span>Observaciones</span><span class="v">${r.total.sum}</span><span class="sub">${d.ops.length} operador${d.ops.length>1?'es':''}</span></div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">¿Quién pesa más en lo innecesario?</b><p class="sub">Operadores de mayor a menor % innecesario</p>
        <div class="bars" style="margin-top:14px">${cmp.map(o=>`<div class="bar"><span>${esc(o.name)}</span><div class="track"><div class="fill" data-w="${o.innec*100/mx}" style="background:var(--orange)"></div></div><span class="mono" style="text-align:right;font-weight:600;color:var(--orange)">${o.sum?pc(o.innec,1):'—'}</span></div>`).join('')}</div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Distribución por operador y línea</b>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px">${r.rows.map(x=>stackRow(x,d.acts,pal,false)).join('')}${stackRow(r.total,d.acts,pal,true)}</div>
        <div class="legend" style="margin-top:16px">${d.acts.map(a=>`<span><i style="background:${pal[a.id]}"></i>${esc(a.name)}</span>`).join('')}</div></div>
      <div class="glass" style="margin-top:16px;padding:20px;border-radius:18px"><b style="font-size:16px">Resultado %</b>
        <div class="tbl"><table><thead><tr><th>Operador</th>${d.acts.map(a=>`<th class="${a.nec?'':'hinn'}">${esc(a.name)}</th>`).join('')}<th>Innec.</th><th>Nec.</th><th>Obs.</th></tr></thead>
        <tbody>${[...r.rows,r.total].map(x=>`<tr class="${x.id==='total'?'trow':''}"><th>${esc(x.name)}</th>${d.acts.map(a=>`<td class="${a.nec?'':'hinn'}">${x.sum?pc(x.pct[a.id]):'—'}</td>`).join('')}<td style="color:var(--orange);font-weight:600">${pc(x.innec)}</td><td style="color:var(--blue);font-weight:600">${pc(x.nec)}</td><td>${x.sum}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    body=`<div><h2>04 · Resultados</h2><p class="sub">Primero cada operador y su área de oportunidad; al final, el general de la línea</p></div>${tabs}${inner}`;
  }
