// Pruebas de Configuración (perfil, empresa, preferencias): lee las funciones puras de index.html (bloque <cfg-pure>).
const fs=require('fs'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const m=html.match(/\/\/ <cfg-pure>[^\n]*\n([\s\S]*?)\/\/ <\/cfg-pure>/);
if(!m){console.error('FALLA: no se encontró el bloque <cfg-pure> en index.html');process.exit(1);}
const {cfgIniciales,cfgNombre,cfgCompleto,cfgCorreoOk,cfgClean,cfgMios,CFG_DEF}=new Function(m[1]+';return {cfgIniciales,cfgNombre,cfgCompleto,cfgCorreoOk,cfgClean,cfgMios,CFG_DEF};')();
let fails=0,n=0;const ok=(c,msg)=>{n++;if(!c){fails++;console.error('FALLA:',msg);}};

// 1. Iniciales y nombre completo
ok(cfgIniciales({nombre:'Angel',apellidos:'Serna Hernández'})==='AS','iniciales: primer nombre + primer apellido');
ok(cfgIniciales({nombre:'  josé luis ',apellidos:'  ñuñez '})==='JÑ','iniciales en mayúsculas, sin espacios, con ñ');
ok(cfgIniciales({nombre:'Ana',apellidos:''})==='A'&&cfgIniciales({nombre:'',apellidos:''})==='','sin apellido: una letra; vacío: nada');
ok(cfgNombre({nombre:' angel  ',apellidos:'serna   hernández'})==='ANGEL SERNA HERNÁNDEZ','nombre completo en MAYÚSCULAS y espacios simples');
ok(cfgNombre({})==='','nombre vacío');

// 2. Correo
ok(cfgCorreoOk('angel@empresa.com')&&cfgCorreoOk('a.b-c@sub.empresa.com.mx'),'correos válidos');
ok(!cfgCorreoOk('angel@')&&!cfgCorreoOk('angel empresa.com')&&!cfgCorreoOk('@x.com')&&!cfgCorreoOk('a@b'),'correos inválidos');
ok(cfgCorreoOk(''),'correo vacío no es error (es opcional)');

// 3. Avance del perfil: 7 datos; dice qué falta, en orden
const P={nombre:'ANGEL',apellidos:'SERNA',correo:'a@b.com',puesto:'ING. INDUSTRIAL',planta:'p1'},E={nombre:'ACME',logo:'data:image/png;base64,AAA'};
const c1=cfgCompleto(P,E);ok(c1.pct===100&&c1.faltan.length===0,'perfil completo: 100 %');
const c2=cfgCompleto({nombre:'ANGEL'},{});ok(c2.pct===14&&c2.faltan.join(',')==='apellidos,correo,puesto,planta,empresa,logo','solo nombre: 14 % y lista lo que falta');
const c3=cfgCompleto({...P,correo:'malo@'},E);ok(c3.faltan.includes('correo')&&c3.pct===86,'un correo inválido cuenta como faltante');

// 4. Limpiar lo guardado (lo que venga raro regresa al valor de siempre)
const p=cfgClean('perfil',{nombre:'x'.repeat(200),apellidos:5,correo:'a@b.com',puesto:null,planta:'p1',otro:'basura'});
ok(p.nombre.length===80&&p.apellidos===''&&p.puesto===''&&p.correo==='a@b.com'&&p.planta==='p1'&&!('otro' in p),'perfil: recorta, quita tipos raros y campos desconocidos');
ok(JSON.stringify(cfgClean('perfil',null))===JSON.stringify(CFG_DEF.perfil),'perfil vacío: valores de siempre');
const e1=cfgClean('empresa',{nombre:'ACME',logo:'javascript:alert(1)'});ok(e1.nombre==='ACME'&&e1.logo==='','logo que no es imagen: se descarta');
ok(cfgClean('empresa',{logo:'data:image/png;base64,'+'A'.repeat(500000)}).logo==='','logo de más de 400 KB: se descarta');
ok(cfgClean('empresa',{logo:'data:image/svg+xml;base64,PHN2Zz4='}).logo==='','logo SVG: se descarta (puede traer código)');
ok(cfgClean('empresa',{logo:'data:image/jpeg;base64,/9j/'}).logo.startsWith('data:image/jpeg'),'logo JPG válido se conserva');
const f=cfgClean('prefs',{hoja:'a4',miAnalista:false,recordar:'si'});ok(f.hoja==='a4'&&f.miAnalista===false&&f.recordar===true,'preferencias: valores válidos se respetan; los raros, por defecto');
ok(cfgClean('prefs',{hoja:'oficio'}).hoja==='carta','hoja desconocida: carta');
ok(CFG_DEF.prefs.miAnalista===true&&CFG_DEF.prefs.recordar===true&&CFG_DEF.prefs.hoja==='carta','valores de siempre de preferencias');

// 5. Mis estudios: el analista coincide con mi nombre (sin acentos ni mayúsculas; acepta nombre + primer apellido)
const L=[{who:'ANGEL SERNA HERNÁNDEZ'},{who:'angel serna'},{who:'Ángel Serna'},{who:'A. SERNA'},{who:'R. TORRES'},{who:''}];
ok(cfgMios({nombre:'Angel',apellidos:'Serna Hernández'},L)===3,'cuenta mis estudios con variantes de mi nombre');
ok(cfgMios({nombre:'',apellidos:''},L)===0,'sin nombre: cero (no cuenta los vacíos)');

// 5b. Foto de perfil (opcional): solo imagen JPG/PNG/WebP de hasta 150 KB; no cuenta en el avance
ok(cfgClean('perfil',{foto:'data:image/jpeg;base64,/9j/AAA'}).foto.startsWith('data:image/jpeg'),'foto JPG válida se conserva');
ok(cfgClean('perfil',{foto:'data:image/jpeg;base64,'+'A'.repeat(200000)}).foto==='','foto de más de 150 KB: se descarta');
ok(cfgClean('perfil',{foto:'https://sitio.com/yo.jpg'}).foto===''&&cfgClean('perfil',{foto:'data:image/svg+xml;base64,PHN2Zz4='}).foto==='','foto que no es imagen embebida o es SVG: se descarta');
ok(cfgCompleto({...P,foto:''},E).pct===100,'sin foto el perfil puede llegar a 100 % (es opcional)');
// 6. Los valores iniciales escritos en la pantalla (antes del bloque puro) son iguales a CFG_DEF
const lit=html.match(/const PERFIL=(\{[^}]*\}),EMPRESA=(\{[^}]*\}),PREFS=(\{[^}]*\});/);
ok(lit&&['perfil','empresa','prefs'].every((k,i)=>JSON.stringify(new Function('return '+lit[i+1])())===JSON.stringify(CFG_DEF[k])),'valores iniciales de PERFIL/EMPRESA/PREFS = CFG_DEF (no se desfasan)');
if(fails){console.error(fails+' fallas de '+n);process.exit(1);}
console.log('OK: configuración, '+n+' casos pasan (iniciales, correo, avance del perfil, limpieza, mis estudios)');
