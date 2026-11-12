function syncHeader(){const f=document.getElementById('hdr');if(!f||!S.draft)return;new FormData(f).forEach((v,k)=>S.draft[k]=v);}

document.addEventListener('click',e=>{
  const t=e.target.closest('button,a');if(!t)return;const d=S.draft;
  if(t.dataset.go){ if(t.dataset.go==='ws-nuevo'){newDraft();} go(t.dataset.go);return;}
  if(t.dataset.open){S.draft=S.studies.find(x=>x.id==t.dataset.open);S.step=4;go('ws-nuevo');return;}
  if(t.dataset.step){syncHeader();S.step=+t.dataset.step;render();return;}
  if(t.id==='addop'){syncHeader();d.ops.push({id:nid(),name:'Operador '+(d.ops.length+1)});render();return;}
  if(t.dataset.odel){syncHeader();const id=+t.dataset.odel;d.ops=d.ops.filter(o=>o.id!==id);delete d.counts[id];d.log=d.log.filter(l=>l.op!==id);render();return;}
  if(t.id==='addact'){d.acts.push({id:nid(),name:'Nueva actividad',nec:true});render();return;}
  if(t.dataset.adel){const id=+t.dataset.adel;d.acts=d.acts.filter(a=>a.id!==id);Object.values(d.counts).forEach(c=>delete c[id]);d.log=d.log.filter(l=>l.act!==id);render();return;}
  if(t.dataset.anec){const a=d.acts.find(x=>x.id==t.dataset.anec);a.nec=t.dataset.v==='1';render();return;}
  if(t.dataset.cur){d.cur=+t.dataset.cur;render();return;}
  if(t.dataset.tap){const act=+t.dataset.tap;const c=d.counts[d.cur]||(d.counts[d.cur]={});c[act]=(c[act]||0)+1;d.log.push({op:d.cur,act});
    if(d.auto&&d.ops.length>1){const i=d.ops.findIndex(o=>o.id===d.cur);d.cur=d.ops[(i+1)%d.ops.length].id;}
    if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){}
    render(true);const b=document.querySelector(`[data-tap="${act}"]`);if(b){b.classList.add('pulse');}return;}
  if(t.id==='undo'){const l=d.log.pop();if(l){d.counts[l.op][l.act]--;d.cur=l.op;}render(true);return;}
  if(t.id==='save'){syncHeader();if(!d.titulo)d.titulo='Muestreo sin título';d.estado='Cerrado';if(!S.studies.includes(d))S.studies.unshift(d);S.draft=null;go('ws');return;}
  if(t.id==='collapse'){document.getElementById('app').classList.toggle('collapsed');return;}
});
document.addEventListener('input',e=>{
  const el=e.target;const d=S.draft;if(!d)return;
  if(el.dataset.aname){const a=d.acts.find(x=>x.id==el.dataset.aname);if(a)a.name=el.value;}
  if(el.dataset.oname){const o=d.ops.find(x=>x.id==el.dataset.oname);if(o)o.name=el.value;}
  if(el.closest&&el.closest('#hdr'))syncHeader();
});
document.addEventListener('change',e=>{if(e.target.id==='auto'&&S.draft){S.draft.auto=e.target.checked;}});
render();
