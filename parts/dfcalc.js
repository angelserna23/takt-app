// ===== DIAGRAMA DE FLUJO DE PROCESO · símbolos ASME (lógica pura) =====
// Nodo: {id, t, desc, resp, tiempo, dist, next, yes, no}. Posiciones en cuadrícula: lay = {rows, cols, pos:{id:[fila,col]}}
const DF_SYM={
  ini:{n:'Inicio / fin',sum:false},
  op:{n:'Operación',sum:true,va:true},
  insp:{n:'Inspección',sum:true},
  tra:{n:'Transporte',sum:true},
  dem:{n:'Demora',sum:true},
  alm:{n:'Almacenamiento',sum:true},
  dec:{n:'Decisión',sum:false}
};
const DF_ORDER=['op','insp','tra','dem','alm'];   // orden del resumen ASME
const dfIsDec=n=>n&&n.t==='dec';
const dfOuts=n=>dfIsDec(n)?[['yes','SÍ'],['no','NO']]:[['next','']];
function dfNode(t){return {id:nid(),t,desc:'',resp:'',tiempo:'',dist:'',next:null,yes:null,no:null};}
function dfGet(d,id){return d.nodes.find(n=>n.id==id);}
function dfUsed(lay,r,c){return Object.values(lay.pos).some(p=>p[0]===r&&p[1]===c);}
// Agrega un símbolo en una casilla; si viene de otro símbolo, lo conecta por la salida indicada (next / yes / no)
function dfAdd(d,t,cell,from,out){const n=dfNode(t);d.nodes.push(n);d.lay.pos[n.id]=cell.slice();dfGrow(d.lay,cell);
  if(from!=null){const f=dfGet(d,from);if(f)f[out||'next']=n.id;}return n;}
function dfGrow(lay,cell){lay.rows=Math.max(lay.rows,cell[0]+1);lay.cols=Math.max(lay.cols,cell[1]+1);}
// Casilla libre sugerida para la salida de un símbolo: SÍ / siguiente abajo, NO a la derecha (si no se puede, a la izquierda)
function dfSlot(d,id,out){const p=d.lay.pos[id];if(!p)return null;const[r,c]=p;
  const cands=out==='no'?[[r,c+1],[r,c-1],[r+1,c+1]]:[[r+1,c],[r,c+1],[r+1,c+1],[r,c-1]];
  for(const[a,b]of cands){if(a<0||b<0)continue;if(!dfUsed(d.lay,a,b))return [a,b];}
  return null;}
// Salidas abiertas de un símbolo (sin conectar). El último «Inicio / fin» sin salida es el fin del proceso.
function dfOpen(d,n){if(n.t==='ini'&&dfIncoming(d,n.id).length)return [];return dfOuts(n).filter(([k])=>n[k]==null).map(([k])=>k);}
function dfIncoming(d,id){const r=[];d.nodes.forEach(n=>dfOuts(n).forEach(([k])=>{if(n[k]==id)r.push([n.id,k]);}));return r;}
function dfEdges(d){const e=[];d.nodes.forEach(n=>dfOuts(n).forEach(([k,l])=>{if(n[k]!=null&&dfGet(d,n[k]))e.push({from:n.id,to:n[k],out:k,label:l});}));return e;}
function dfRemove(d,id){d.nodes=d.nodes.filter(n=>n.id!=id);d.nodes.forEach(n=>['next','yes','no'].forEach(k=>{if(n[k]==id)n[k]=null;}));delete d.lay.pos[id];}
function dfMoveTo(lay,id,cell){lay.pos[id]=cell.slice();dfGrow(lay,cell);}
function dfSwap(lay,a,b){const t=lay.pos[a];lay.pos[a]=lay.pos[b];lay.pos[b]=t;}
// Inicio del proceso: el primer «Inicio / fin» sin entradas; si no hay, el primer símbolo sin entradas
function dfStart(d){const noIn=d.nodes.filter(n=>!dfIncoming(d,n.id).length);return noIn.find(n=>n.t==='ini')||noIn[0]||d.nodes[0]||null;}
// Orden del proceso: recorrido desde el inicio siguiendo siguiente → SÍ → NO; luego lo que quedó suelto
function dfOrder(d){const seen=new Set(),out=[];const walk=id=>{const n=dfGet(d,id);if(!n||seen.has(n.id))return;seen.add(n.id);out.push(n);dfOuts(n).forEach(([k])=>{if(n[k]!=null)walk(n[k]);});};
  const s=dfStart(d);if(s)walk(s.id);d.nodes.forEach(n=>{if(!seen.has(n.id))walk(n.id);});return out;}
