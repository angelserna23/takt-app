function syncHeader(){const f=document.getElementById('hdr');if(!f||!S.draft)return;new FormData(f).forEach((v,k)=>S.draft[k]=v);}
function enter(id){const d=S.draft;S.opId=+id;const op=curOp();S.view=op.status==='listo'?'res':op.status==='conteo'?'count':'acts';render();}

document.addEventListener('click',e=>{
  const t=e.target.closest('button,a');if(!t||t.disabled)return;const d=S.draft;
  if(t.dataset.go){ if(t.dataset.go==='ws-nuevo'){newDraft();} go(t.dataset.go);return;}
  if(t.dataset.open){S.draft=S.studies.find(x=>x.id==t.dataset.open);S.view='hub';S.opId=null;go('ws-nuevo');return;}
  if(t.dataset.wsv){
    syncHeader();const v=t.dataset.wsv;const op=curOp();
    if(v==='hub'){if(!d.titulo)d.titulo='Estudio sin título';if(!d.ops.length)addOp();if(!S.studies.includes(d))S.studies.unshift(d);}
    if(v==='count'&&op&&op.status==='nuevo')op.status='conteo';
    if(v==='res'&&op)op.status='listo';
    S.view=v;render();return;}
  if(t.dataset.enter){enter(t.dataset.enter);return;}
  if(t.dataset.addop){const prev=curOp()||d.ops[d.ops.length-1];const op=addOp(prev);enter(op.id);return;}
  if(t.dataset.finish){d.estado='Cerrado';S.draft=null;S.opId=null;go('ws');return;}
  const op=curOp();
  if(t.id==='addact'&&op){op.acts.push({id:nid(),name:'Nueva actividad',nec:true});render();return;}
  if(t.dataset.adel&&op){const id=+t.dataset.adel;op.acts=op.acts.filter(a=>a.id!==id);delete op.counts[id];op.log=op.log.filter(l=>l!==id);render();return;}
  if(t.dataset.anec&&op){const a=op.acts.find(x=>x.id==t.dataset.anec);a.nec=t.dataset.v==='1';render();return;}
  if(t.dataset.tap&&op){const id=+t.dataset.tap;op.counts[id]=(op.counts[id]||0)+1;op.log.push(id);
    if(navigator.vibrate)try{navigator.vibrate(15)}catch(_){}
    S.keep=true;render(true);S.keep=false;const b=document.querySelector(`[data-tap="${id}"]`);if(b)b.classList.add('pulse');return;}
  if(t.id==='undo'&&op){const id=op.log.pop();if(id!=null)op.counts[id]--;S.keep=true;render(true);S.keep=false;return;}
  if(t.id==='collapse'){document.getElementById('app').classList.toggle('collapsed');return;}
});
document.addEventListener('input',e=>{
  const el=e.target;const op=curOp();
  if(el.dataset.aname&&op){const a=op.acts.find(x=>x.id==el.dataset.aname);if(a)a.name=el.value;}
  if(el.dataset.oname&&op){op.name=el.value;}
  if(el.closest&&el.closest('#hdr'))syncHeader();
});
render();
