#!/usr/bin/env node
// Cobertura del inglés (prueba estática): encuentra los textos en español de index.html que el diccionario no traduce.
// Lee el JavaScript con un analizador real (acorn), así distingue un texto de pantalla de un selector o una clave.
//   node tools/i18n_faltantes.js                 → todos; sale con 1 si falta alguno
//   node tools/i18n_faltantes.js --modulo ws     → solo el módulo (prefijo de la función que lo pinta: ws, ds, st, mm, sm,
//                                                  tk, hs, sp, df, pc, at, ec, in, rep, tut, store, ub, comun…)
//   node tools/i18n_faltantes.js --lista         → además imprime cada texto con su módulo (para llenar i18n/*.txt)
// Cubierto = el diccionario lo cambia, o todas sus palabras son neutras (i18n/neutras.txt: siglas, nombres en inglés, unidades).
// Lo que se arma con ${…} se prueba poniendo «7» en cada hueco: así se ve si hace falta una plantilla.
const fs=require('fs'),path=require('path');
const R=path.join(__dirname,'..');
const acorn=require(path.join(__dirname,'node_modules','acorn'));const walk=require(path.join(__dirname,'node_modules','acorn-walk'));
const html=fs.readFileSync(path.join(R,'index.html'),'utf8');
const args=process.argv.slice(2);const MOD=args.includes('--modulo')?args[args.indexOf('--modulo')+1]:null;const LISTA=args.includes('--lista');