// Resumen ASME: cantidad, tiempo y distancia por símbolo (sin inicio/fin ni decisiones)
function dfSummary(d){const rows=DF_ORDER.map(t=>{const ns=d.nodes.filter(n=>n.t===t);return {t,n:ns.length,tiempo:ns.reduce((a,x)=>a+num(x.tiempo),0),dist:ns.reduce((a,x)=>a+num(x.dist),0)};});
  const act=rows.reduce((a,r)=>a+r.n,0),tiempo=rows.reduce((a,r)=>a+r.tiempo,0),dist=rows.reduce((a,r)=>a+r.dist,0);const op=rows[0];
  return {rows,act,tiempo,dist,dec:d.nodes.filter(dfIsDec).length,pctOp:act?op.n/act:0,pctOpT:tiempo?op.tiempo/tiempo:0};}
// Avisos: símbolos sin acción, decisiones sin sus dos caminos, símbolos sueltos
function dfWarn(d){const w=[];const s=dfStart(d);
  d.nodes.forEach(n=>{if(!String(n.desc).trim())w.push([n.id,'sin acción escrita']);
    if(dfIsDec(n)){if(n.yes==null)w.push([n.id,'decisión sin camino SÍ']);if(n.no==null)w.push([n.id,'decisión sin camino NO']);}
    else if(n.t!=='ini'&&n.next==null)w.push([n.id,'no tiene siguiente paso']);
    if(s&&n!==s&&!dfIncoming(d,n.id).length)w.push([n.id,'nadie llega a este símbolo']);});
  return w;}
// Ruta de la flecha en escuadra (solo tramos horizontales y verticales) entre dos casillas.
// geo: {cx(c), cy(r), W, H, G}. Devuelve los puntos de la polilínea.
function dfPath(a,b,out,g){const[ra,ca]=a,[rb,cb]=b;const ax=g.cx(ca)+g.W/2,ay=g.cy(ra)+g.H/2,bx=g.cx(cb)+g.W/2,by=g.cy(rb)+g.H/2;const hw=g.W/2,hh=g.H/2;
  if(ca===cb&&rb>ra&&out==='no'){const lane=g.cx(ca)+g.W+g.G/2;return [[ax+hw,ay],[lane,ay],[lane,by],[bx+hw,by]];}   // NO hacia abajo: rodea por la derecha
  if(ca===cb&&rb>ra)return [[ax,ay+hh],[bx,by-hh]];                             // abajo en la misma columna
  if(ra===rb&&cb!==ca){const s=cb>ca?1:-1;return [[ax+s*hw,ay],[bx-s*hw,by]];}   // misma fila
  if(rb>ra){if(out==='no'){const s=cb>ca?1:-1;return [[ax+s*hw,ay],[bx,ay],[bx,by-hh]];}   // NO: primero de lado y luego baja
    const my=g.cy(ra)+g.H+g.G/2;return [[ax,ay+hh],[ax,my],[bx,my],[bx,by-hh]];}           // baja, cruza y entra por arriba
  // regreso hacia arriba (retrabajo): sale por la derecha, sube por el pasillo y entra por la derecha
  const lane=Math.max(g.cx(ca),g.cx(cb))+g.W+g.G/2;return [[ax+hw,ay],[lane,ay],[lane,by],[bx+hw,by]];}
