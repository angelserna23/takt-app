// Pruebas del buscador del encabezado: lee las funciones puras directo de index.html (bloque <srch-pure>).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <srch-pure>[^\n]*\n([\s\S]*?)\/\/ <\/srch-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <srch-pure> en index.html');process.exit(1);}
const {srchNorm,srchText,srchRank,SRCH_MAX}=new Function(m[1]+';return {srchNorm,srchText,srchRank,SRCH_MAX};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};

// 1. Normalizar: sin acentos, sin mayúsculas, espacios simples
ok(srchNorm('  Línea   ÚNICA Ñandú ')==='linea unica nandu','quita acentos, mayúsculas y espacios de más');
ok(srchNorm(null)===''&&srchNorm(42)==='42','valores raros no truenan');

// 2. Texto de un estudio: junta los textos de adentro (operaciones, pasos…), sin IDs, fechas ni números sueltos
const d={id:1001,_uuid:'abc-123',titulo:'ESTUDIO A',fecha:'2026-10-05',ubic:{planta:'p1'},
  ops:[{id:1002,nombre:'COLOCAR TORNILLOS',t:[0.5,0.6]},{id:1003,nombre:'APRETAR'}],nota:'',deep:{a:{b:{c:{d:{e:{f:'MUY ADENTRO'}}}}}}};
const t=srchNorm(srchText(d));
ok(t.includes('colocar tornillos')&&t.includes('apretar'),'incluye las operaciones');
ok(!t.includes('abc-123')&&!t.includes('2026-10-05')&&!t.includes('1002')&&!t.includes('0.5'),'no incluye UUID, fechas ni números');
ok(!t.includes('muy adentro'),'no baja más de 5 niveles (evita recorrer basura)');
const big={ops:Array.from({length:5000},(_,i)=>({nombre:'OPERACION LARGA NUMERO '+'X'.repeat(30)}))};
ok(srchText(big).length<=20000,'texto acotado aunque el estudio sea enorme');

// 3. Ordenar resultados
const items=[
  {key:'a',name:'BALANCEO LÍNEA DE POLEAS',ubic:'PLANTA NORTE › ENSAMBLE › LÍNEA 1',who:'AS',fmt:'takt y balanceo takt line balancing',text:'estacion 1 colocar'},
  {key:'b',name:'ESTUDIO PRENSA',ubic:'PLANTA SUR › ESTAMPADO › LÍNEA 1',who:'JP',fmt:'smed',text:'colocar dado nuevo aflojar tornillos'},
  {key:'c',name:'POLEAS TURNO 2',ubic:'PLANTA NORTE › MAQUINADO › M1',who:'AS',fmt:'work element',text:'tornear'},
  {key:'d',name:'OTRO',ubic:'PLANTA SUR',who:'',fmt:'work sampling',text:'poleas en el rack'}];
const R=q=>srchRank(q,items).map(r=>r.key).join('');
ok(R('')===''&&R('   ')==='','búsqueda vacía: sin resultados');
ok(R('poleas')==='acd','coincidencia en el nombre primero; en contenido al final');
ok(R('POLEÁS')==='acd','sin importar acentos ni mayúsculas');
ok(R('norte poleas')==='ac','todas las palabras deben aparecer (en cualquier campo)');
ok(R('linea 1')==='ab','ubicación cuenta');
ok(R('smed')==='b','tipo de formato cuenta');
ok(R('line balancing')==='a','tipo de formato en inglés también cuenta');
ok(R('tornillos')==='b','operaciones de adentro cuentan');
ok(R('zzz')==='','sin coincidencia: nada');
const r1=srchRank('tornillos',items)[0];
ok(r1.hit==='colocar dado nuevo aflojar tornillos','si coincide adentro, dice en qué texto (tal como está escrito)');
ok(srchRank('poleas',items)[0].hit===null,'si coincide en el nombre, no hace falta decir dónde');
const many=Array.from({length:30},(_,i)=>({key:'k'+i,name:'LINEA '+i,ubic:'',who:'',fmt:'',text:''}));
ok(srchRank('linea',many).length===30&&SRCH_MAX===8,'regresa todos; la pantalla muestra los primeros 8');
ok(srchRank('linea',many)[0].key==='k0','empate: se respeta el orden de entrada');

if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: buscador, '+n+' casos pasan (normalizar, texto del estudio, orden de resultados)');