// ---- motor y diccionario, tal como están en index.html ----
const pure=html.match(/\/\/ <i18n-pure>[^\n]*\n([\s\S]*?)\/\/ <\/i18n-pure>/)[1];
const {trMake}=new Function(pure+';return {trMake};')();
const dic=JSON.parse(html.match(/\/\*<i18n-dic>\*\/([\s\S]*?)\/\*<\/i18n-dic>\*\//)[1]);
const tpl=JSON.parse(html.match(/\/\*<i18n-tpl>\*\/([\s\S]*?)\/\*<\/i18n-tpl>\*\//)[1]);
const tr=trMake(dic,tpl);
const MK='\u0002';const trM=trMake(Object.fromEntries(Object.entries(dic).map(([k,v])=>[k,MK+v])),tpl.map(([a,b])=>[a,MK+b]));
const NEUTRAS=new Set(fs.readFileSync(path.join(R,'i18n','neutras.txt'),'utf8').split('\n').map(l=>l.replace(/#.*/,'').trim()).filter(Boolean).map(w=>w.toLowerCase()));
const IGNORA=new Set(fs.readFileSync(path.join(R,'i18n','ignora.txt'),'utf8').split('\n').map(l=>l.replace(/^#.*/,'').trim()).filter(Boolean));

// ---- qué es texto de pantalla ----
const HOLE='\u0001',PLUR='\u0003',OPT='\u0004';
const hasWord=s=>/\p{L}{2,}/u.test(s);
const looksCode=s=>/^[a-z-]+:[^ ]|;$|^\[data-|^[a-z]{2}-[A-Z]{2}$|^&\w+;$|\{x\}px$|^[#.\[:@]|^[a-z][a-zA-Z0-9]*$|^[a-z0-9-]+$|^[a-z]+[A-Z]|=>|&&|\|\||^\w+\(|^--|^\d|^(https?:|data:|#)|^[A-Z][A-Z0-9_]+$/.test(s)&&!/[áéíóúñ¿¡«»]/i.test(s);
const words=s=>(s.match(/[\p{L}][\p{L}'’-]*/gu)||[]);
const neutral=s=>words(s).every(w=>NEUTRAS.has(w.toLowerCase())||w.length===1);
// Funciones/métodos cuyos argumentos de texto no se ven en pantalla
const NOUI=new Set(['querySelector','querySelectorAll','closest','matches','getElementById','addEventListener','removeEventListener','getAttribute','removeAttribute','hasAttribute','toggleAttribute','warn','log','error','info','debug','createElement','createElementNS','createTreeWalker','objectStore','transaction','put','get','delete','open','toLocaleString','toLocaleDateString','toLocaleTimeString','toLocaleUpperCase','toLocaleLowerCase','localeCompare','toggle','add','remove','contains','replace','split','join','startsWith','endsWith','includes','indexOf','padStart','match','test','dispatchEvent','postMessage','insertAdjacentHTML','scrollTo','storeTx','storeReq','go','route','svg','matchMedia','getPropertyValue','setProperty','Error']);
const NOUI_PROP=new Set(['toca','señala','ir','en','escribe','elige','serie','sel','id','grupo','key','kind','cls','class','icon','t','tipo','k','c','col','color','fill','go','ok','w','h','ancho','alto','unit','u','fmt']);
// Bloques que no son interfaz
const cut=(s,a,b,v)=>{const i=s.indexOf(a);if(i<0)return s;const j=s.indexOf(b,i);const mid=s.slice(i,j+b.length);return s.slice(0,i)+v+mid.replace(/[^\n]/g,'').padEnd(0)+' '.repeat(Math.max(0,mid.replace(/\n/g,'').length-v.length))+s.slice(j+b.length);};
let js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
js=cut(js,'/*<semilla>*/','/*</semilla>*/','null');js=cut(js,'/*<i18n-dic>*/','/*</i18n-dic>*/','{}');js=cut(js,'/*<i18n-tpl>*/','/*</i18n-tpl>*/','[]');
const jsOffsetLine=html.slice(0,html.indexOf('<script>')+8).split('\n').length-1;

const found=[];// {s, mod, line, hole}
function addHtmlish(str,mod,line){
  // separa etiquetas: texto entre etiquetas y atributos visibles
  const tagRe=/<[^<>]*>/g;let last=0,m;
  const pushText=t=>{t=t.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
    if(!t||!hasWord(t.split(HOLE).join(' ')))return;found.push({s:t,mod,line});};
  while((m=tagRe.exec(str))){pushText(str.slice(last,m.index));last=m.index+m[0].length;
    const tag=m[0];if(/^<(style|script)/i.test(tag))continue;
    const am=tag.matchAll(/\b(placeholder|aria-label|title|alt)="([^"]*)"/g);for(const a of am)pushText(a[2]);}
  pushText(str.slice(last));}
const fnName=anc=>{for(let i=anc.length-1;i>=0;i--){const n=anc[i];
  if(n.type==='FunctionDeclaration'&&n.id&&anc.slice(0,i).filter(x=>/Function/.test(x.type)).length<=1)return n.id.name;
  if(n.type==='VariableDeclarator'&&n.id&&n.id.name&&anc.slice(0,i).filter(x=>/Function/.test(x.type)).length<=1)return n.id.name;}
  return '';};
const modOf=name=>{if(!name)return 'comun';if(/^TUT/.test(name))return 'tut';if(/^[A-Z][A-Z0-9]*_/.test(name))return name.split('_')[0].toLowerCase();if(/^[A-Z][A-Z0-9]*$/.test(name))return ({TUTS:'tut',REP:'rep',FORMATS:'comun',NAV:'comun',TEMPLATE:'ws'})[name]||name.toLowerCase();
  if(/^v[A-Z]/.test(name)){const r=name.slice(1);if(/^(Config|Estudios|Pending|Nuevo)/.test(r))return r==='Nuevo'?'ws':'comun';if(/^Aprende/.test(r))return 'tut';return r.replace(/List$/,'').replace(/^([A-Z]+)(?=[A-Z][a-z]|$)/,'$1').toLowerCase().replace(/^inicio.*/,'in');}
  const m=name.match(/^([a-z]+)/);const p=m?m[1]:'comun';
  return ({set:'comun',render:'comun',ask:'comun',close:'comun',sync:'comun',enter:'ws',calc:'ws',precision:'ws',default:'ws',op:'ws',cur:'ws',lang:'comun',seed:'comun',section:'comun',ubic:'ub',per:'ds',prob:'st',cause:'st',money:'comun',pdf:'rep',drag:'comun',stack:'comun',mmd:'mm',dfd:'df',f:'comun',fmt:'comun',foot:'comun',blank:'comun',num:'comun',is:'comun',hoy:'comun',h:'comun',n:'comun',new:'comun',add:'comun',clone:'comun',cat:'st',palette:'ws',prec:'ws',route:'comun',go:'comun',esc:'comun',svg:'comun'})[p]||p;};


const DONE=new Set();
// ¿El hueco ${…} pinta HTML (ícono, botón, lista)? Entonces es frontera de etiqueta, no parte de la frase.
const HTMLFN=/^(svg|ud|pdfBig|pdfBtn|v[A-Z]|rep[A-Z])|Btn|btn|Card|card|Html|html|Svg|Chart|chart|Row|row|Tbl|tbl|Table|Kpi|kpi|Leg|Chip|chip|Ico|ico|Sel|Bars|bars|Head|Graf|graf|Yama|yama|Tabs|tabs|Steps|steps|Bar$|Map$/;
function isHtml(e){if(!e)return false;
  if(e.type==='CallExpression'){const c=e.callee;const nm=c.type==='MemberExpression'?(c.property.name||''):c.name||'';
    if(nm==='join'||nm==='map')return true;if(HTMLFN.test(nm))return true;return false;}
  if(e.type==='ConditionalExpression')return isHtml(e.consequent)||isHtml(e.alternate)||hasTag(e.consequent)||hasTag(e.alternate);
  if(e.type==='LogicalExpression')return isHtml(e.right)||hasTag(e.right)||isHtml(e.left);
  if(e.type==='TemplateLiteral')return hasTag(e);
  if(e.type==='BinaryExpression')return hasTag(e);
  if(e.type==='Identifier')return /html|Html|svg|Svg|btn|Btn|body|rows|cards|items|tabs|bars|leg|hdr|foot|ico|chips|opts|cells/i.test(e.name);
  return false;}
function hasTag(e){if(!e)return false;if(e.type==='Literal')return typeof e.value==='string'&&/<\/?[a-z]/i.test(e.value);
  if(e.type==='TemplateLiteral')return e.quasis.some(q=>/<\/?[a-z]/i.test(q.value.raw));
  if(e.type==='BinaryExpression')return hasTag(e.left)||hasTag(e.right);if(e.type==='ConditionalExpression')return hasTag(e.consequent)||hasTag(e.alternate);return false;}
function holeOf(e){if(isHtml(e))return '<h>';
  if(e.type==='ConditionalExpression'){const a=e.consequent,b=e.alternate;const lit=x=>x.type==='Literal'&&typeof x.value==='string';
    if(lit(a)&&lit(b)&&a.value.length<=3&&b.value.length<=3&&/^[a-z]*$/.test(a.value+b.value))return PLUR;
    if((lit(a)&&a.value==='')||(lit(b)&&b.value===''))return OPT;}
  if(e.type==='LogicalExpression'&&e.operator==='&&')return OPT;
  return HOLE;}
function flat(n){if(n.type==='Literal')return typeof n.value==='string'?n.value:HOLE;
  if(n.type==='TemplateLiteral'){let o='';n.quasis.forEach((q,i)=>{o+=q.value.cooked==null?q.value.raw:q.value.cooked;const e=n.expressions[i];if(e)o+=holeOf(e);});return o;}
  if(n.type==='BinaryExpression'&&n.operator==='+')return flat(n.left)+flat(n.right);
  return holeOf(n);}
const ast=acorn.parse(js,{ecmaVersion:'latest',locations:true});
walk.fullAncestor(ast,(node,_s,anc)=>{
  if(node.type!=='Literal'&&node.type!=='TemplateLiteral')return;
  const parent=anc[anc.length-2],gp=anc[anc.length-3];
  if(node.type==='Literal'&&typeof node.value!=='string')return;
  if(parent&&parent.type==='TaggedTemplateExpression')return;
  // contexto que no se ve
  if(parent&&parent.type==='Property'&&parent.key===node)return;
  if(parent&&parent.type==='Property'&&parent.value===node){const k=parent.key.name||parent.key.value;if(NOUI_PROP.has(k))return;}
  if(parent&&parent.type==='MemberExpression'&&parent.property===node)return;
  if(parent&&parent.type==='BinaryExpression'&&/^[!=]==?$/.test(parent.operator))return;
  if(parent&&parent.type==='SwitchCase')return;
  if(parent&&parent.type==='ImportDeclaration')return;
  const call=[parent,gp].find(x=>x&&(x.type==='CallExpression'||x.type==='NewExpression'));
  if(call){const c=call.callee;const nm=c.type==='MemberExpression'?(c.property.name||c.property.value):c.name;
    if(NOUI.has(nm)&&!(nm==='replace'&&call.arguments[1]===node))return;
    if(nm==='setAttribute'&&call.arguments[0]===node)return;}
  const line=node.loc.start.line+jsOffsetLine;const mod=modOf(fnName(anc));
  // concatenaciones 'a'+x+'b': se revisa la frase completa una sola vez, con huecos
  let root=node;for(let i=anc.length-2;i>=0&&anc[i].type==='BinaryExpression'&&anc[i].operator==='+';i--)root=anc[i];
  if(root!==node){if(DONE.has(root))return;DONE.add(root);}
  let str=flat(root);
  if(!/[<>]/.test(str)&&/^\s*[\w-]+(="|\s|$)/.test(str)&&/[\w-]+="/.test(str)){addHtmlish('<x '+str+'>',mod,line);return;}
  if(root.type==='Literal'&&!/[<>]/.test(str)){const t=str.replace(/\s+/g,' ').trim();if(!hasWord(t)||looksCode(t))return;found.push({s:t,mod,line});return;}
  addHtmlish(str,mod,line);
});
// HTML fijo (antes del <script>)
const pre=html.slice(0,html.indexOf('<script>')).replace(/<style[\s\S]*?<\/style>/g,'');
addHtmlish(pre,'comun',1);

// ---- evaluar ----
const seen=new Map();
for(const f of found){
  let s=f.s;if(IGNORA.has(s.split(HOLE).join('{x}')))continue;
  // pedazos con huecos: cada pedazo con texto debe estar cubierto, o el conjunto (con 7 en los huecos) por una plantilla
  // instancia de prueba: «7» en cada hueco; un hueco pegado a una palabra es plural (operador{x} → operador / operadores)
  const mk=pl=>s.replace(/\u0004/g,'').replace(/\u0003/g,pl).split(HOLE).join('7').replace(/\s+/g,' ').trim();
  const inst=mk(''),inst2=s.includes(PLUR)?mk(/[aeiouáéíóú]\u0003/i.test(s)?'s':'es'):inst;
  if(!hasWord(inst.replace(/\d/g,'')))continue;
  const key=s.split(HOLE).join('{x}').replace(/\u0003/g,'{s}').replace(/\u0004/g,'{?}');
  if(seen.has(key))continue;
  const okI=i=>tr(i)!==i||trM(i).includes(MK)||neutral(i);
  const ok=okI(inst)&&(inst2===inst||okI(inst2));
  seen.set(key,{...f,key,ok});
}
let falt=[...seen.values()].filter(x=>!x.ok&&(!MOD||x.mod===MOD));
falt.sort((a,b)=>a.line-b.line);
const total=[...seen.values()].filter(x=>!MOD||x.mod===MOD).length;
if(LISTA||falt.length<=60)falt.forEach(x=>console.log(`${x.mod}\t${x.line}\t${x.key}`));
const porMod={};falt.forEach(x=>porMod[x.mod]=(porMod[x.mod]||0)+1);
console.log(`\n${falt.length} de ${total} textos sin traducción${MOD?' en '+MOD:''}`+(falt.length?' · por módulo: '+Object.entries(porMod).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(', '):''));
process.exit(falt.length?1:0);
